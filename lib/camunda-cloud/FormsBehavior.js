import { isUndefined, without } from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { createElement } from '../util/ElementUtil';
import { getExtensionElementsList } from '../util/ExtensionElementsUtil';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

import {
  createUserTaskFormId,
  formKeyToUserTaskFormId,
  getFormDefinition,
  getRootElement,
  getUserTaskForm,
  isUserTaskFormKey,
  userTaskFormIdToFormKey
} from './util/FormsUtil';


/**
 * Zeebe BPMN specific forms behavior.
 */
export default class FormsBehavior extends CommandInterceptor {
  constructor(bpmnFactory, elementRegistry, eventBus, modeling) {
    super(eventBus);

    this._modeling = modeling;

    function removeUserTaskForm(element, moddleElement, userTaskForm) {
      const extensionElements = moddleElement.get('extensionElements');

      const values = without(extensionElements.get('values'), userTaskForm);

      modeling.updateModdleProperties(element, extensionElements, {
        values
      });

      if (!values.length) {
        modeling.updateModdleProperties(element, moddleElement, {
          extensionElements: undefined
        });
      }
    }

    function removeFormDefinition(element, formDefinition) {
      const bo = getBusinessObject(element);
      const extensionElements = bo.get('extensionElements');
      const values = without(extensionElements.get('values'), formDefinition);

      modeling.updateModdleProperties(element, extensionElements, { values });

      if (!values.length) {
        modeling.updateModdleProperties(element, bo, {
          extensionElements: undefined
        });
      }
    }

    /**
     * Remove zeebe:UserTaskForm on user task or start event removed.
     */
    this.postExecute('shape.delete', function(context) {
      const {
        oldParent,
        shape
      } = context;

      const rootElement = getRootElement(oldParent);

      const userTaskForm = getUserTaskForm(shape, { rootElement });

      if ((!is(shape, 'bpmn:UserTask') && !is(shape, 'bpmn:StartEvent')) || !userTaskForm) {
        return;
      }

      removeUserTaskForm(shape, rootElement, userTaskForm);
    }, true);


    /**
     * Clean up form definition when a start event is moved from the root
     * process into a subprocess (forms are only supported on root-level
     * none start events).
     */
    this.postExecuted('shape.move', function(event) {
      const { context } = event;
      const { shape, newParent } = context;

      if (!is(shape, 'bpmn:StartEvent')) {
        return;
      }

      // Only clean up if moved into a subprocess
      if (!is(newParent, 'bpmn:SubProcess')) {
        return;
      }

      const formDefinition = getFormDefinition(shape);

      if (!formDefinition) {
        return;
      }

      const userTaskForm = getUserTaskForm(shape);

      // Clean up embedded form if present
      if (userTaskForm) {
        removeUserTaskForm(shape, getRootElement(shape), userTaskForm);
      }

      removeFormDefinition(shape, formDefinition);
    });


    /**
     * Clean up form definition when a none start event is replaced with
     * a typed start event (message, timer, signal, etc.).
     */
    this.postExecuted('shape.replace', function(event) {
      const { context } = event;
      const { newShape } = context;

      if (!is(newShape, 'bpmn:StartEvent')) {
        return;
      }

      const bo = getBusinessObject(newShape);
      const eventDefinitions = bo.get('eventDefinitions');

      // Only clean up if the new shape has event definitions (not a none start event)
      if (!eventDefinitions || !eventDefinitions.length) {
        return;
      }

      const formDefinition = getFormDefinition(newShape);

      if (!formDefinition) {
        return;
      }

      removeFormDefinition(newShape, formDefinition);
    });


    /**
     * Create and reference new zeebe:UserTaskForm when user task is created
     * that references existing zeebe:UserTaskForm that is already referenced by
     * existing user task.
     */
    this.postExecute('shape.create', function(context) {
      const { shape } = context;

      if (!is(shape, 'bpmn:UserTask')) {
        return;
      }

      const oldFormDefinition = getFormDefinition(shape);

      if (!oldFormDefinition) {
        return;
      }

      const oldUserTaskForm = getUserTaskForm(shape);

      if (!oldUserTaskForm) {
        return;
      }

      const isReferenced = elementRegistry.filter(element => {
        if (element === shape) {
          return false;
        }

        const formDefinition = getFormDefinition(element);

        return formDefinition
          && formDefinition.get('formKey')
          && formKeyToUserTaskFormId(formDefinition.get('formKey')) === oldUserTaskForm.get('id');
      });

      if (!isReferenced.length) {
        return;
      }

      const rootElement = getRootElement(shape);

      let extensionElements = rootElement.get('extensionElements');

      // (1) ensure extension elements exist
      if (!extensionElements) {
        extensionElements = createElement('bpmn:ExtensionElements', {
          values: []
        }, rootElement, bpmnFactory);

        modeling.updateModdleProperties(shape, rootElement, {
          extensionElements
        });
      }

      // (2) create new user task form
      const userTaskFormId = createUserTaskFormId();

      const userTaskForm = createElement('zeebe:UserTaskForm', {
        id: userTaskFormId,
        body: oldUserTaskForm.get('body')
      }, extensionElements, bpmnFactory);

      modeling.updateModdleProperties(shape, extensionElements, {
        values: [
          ...(extensionElements.get('values') || []),
          userTaskForm
        ]
      });

      // (3) reference new user task form
      modeling.updateModdleProperties(shape, oldFormDefinition, {
        formKey: userTaskFormIdToFormKey(userTaskFormId)
      });
    }, true);


    /**
     * Ensure that a user task only has one of the following:
     *
     * 1. zeebe:FormDefinition with zeebe:formId (linked Camunda form)
     * 2. zeebe:FormDefinition with zeebe:formKey in the format of camunda-forms:bpmn:UserTaskForm_1 (embedded Camunda form)
     * 3. zeebe:FormDefinition with zeebe:formKey (custom form)
     * 4. zeebe:FormDefinition with zeebe:externalReference (external form)
     *
     * Furthermore, ensure that:
     *
     * 1. zeebe:bindingType only exists if zeebe:formId is set (linked Camunda form)
     */
    this.preExecute('element.updateModdleProperties', function(context) {
      const {
        moddleElement,
        properties
      } = context;

      if (is(moddleElement, 'zeebe:FormDefinition')) {
        if ('formId' in properties) {
          properties.formKey = undefined;
          properties.externalReference = undefined;
        } else if ('formKey' in properties) {
          properties.formId = undefined;
          properties.externalReference = undefined;
          properties.bindingType = undefined;
        } else if ('externalReference' in properties) {
          properties.formId = undefined;
          properties.formKey = undefined;
          properties.bindingType = undefined;
        }

        if ('bindingType' in properties && !('formId' in properties) && !moddleElement.get('formId')) {
          properties.externalReference = undefined;
          properties.formId = '';
          properties.formKey = undefined;
        }
      }
    }, true);

    /**
     * Clean up user task form after form key or definition is removed. Clean up
     * empty extension elements after form definition is removed.
     */
    this.postExecute('element.updateModdleProperties', function(context) {
      const {
        element,
        moddleElement,
        oldProperties
      } = context;

      if (is(moddleElement, 'zeebe:FormDefinition')) {
        const formKey = moddleElement.get('formKey');

        if (!formKey || !isUserTaskFormKey(formKey)) {
          const userTaskForm = getUserTaskForm(element, { formKey: oldProperties.formKey });

          if (userTaskForm) {
            removeUserTaskForm(element, getRootElement(element), userTaskForm);
          }
        }
      } else if (isExtensionElementRemoved(context, 'zeebe:FormDefinition')) {
        const formDefinition = oldProperties.values.find(value => is(value, 'zeebe:FormDefinition'));

        const userTaskForm = getUserTaskForm(element, { formKey: formDefinition.get('formKey') });

        if (userTaskForm) {
          removeUserTaskForm(element, getRootElement(element), userTaskForm);
        }

        if (!moddleElement.get('values').length) {
          modeling.updateProperties(element, {
            extensionElements: undefined
          });
        }
      }
    }, true);

    this._registerZeebeUserTaskSupport();
  }

