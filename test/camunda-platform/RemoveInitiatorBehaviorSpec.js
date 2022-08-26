import {
  bootstrapCamundaPlatformModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './camunda-initiator.bpmn';


describe('RemoveInitiatorBehaviour', function() {

  beforeEach(bootstrapCamundaPlatformModeler(diagramXML));


  describe('remove initiator property', function() {

    describe('when event is moved to subprocess', function() {

      it('should not have an initiator property', inject(function(elementRegistry, modeling) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1'),
              startBusinessObject = getBusinessObject(startEvent),
              subProcess = elementRegistry.get('Activity_subprocess1');

        // assume
        expect(startBusinessObject.get('camunda:initiator')).to.not.be.undefined;

        // when
        modeling.moveShape(startEvent, { x: (subProcess.x + subProcess.width / 4), y: (subProcess.y + subProcess.height / 4) }, subProcess);

        // then
        expect(startBusinessObject.get('camunda:initiator')).to.be.undefined;
      }));

    });


    describe('when event is created within a subprocess', function() {

      it('should not have an initiator property', inject(function(elementRegistry, modeling, bpmnFactory) {

        // given
        const subProcess = elementRegistry.get('Activity_subprocess1'),
              startBusinessObject = bpmnFactory.create('bpmn:StartEvent', { initiator:'abc' });

        // when
        modeling.createShape({ type: 'bpmn:StartEvent', businessObject:startBusinessObject }, { x: 0, y: 0 }, subProcess);

        // then
        expect(startBusinessObject.get('camunda:initiator')).to.be.undefined;
      }));

    });


    describe('when event with property and subprocess as parent is moved', function() {

      it('should not have an initiator property', inject(function(elementRegistry, modeling, elementFactory, canvas, copyPaste) {

        // given
        const startEvent = elementRegistry.get('StartEvent_2'),
              startBusinessObject = getBusinessObject(startEvent),
              subProcess = elementRegistry.get('Activity_subprocess1');

        // assume
        expect(startBusinessObject.get('camunda:initiator')).to.not.be.undefined;

        // when
        modeling.moveShape(startEvent, { x: (subProcess.x + subProcess.width / 4), y: (subProcess.y + subProcess.height / 4) });

        // then
        expect(startBusinessObject.get('camunda:initiator')).to.be.undefined;
      }));

    });

  });

});
