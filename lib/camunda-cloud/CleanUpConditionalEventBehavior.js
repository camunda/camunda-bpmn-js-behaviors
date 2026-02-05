import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { getExtensionElementsList } from '../util/ExtensionElementsUtil';
import { getEventDefinition } from '../util/EventDefinition';

/**
 * Zeebe BPMN behavior ensuring that `variableEvents` property is removed from
 * `zeebe:conditionalFilter` when a conditional event is moved to root level
 * (direct child of bpmn:Process).
 */
export default class CleanUpConditionalEventBehavior extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    this.postExecuted([ 'shape.move', 'shape.create' ], function({ context }) {
      const { shape } = context;
      cleanUpConditionalEvent(shape, modeling);
    });

    this.postExecuted('shape.replace', function({ context }) {
      const { newShape } = context;
      cleanUpConditionalEvent(newShape, modeling);
    });
  }
}

CleanUpConditionalEventBehavior.$inject = [
  'eventBus',
  'modeling'
];


function cleanUpConditionalEvent(element, modeling) {
  if (!is(element, 'bpmn:Event')) {
    return;
  }

  const conditionalEventDefinition = getEventDefinition(element, 'bpmn:ConditionalEventDefinition');

  if (!conditionalEventDefinition) {
    return;
  }

  if (!shouldCleanUpVariableEvents(element)) {
    return;
  }

  const conditionalFilter = getConditionalFilter(conditionalEventDefinition);

  if (!conditionalFilter) {
    return;
  }

  const variableEvents = conditionalFilter.get('variableEvents');

  if (!variableEvents) {
    return;
  }

  modeling.updateModdleProperties(element, conditionalFilter, {
    variableEvents: undefined
  });
}

function getConditionalFilter(conditionalEventDefinition) {
  return getExtensionElementsList(conditionalEventDefinition, 'zeebe:ConditionalFilter')[0];
}

function shouldCleanUpVariableEvents(element) {
  return isRootLevelEvent(element) && !is(element, 'bpmn:IntermediateCatchEvent');
}

function isRootLevelEvent(element) {
  const businessObject = getBusinessObject(element);
  const parent = businessObject.$parent;

  return parent && is(parent, 'bpmn:Process');
}
