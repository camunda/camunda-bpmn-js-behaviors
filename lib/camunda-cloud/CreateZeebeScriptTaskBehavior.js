import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { createElement } from '../util/ElementUtil';
import { getExtensionElementsList } from '../util/ExtensionElementsUtil';

const HIGH_PRIORITY = 5000;

/**
 * Zeebe BPMN specific behavior for creating script tasks.
 */
export default class CreateZeebeScriptTaskBehavior extends CommandInterceptor {
  constructor(bpmnFactory, eventBus, modeling) {
    super(eventBus);

    /**
     * Add zeebe:Script extension element when creating bpmn:ScriptTask,
     * defaulting to the FEEL expression implementation.
     */
    this.postExecuted(
      [ 'shape.create', 'shape.replace' ],
      HIGH_PRIORITY,
      function(context) {
        const shape = context.shape || context.newShape;
        const explicitlyDisabled = context.hints && context.hints.createElementsBehavior === false;

        if (!is(shape, 'bpmn:ScriptTask') || explicitlyDisabled) {
          return;
        }

        // Skip if any implementation is already set.
        if (getScript(shape) || getTaskDefinition(shape)) {
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

        const script = createElement(
          'zeebe:Script',
          {},
          extensionElements,
          bpmnFactory
        );

        modeling.updateModdleProperties(shape, extensionElements, {
          values: [ ...(extensionElements.values || []), script ],
        });
      },
      true
    );
  }
}

CreateZeebeScriptTaskBehavior.$inject = [ 'bpmnFactory', 'eventBus', 'modeling' ];


// helpers //////////

function getScript(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:Script')[0] || null;
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0] || null;
}
