import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { isArray } from 'min-dash';

import type { Element, ModdleElement, ModdleTypeMap } from 'bpmn-js/lib/model/Types';

import type CommandStack from 'diagram-js/lib/command/CommandStack';

/**
 * Get extension elements of business object. Optionally filter by type — a known
 * moddle type name yields a typed list.
 */
export function getExtensionElementsList<K extends string = string>(
    element: Element | ModdleElement,
    type?: K
): (K extends keyof ModdleTypeMap ? ModdleTypeMap[K] : ModdleElement)[] {
  const businessObject = getBusinessObject(element),
        extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return [];
  }

  const values = extensionElements.get('values');

  if (!values || !values.length) {
    return [];
  }

  if (type) {
    return values.filter((value: ModdleElement) => is(value, type));
  }

  return values;
}

/**
 * Remove one or more extension elements. Remove bpmn:ExtensionElements afterwards if it's empty.
 */
export function removeExtensionElements(
    element: Element | ModdleElement,
    businessObject: ModdleElement,
    extensionElementsToRemove: ModdleElement | ModdleElement[],
    commandStack: CommandStack
): void {
  if (!isArray(extensionElementsToRemove)) {
    extensionElementsToRemove = [ extensionElementsToRemove ];
  }

  const extensionElements = businessObject.get('extensionElements'),
        values = extensionElements.get('values').filter(
            (value: ModdleElement) => !extensionElementsToRemove.includes(value)
        );

  commandStack.execute('element.updateModdleProperties', {
    element,
    moddleElement: extensionElements,
    properties: {
      values
    }
  });
}
