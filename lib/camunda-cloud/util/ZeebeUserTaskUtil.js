import { getExtensionElementsList } from '../../util/ExtensionElementsUtil';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

/**
 * Get all zeebe:userTask elements of an element.
 *
 * @param {djs.model.Base|ModdleElement} element
 *
 * @returns {Array<ModdleElement>}
 */
export function getZeebeUserTaskElements(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'zeebe:UserTask');
}

/**
 * Get the first zeebe:userTask element of an element.
 *
 * @param {djs.model.Base|ModdleElement} element
 *
 * @returns {ModdleElement|null}
 */
export function getZeebeUserTaskElement(element) {
  const userTaskElements = getZeebeUserTaskElements(element);
  return userTaskElements[0] || null;
}

/**
 * Check whether a zeebe:userTask extension element is set on an element.
 *
 * @param {djs.model.Base|ModdleElement} element
 *
 * @returns {boolean}
 */
export function hasZeebeUserTaskExtension(element) {
  if (!is(element, 'bpmn:UserTask')) {
    return false;
  }

  return !!getZeebeUserTaskElement(element);
}
