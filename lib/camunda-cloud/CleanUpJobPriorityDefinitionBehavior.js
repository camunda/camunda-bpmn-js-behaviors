import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isUndefined } from 'min-dash';

import {
  getExtensionElementsList,
  removeExtensionElements
} from '../util/ExtensionElementsUtil';

import { getEventDefinition } from '../util/EventDefinition';

const HIGH_PRIORITY = 5000;

const OPTIONAL_JOB_WORKER_ELEMENTS = [
  'bpmn:AdHocSubProcess',
  'bpmn:BusinessRuleTask',
  'bpmn:ScriptTask'
];


/**
 * Zeebe BPMN behavior removing zeebe:JobPriorityDefinition:
 * - when the element is no longer a job worker
 * - when priority is erased
 */
export default class CleanUpJobPriorityDefinitionBehavior extends CommandInterceptor {
  constructor(commandStack, eventBus) {
    super(eventBus);

    /**
     * Remove zeebe:JobPriorityDefinition when an element is morphed to a non-job-worker type.
     */
    this.postExecuted('shape.replace', HIGH_PRIORITY, function(context) {
      const element = context.newShape;

      if (is(element, 'bpmn:Process') || isZeebeServiceTask(element)) {
        return;
      }

      const businessObject = getBusinessObject(element);
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      if (jobPriorityDefinition) {
        removeExtensionElements(element, businessObject, jobPriorityDefinition, commandStack);
      }
    }, true);

    /**
     * Remove zeebe:JobPriorityDefinition when an optional job worker element
     * switches from job worker to a non-job-worker implementation.
     */
    this.postExecuted('element.updateModdleProperties', HIGH_PRIORITY, function(context) {
      const {
        element,
        moddleElement,
        properties
      } = context;

      if (!is(moddleElement, 'bpmn:ExtensionElements') || !properties.values) {
        return;
      }

      if (!isAny(element, OPTIONAL_JOB_WORKER_ELEMENTS)) {
        return;
      }

      const taskDefinition = getTaskDefinition(element);
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      if (!taskDefinition && jobPriorityDefinition) {
        const businessObject = getBusinessObject(element);
        removeExtensionElements(element, businessObject, jobPriorityDefinition, commandStack);
      }
    }, true);

    /**
     * Remove zeebe:JobPriorityDefinition when priority is erased from a job worker element.
     */
    this.postExecuted('element.updateModdleProperties' , HIGH_PRIORITY, function(context) {
      const {
        element,
        moddleElement
      } = context;

      if (!is(moddleElement, 'zeebe:JobPriorityDefinition')) {
        return;
      }

      const jobPriorityDefinition = moddleElement;

      if (isUndefined(jobPriorityDefinition.get('zeebe:priority'))) {
        const businessObject = getBusinessObject(element);

        removeExtensionElements(element, businessObject, jobPriorityDefinition, commandStack);
      }
    }, true);
  }
}

CleanUpJobPriorityDefinitionBehavior.$inject = [
  'commandStack',
  'eventBus'
];


// helpers //////////

function getJobPriorityDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:JobPriorityDefinition')[ 0 ];
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[ 0 ];
}

function isZeebeServiceTask(element) {
  if (!is(element, 'zeebe:ZeebeServiceTask')) return false;

  if (is(element, 'bpmn:EndEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {
    return !!getEventDefinition(element, 'bpmn:MessageEventDefinition');
  }

  // Elements which may optionally be implemented as job workers
  if (isAny(element, OPTIONAL_JOB_WORKER_ELEMENTS) && !getTaskDefinition(element)) {
    return false;
  }

  return true;
}