import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { without } from 'min-dash';

import { getExtensionElementsList } from '../util/ExtensionElementsUtil';

const HIGH_PRIORITY = 5000;


/**
 * Zeebe BPMN behavior ensuring that bpmn:AdHocSubProcess only has one of the following:
 *
 * (1) zeebe:AdHoc with activeElementsCollection and completionCondition
 * (2) zeebe:TaskDefinition and zeebe:TaskHeaders
 */
export default class CleanUpAdHocSubProcessBehavior extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    /**
     * Remove zeebe:AdHoc properties (activeElementsCollection, completionCondition)
     * and reset cancelRemainingInstances if zeebe:TaskDefinition is about to be added.
     */
    this.preExecute('element.updateModdleProperties', HIGH_PRIORITY, function(context) {

      const {
        element,
        moddleElement,
        properties
      } = context;

      const bo = getBusinessObject(element);

      if (
        !is(bo, 'bpmn:AdHocSubProcess')
        || !is(moddleElement, 'bpmn:ExtensionElements')
        || !properties.values
        || !hasTaskDefinition(properties.values)
      ) {
        return;
      }

      const adHoc = getAdHoc(element);

      // remove active elements collection
      if (adHoc?.get('activeElementsCollection')) {
        modeling.updateModdleProperties(element, adHoc, { activeElementsCollection: undefined });
      }

      // remove completion condition and cancelRemainingInstances
      if (bo.get('completionCondition') || bo.get('cancelRemainingInstances') !== false) {
        modeling.updateModdleProperties(element, bo, {
          completionCondition: undefined,
          cancelRemainingInstances: false
        });
      }
    }, true);

    /**
     * Remove zeebe:TaskHeaders when zeebe:TaskDefinition is removed.
     */
    this.preExecute('element.updateModdleProperties', HIGH_PRIORITY, function(context) {
      const {
        element,
        moddleElement,
        properties
      } = context;

      if (
        !is(element, 'bpmn:AdHocSubProcess')
        || !is(moddleElement, 'bpmn:ExtensionElements')
        || !properties.values
        || hasTaskDefinition(properties.values)
      ) {
        return;
      }

      const taskHeaders = getTaskHeaders(element);

      // Check if task definition is being removed and task headers exist
      if (taskHeaders) {
        properties.values = without(properties.values, taskHeaders);
      }
    }, true);

  }
}

CleanUpAdHocSubProcessBehavior.$inject = [
  'eventBus',
  'modeling'
];


// helpers //////////

function getAdHoc(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:AdHoc')[ 0 ];
}

function getTaskHeaders(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskHeaders')[ 0 ];
}

function hasTaskDefinition(values) {
  return values.find(extension => is(extension, 'zeebe:TaskDefinition'));
}
