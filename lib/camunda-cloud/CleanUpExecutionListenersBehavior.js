import { is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { without } from 'min-dash';

import { getExtensionElementsList } from '../util/ExtensionElementsUtil';
import { getEventDefinition } from '../util/EventDefinition';

const DISALLOWED_START_LISTENER_TYPES = [
  'bpmn:StartEvent',
  'bpmn:BoundaryEvent'
];

export default class CleanUpExecutionListenersBehavior extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    // remove execution listeners of disallowed type
    this.postExecuted('shape.replace', function(event) {
      const element = event.context.newShape;

      const executionListenersContainer = getExecutionListenersContainer(element);
      if (!executionListenersContainer) {
        return;
      }

      const listeners = executionListenersContainer.get('listeners');
      const newListeners = withoutDisallowedListeners(element, listeners);

      if (newListeners.length !== listeners.length) {
        modeling.updateModdleProperties(element, executionListenersContainer, { listeners: newListeners });
      }
    });

    // remove empty execution listener container
    this.postExecuted('element.updateModdleProperties', function(event) {
      const {
        element,
        moddleElement
      } = event.context;

      if (!is(moddleElement, 'zeebe:ExecutionListeners')) {
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

CleanUpExecutionListenersBehavior.$inject = [
  'eventBus',
  'modeling'
];

// helpers //////////
function withoutDisallowedListeners(element, listeners) {
  listeners = withoutDisallowedStartListeners(element, listeners);
  listeners = withoutDisallowedEndListeners(element, listeners);

  return listeners;
}

function withoutDisallowedStartListeners(element, listeners) {
  if (isAny(element, DISALLOWED_START_LISTENER_TYPES)) {
    return listeners.filter(listener => listener.eventType !== 'start');
  }

  return listeners;
}

function withoutDisallowedEndListeners(element, listeners) {
  if (shouldRemoveEndListeners(element)) {
    return listeners.filter(listener => listener.eventType !== 'end');
  }

  return listeners;
}

function shouldRemoveEndListeners(element) {
  if (
    is(element, 'bpmn:BoundaryEvent') && isCompensationEvent(element) ||
    is(element, 'bpmn:EndEvent') && isErrorEvent(element) ||
    is(element, 'bpmn:Gateway')
  ) {
    return true;
  }
}

function isCompensationEvent(element) {
  return !!getEventDefinition(element, 'bpmn:CompensateEventDefinition');
}

function isErrorEvent(element) {
  return !!getEventDefinition(element, 'bpmn:ErrorEventDefinition');
}

function getExecutionListenersContainer(element) {
  return getExtensionElementsList(element, 'zeebe:ExecutionListeners')[0];
}
