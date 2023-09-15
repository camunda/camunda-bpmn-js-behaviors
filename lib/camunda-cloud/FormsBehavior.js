import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { createElement } from '../util/ElementUtil';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  createUserTaskFormId,
  getFormDefinition,
  getRootElement,
  getUserTaskForm,
  userTaskFormIdToFormKey
} from './util/FormsUtil';


/**
 * Zeebe BPMN specific forms behavior.
 */
export default class FormsBehavior extends CommandInterceptor {
  constructor(bpmnFactory, eventBus, modeling) {
    super(eventBus);

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

      const rootExtensionElements = rootElement.get('extensionElements');

      const values = rootExtensionElements.get('values').filter((element) => {
        return element !== userTaskForm;
      });

      modeling.updateModdleProperties(shape, rootExtensionElements, { values });
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

  }
}

FormsBehavior.$inject = [
  'bpmnFactory',
  'eventBus',
  'modeling'
];