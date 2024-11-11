import { is } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { without } from 'min-dash';

import { getExtensionElementsList } from '../util/ExtensionElementsUtil';

const ALLOWED_EVENT_TYPES = [ 'complete', 'assignment' ];

export default class CleanUpTaskListenersBehavior extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    // remove task listeners of disallowed type
    this.postExecuted('shape.replace', function(event) {
      const element = event.context.newShape;
      const taskListenersContainer = getTaskListenersContainer(element);
      if (!taskListenersContainer) {
        return;
      }

      const listeners = taskListenersContainer.get('listeners');
      const newListeners = withoutDisallowedListeners(element, listeners);

      if (newListeners.length !== listeners.length) {
        modeling.updateModdleProperties(element, taskListenersContainer, { listeners: newListeners });
      }
    });

    // remove empty task listener container
    this.postExecuted('element.updateModdleProperties', function(event) {
      const {
        element,
        moddleElement
      } = event.context;

      if (!is(moddleElement, 'zeebe:TaskListeners')) {
        return;
      }

      const listeners = moddleElement.get('listeners');
      if (listeners.length) {
        return;
      }

      const extensionElements = moddleElement.$parent;
      modeling.updateModdleProperties(element, extensionElements, { values: without(extensionElements.get('values'), moddleElement) });
    });
  }
}

CleanUpTaskListenersBehavior.$inject = [
  'eventBus',
  'modeling'
];

// helpers //////////
function withoutDisallowedListeners(element, listeners) {
  return listeners.filter(listener => {
    if (
      !is(element, 'bpmn:UserTask') ||
      !ALLOWED_EVENT_TYPES.includes(listener.eventType) ||
      !hasZeebeTaskExtensionElement(element)
    ) {
      return false;
    }
    return true;
  });
}

function getTaskListenersContainer(element) {
  return getExtensionElementsList(element, 'zeebe:TaskListeners')[0];
}

function hasZeebeTaskExtensionElement(element) {
  return getExtensionElementsList(element, 'zeebe:UserTask').length > 0;
}