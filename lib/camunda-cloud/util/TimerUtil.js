import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';


export function getTimerEventDefinition(element) {
  const bo = getBusinessObject(element);

  return bo.get('eventDefinitions').find(definition => is(definition, 'bpmn:TimerEventDefinition'));
}

/**
 * isTypeSupported - Checks whether a given time property is supported for a given element.
 *
 * @param  {string} timerDefinitionType
 * @param  {ModdleElement} element
 *
 * @return {boolean}
 */
export function isTypeSupported(timerDefinitionType, element) {
  const businessObject = getBusinessObject(element);

  switch (timerDefinitionType) {
  case 'timeDate':
    if (is(element, 'bpmn:StartEvent')) {
      return true;
    }
    return false;

  case 'timeCycle':
    if (is(element, 'bpmn:StartEvent') && !isInterruptingStartEvent(businessObject)) {
      return true;
    }

    if (is(element, 'bpmn:BoundaryEvent') && !businessObject.cancelActivity) {
      return true;
    }
    return false;

  case 'timeDuration':
    if (is(element, 'bpmn:IntermediateCatchEvent')) {
      return true;
    }

    if (is(element, 'bpmn:BoundaryEvent')) {
      return true;
    }
    return false;
  }
}

function isInterruptingStartEvent(bo) {
  return isInEventSubProcess(bo) && bo.get('isInterrupting') !== false;
}

function isInEventSubProcess(bo) {
  const parent = bo.$parent;

  return is(parent, 'bpmn:SubProcess') && parent.triggeredByEvent;
}
