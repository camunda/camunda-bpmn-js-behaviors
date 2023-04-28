import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  getTimerEventDefinition,
  isTimerExpressionTypeSupported
} from './util/TimerUtil';


/**
 * Zeebe BPMN behavior ensuring that bpmn:TimerEventDefinition has only allowed time properties of:
 * - timeCycle
 * - timeDate
 * - timeDuration
 */
export default class CleanUpTimerExpressionBehavior extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    /**
     * Remove unsupported timer expressions.
     */
    this.postExecuted([
      'shape.move',
      'shape.replace',
      'element.updateProperties',
      'element.updateModdleProperties'
    ], context => {
      const element = context.shape || context.newShape || context.element;

      if (element.labelTarget) {
        return;
      }

      if (!is(element, 'bpmn:Event')) {
        return;
      }

      const timerEventDefinition = getTimerEventDefinition(element);

      if (!timerEventDefinition) {
        return;
      }

      const propertiesUpdate = {};

      [
        'timeCycle',
        'timeDate',
        'timeDuration'
      ].forEach((type) => {
        if (timerEventDefinition.get(type) && !isTimerExpressionTypeSupported(type, element)) {
          propertiesUpdate[ type ] = undefined;
        }
      });

      if (!Object.keys(propertiesUpdate).length) {
        return;
      }

      modeling.updateModdleProperties(element, timerEventDefinition, propertiesUpdate);
    }, true);
  }
}

CleanUpTimerExpressionBehavior.$inject = [
  'eventBus',
  'modeling'
];