  _registerZeebeUserTaskSupport() {

    /**
     * Handle `formKey` for `zeebe:UserTask`.
     * 1. Remove if embedded form is used.
     * 2. Convert to externalReference if custom form key.
     */
    this.postExecute('element.updateModdleProperties', ({ element }) => {

      if (!is(element, 'bpmn:UserTask') || !hasZeebeUserTask(element)) {
        return;
      }

      const formDefinition = getFormDefinition(element);

      if (!formDefinition) {
        return;
      }

      const formKey = formDefinition.get('formKey');

      if (isUndefined(formKey)) {
        return;
      }

      if (isUserTaskFormKey(formKey)) {
        this._modeling.updateModdleProperties(element, formDefinition, { formKey: undefined });
      } else {
        this._modeling.updateModdleProperties(element, formDefinition, {
          externalReference: formKey
        });
      }
    }, true);

    /**
     * Replace `externalReference` with `formKey` for non-`zeebe:UserTask`.
     */
    this.postExecute('element.updateModdleProperties', ({ element }) => {

      if (!is(element, 'bpmn:UserTask') || hasZeebeUserTask(element)) {
        return;
      }

      const formDefinition = getFormDefinition(element);

      if (!formDefinition) {
        return;
      }

      const externalReference = formDefinition.get('externalReference');

      if (isUndefined(externalReference)) {
        return;
      }

      this._modeling.updateModdleProperties(element, formDefinition, {
        externalReference: undefined,
        formKey: externalReference
      });
    }, true);
  }
}

FormsBehavior.$inject = [
  'bpmnFactory',
  'elementRegistry',
  'eventBus',
  'modeling'
];

function isExtensionElementRemoved(context, type) {
  const {
    moddleElement,
    oldProperties,
    properties
  } = context;

  return is(moddleElement, 'bpmn:ExtensionElements')
    && 'values' in oldProperties
    && 'values' in properties
    && oldProperties.values.find(value => is(value, type))
    && !properties.values.find(value => is(value, type));
}

function hasZeebeUserTask(userTask) {
  return getExtensionElementsList(userTask, 'zeebe:UserTask').length;
}
