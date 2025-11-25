import {
  bootstrapCamundaPlatformModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './camunda-call-activity.bpmn';

/* global sinon */

describe('OrderExtensionElementsBehavior', function() {

  beforeEach(bootstrapCamundaPlatformModeler(diagramXML));

  it('should reorder extension elements',
    inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');
      const businessObject = getBusinessObject(callActivity);

      // when
      const extensionElements = businessObject.get('extensionElements');

      const ioElements = [
        { type: 'camunda:Out', target: 'foo', source: 'out' },
        { type: 'camunda:In', target: 'bar', source: 'in' },
        { type: 'camunda:Out', variables: 'all' },
        { type: 'camunda:In', variables: 'all' }
      ];

      addExtensionElements(extensionElements, bpmnFactory, ioElements);

      modeling.updateModdleProperties(
        callActivity,
        extensionElements,
        { values: extensionElements.get('values') }
      );

      // then
      const updatedExtensionElements = businessObject.get('extensionElements').get('values');

      expect(updatedExtensionElements[0]).to.have.property('variables', 'all');
      expect(updatedExtensionElements[0]).to.have.property('$type', 'camunda:In');

      expect(updatedExtensionElements[1]).to.have.property('source', 'in');

      expect(updatedExtensionElements[2]).to.have.property('variables', 'all');
      expect(updatedExtensionElements[2]).to.have.property('$type', 'camunda:Out');

      expect(updatedExtensionElements[3]).to.have.property('source', 'out');
    })
  );


  it('should not update extension elements if already ordered',
    inject(function(elementRegistry, modeling, bpmnFactory) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');
      const businessObject = getBusinessObject(callActivity);
      const modelingSpy = sinon.spy(modeling, 'updateModdleProperties');

      // when
      const extensionElements = businessObject.get('extensionElements');

      const ioElements = [
        { type: 'camunda:In', variables: 'all' },
        { type: 'camunda:In', target: 'bar', source: 'in' },
        { type: 'camunda:Out', variables: 'all' },
        { type: 'camunda:Out', target: 'foo', source: 'out' }
      ];

      addExtensionElements(extensionElements, bpmnFactory, ioElements);

      modeling.updateModdleProperties(
        callActivity,
        extensionElements,
        { values: extensionElements.get('values') }
      );

      // then
      const updatedExtensionElements = businessObject.get('extensionElements').get('values');
      expect(updatedExtensionElements).to.have.lengthOf(4);
      expect(modelingSpy).to.have.been.calledOnce;
    })
  );

});

function addExtensionElements(extensionElements, bpmnFactory, elements) {
  elements.forEach(({ type, ...properties }) => {
    const element = bpmnFactory.create(type, properties);
    element.$parent = extensionElements;
    extensionElements.get('values').push(element);
  });
}
