import { is } from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from '../util/ExtensionElementsUtil';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isEqual, without } from 'lodash';

const LOW_PRIORITY = 250;

/**
 * For specified BPMN elements, ensure that the `<bpmn:extensionElements>`
 * are kept in the specific order.
 */
export default class OrderExtensionElementsBehavior extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);
    this._modeling = modeling;

    this.postExecuted([
      'element.updateProperties',
      'element.updateModdleProperties'
    ], LOW_PRIORITY, (context) => {

      const element = context.shape || context.newShape || context.element;

      if (is(element, 'bpmn:CallActivity')) {
        this.orderCallActivityExtensionElements(element);
      }
    }, true);
  }

  orderCallActivityExtensionElements(element) {

    const input = getExtensionElementsList(element, 'camunda:In');
    const output = getExtensionElementsList(element, 'camunda:Out');
    const rest = without(getExtensionElementsList(element), ...input, ...output);

    shiftVariablesToFront(input);
    shiftVariablesToFront(output);

    const values = [
      ...input,
      ...output,
      ...rest
    ];

    const extensionElements = element.businessObject.get('extensionElements');

    if (isEqual(extensionElements.get('values'), values)) {
      return;
    }

    this._modeling.updateModdleProperties(
      element,
      extensionElements,
      { values }
    );
  }
}

OrderExtensionElementsBehavior.$inject = [
  'eventBus',
  'modeling'
];

/**
 * If the array contains an object with `variables` property,
 * move it to the front.
 *
 * @param {Array<Object>} array
 */
function shiftVariablesToFront(array) {

  const variablesIndex = array.findIndex(item => !!item.variables);

  if (variablesIndex > 0) {
    const variablesItem = array.splice(variablesIndex, 1)[0];
    array.unshift(variablesItem);
  }
}