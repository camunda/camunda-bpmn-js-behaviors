import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { createElement } from '../util/ElementUtil';
import { getExtensionElementsList } from '../util/ExtensionElementsUtil';

const HIGH_PRIORITY = 5000;

/**
 * Zeebe BPMN specific behavior for creating business rule tasks.
 */
export default class CreateZeebeBusinessRuleTaskBehavior extends CommandInterceptor {
  constructor(bpmnFactory, eventBus, modeling) {
    super(eventBus);

    /**
     * Add zeebe:CalledDecision extension element when creating bpmn:BusinessRuleTask,
     * defaulting to the DMN decision implementation.
     */
    this.postExecuted(
      [ 'shape.create', 'shape.replace' ],
      HIGH_PRIORITY,
      function(context) {
        const shape = context.shape || context.newShape;
        const explicitlyDisabled = context.hints && context.hints.createElementsBehavior === false;

        if (!is(shape, 'bpmn:BusinessRuleTask') || explicitlyDisabled) {
          return;
        }

        // Skip if any implementation is already set.
        if (getCalledDecision(shape) || getTaskDefinition(shape)) {
          return;
        }

        const businessObject = getBusinessObject(shape);
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

        const calledDecision = createElement(
          'zeebe:CalledDecision',
          {},
          extensionElements,
          bpmnFactory
        );

        modeling.updateModdleProperties(shape, extensionElements, {
          values: [ ...(extensionElements.values || []), calledDecision ],
        });
      },
      true
    );
  }
}

CreateZeebeBusinessRuleTaskBehavior.$inject = [ 'bpmnFactory', 'eventBus', 'modeling' ];


// helpers //////////

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:CalledDecision')[0] || null;
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0] || null;
}
