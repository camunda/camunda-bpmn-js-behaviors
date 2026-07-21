import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isUndefined } from 'min-dash';

import { removeExtensionElements } from '../util/ExtensionElementsUtil';

import type CommandStack from 'diagram-js/lib/command/CommandStack';

import type EventBus from 'diagram-js/lib/core/EventBus';

const HIGH_PRIORITY = 5000;


/**
 * Zeebe BPMN behavior removing zeebe:TaskSchedule elements without
 * zeebe:dueDate and zeebe:followUpDate.
 */
export default class RemoveTaskScheduleBehavior extends CommandInterceptor {
  static $inject: string[];

  constructor(commandStack: CommandStack, eventBus: EventBus) {
    super(eventBus);

    this.postExecuted('element.updateModdleProperties', HIGH_PRIORITY, function(context) {
      const {
        element,
        moddleElement
      } = context;

      if (!is(moddleElement, 'zeebe:TaskSchedule')) {
        return;
      }

      const taskSchedule = moddleElement;

      if (
        is(element, 'bpmn:UserTask')
          && isUndefined(taskSchedule.get('zeebe:dueDate'))
          && isUndefined(taskSchedule.get('zeebe:followUpDate'))
      ) {
        const businessObject = getBusinessObject(element);


        removeExtensionElements(element, businessObject, taskSchedule, commandStack);
      }
    }, true);

  }
}

RemoveTaskScheduleBehavior.$inject = [
  'commandStack',
  'eventBus'
];
