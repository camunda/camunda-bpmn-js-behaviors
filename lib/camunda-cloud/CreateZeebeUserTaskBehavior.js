import { createElement } from '../util/ElementUtil';
import { getZeebeUserTaskElement } from './util/ZeebeUserTaskUtil';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

const HIGH_PRIORITY = 5000;

/**
 * Zeebe BPMN specific behavior for creating user tasks.
 */
export default class CreateZeebeUserTaskBehavior extends CommandInterceptor {
  constructor(bpmnFactory, eventBus, modeling) {
    super(eventBus);

    /**
     * Add zeebe:userTask extension element when creating bpmn:UserTask.
     */
    this.postExecuted(
      [ 'shape.create', 'shape.replace' ],
      HIGH_PRIORITY,
      function(context) {
        const shape = context.shape || context.newShape;
        const isCopy = context.hints && context.hints.createElementsBehavior === false;

        if (!is(shape, 'bpmn:UserTask') || isCopy) {
          return;
        }

        const businessObject = getBusinessObject(shape);

        // Use getZeebeUserTaskElement to check if zeebe:userTask already exists
        let userTaskElement = getZeebeUserTaskElement(businessObject);

        if (!userTaskElement) {
          let extensionElements = businessObject.get('extensionElements');

          if (!extensionElements) {
            extensionElements = createElement(
              'bpmn:ExtensionElements',
              {
                values: [],
              },
              businessObject,
              bpmnFactory
            );

            modeling.updateProperties(shape, { extensionElements });
          }

          userTaskElement = createElement(
            'zeebe:UserTask',
            {},
            extensionElements,
            bpmnFactory
          );

          modeling.updateModdleProperties(shape, extensionElements, {
            values: [ ...(extensionElements.values || []), userTaskElement ],
          });
        }
      },
      true
    );
  }
}

CreateZeebeUserTaskBehavior.$inject = [ 'bpmnFactory', 'eventBus', 'modeling' ];
