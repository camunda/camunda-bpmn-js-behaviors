import { isUndefined, without } from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { createElement } from '../util/ElementUtil';
import { getExtensionElementsList } from '../util/ExtensionElementsUtil';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  createUserTaskFormId,
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
  constructor(bpmnFactory, eventBus, modeling) {
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

    /**
     * Remove zeebe:UserTaskForm on user task removed.
     */
    this.postExecute('shape.delete', function(context) {
      const {
        oldParent,
        shape
      } = context;

      const rootElement = getRootElement(oldParent);

      const userTaskForm = getUserTaskForm(shape, { rootElement });

      if (!is(shape, 'bpmn:UserTask') || !userTaskForm) {
        return;
      }

      removeUserTaskForm(shape, rootElement, userTaskForm);
    }, true);


    /**
     * Create new zeebe:FormDefinition and zeebe:UserTaskForm on user task created.
     */
    this.postExecute('shape.create', function(context) {
      const { shape } = context;

      const oldFormDefinition = getFormDefinition(shape);

      if (!is(shape, 'bpmn:UserTask') || !oldFormDefinition) {
        return;
      }

      const oldUserTaskForm = getUserTaskForm(shape);

      const rootElement = getRootElement(shape);

      const businessObject = getBusinessObject(shape);

      const extensionElements = businessObject.get('extensionElements');

      let rootExtensionElements = rootElement.get('extensionElements');

      // (1) ensure extension elements exists
      if (!rootExtensionElements) {
        rootExtensionElements = createElement('bpmn:ExtensionElements', { values: [] }, rootElement, bpmnFactory);

        modeling.updateModdleProperties(shape, rootElement, { extensionElements: rootExtensionElements });
      }

      // (2) remove existing form definition
      let values = extensionElements.get('values').filter((element) => {
        return element !== oldFormDefinition;
      });

      // (3) create new form definition
      const userTaskFormId = createUserTaskFormId();

      const newFormDefinition = createElement('zeebe:FormDefinition', {
        formKey: userTaskFormIdToFormKey(userTaskFormId)
      }, extensionElements, bpmnFactory);

      values = [
        ...values,
        newFormDefinition
      ];

      modeling.updateModdleProperties(shape, extensionElements, {
        values
      });

      // (4) create new user task form
      const userTaskForm = createElement('zeebe:UserTaskForm', {
        id: userTaskFormId,
        body: oldUserTaskForm ? oldUserTaskForm.get('body') : ''
      }, rootExtensionElements, bpmnFactory);

      modeling.updateModdleProperties(shape, rootExtensionElements, {
        values: [
          ...(rootExtensionElements.get('values') || []),
          userTaskForm
        ]
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
