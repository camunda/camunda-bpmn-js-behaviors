import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

/**
 * Get the event definition of a given type from an event element.
 *
 * @param {djs.model.Base} element - The BPMN element to retrieve the event definition from.
 * @param {string} type - The type of the event definition to retrieve (e.g., 'bpmn:ConditionalEventDefinition').
 *
 * @returns {ModdleElement|null} The event definition of the specified type, or null if not found.
 */
export function getEventDefinition(element, type) {
  if (!is(element, 'bpmn:Event')) {
    return null;
  }

  const eventDefinitions = getBusinessObject(element).get('eventDefinitions') || [];

  return eventDefinitions.find(definition => is(definition, type)) || null;
}