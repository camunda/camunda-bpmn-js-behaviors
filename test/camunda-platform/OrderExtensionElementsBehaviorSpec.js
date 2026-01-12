import {
  bootstrapCamundaPlatformModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './camunda-call-activity.bpmn';

/* global sinon */

describe('OrderExtensionElementsBehavior', function() {

  beforeEach(bootstrapCamundaPlatformModeler(diagramXML));

  it('should trigger on element.updateModdleProperties',
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

      expect(is(updatedExtensionElements[0], 'camunda:In')).to.be.true;
      expect(updatedExtensionElements[0]).to.have.property('variables', 'all');

      expect(is(updatedExtensionElements[1], 'camunda:In')).to.be.true;
      expect(updatedExtensionElements[1]).to.have.property('source', 'in');

      expect(is(updatedExtensionElements[2], 'camunda:Out')).to.be.true;
      expect(updatedExtensionElements[2]).to.have.property('variables', 'all');

      expect(is(updatedExtensionElements[3], 'camunda:Out')).to.be.true;
      expect(updatedExtensionElements[3]).to.have.property('source', 'out');
    })
  );


  it('should trigger on element.updateProperties',
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

      modeling.updateProperties(
        callActivity,
        extensionElements
      );

      // then
      const updatedExtensionElements = businessObject.get('extensionElements').get('values');

      expect(is(updatedExtensionElements[0], 'camunda:In')).to.be.true;
      expect(updatedExtensionElements[0]).to.have.property('variables', 'all');

      expect(is(updatedExtensionElements[1], 'camunda:In')).to.be.true;
      expect(updatedExtensionElements[1]).to.have.property('source', 'in');

      expect(is(updatedExtensionElements[2], 'camunda:Out')).to.be.true;
      expect(updatedExtensionElements[2]).to.have.property('variables', 'all');

      expect(is(updatedExtensionElements[3], 'camunda:Out')).to.be.true;
      expect(updatedExtensionElements[3]).to.have.property('source', 'out');
    })
  );


  it('should not call updateModdleProperties if order did not change',
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


  it('should not fail if no extension elements are present', inject(function(elementRegistry, modeling) {

    // given
    const callActivity = elementRegistry.get('CallActivity_EMPTY');
    const businessObject = getBusinessObject(callActivity);

    // when
    modeling.updateModdleProperties(
      callActivity,
      businessObject,
      { name: 'New name' }
    );

    // then
    expect(businessObject.get('name')).to.eql('New name');
  })
  );


  it('should not fail for non-call activity', inject(function(elementRegistry, modeling) {

    // given
    const task = elementRegistry.get('Task_EMPTY');
    const businessObject = getBusinessObject(task);

    // when
    modeling.updateModdleProperties(
      task,
      businessObject,
      { name: 'New name' }
    );

    // then
    expect(businessObject.get('name')).to.eql('New name');
  }));
});

function addExtensionElements(extensionElements, bpmnFactory, elements) {
  elements.forEach(({ type, ...properties }) => {
    const element = bpmnFactory.create(type, properties);
    element.$parent = extensionElements;
    extensionElements.get('values').push(element);
  });
}
