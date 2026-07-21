import type BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';

import type { ModdleElement, ModdleTypeMap } from 'bpmn-js/lib/model/Types';

/**
 * Creates a new element and set the parent to it. A known moddle type name
 * yields the typed element.
 *
 * @param elementType type of the new element
 * @param properties properties of the new element in key-value pairs
 * @param parent parent of the new element
 * @param factory factory which creates the new element
 *
 * @returns element which is created
 */
export function createElement<K extends string>(
    elementType: K,
    properties: Record<string, any>,
    parent: ModdleElement,
    factory: BpmnFactory
): K extends keyof ModdleTypeMap ? ModdleTypeMap[K] : ModdleElement<Record<string, any>> {
  const element = factory.create(elementType, properties);
  element.$parent = parent;

  return element;
}
