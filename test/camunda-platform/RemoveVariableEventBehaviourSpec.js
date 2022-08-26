import {
  bootstrapCamundaPlatformModeler,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';



import diagramXML from './camunda-variable-event.bpmn';


describe('RemoveVariableEventBehaviour', function() {

  beforeEach(bootstrapCamundaPlatformModeler(diagramXML));


  describe('remove variableEvents property', function() {

    describe('when conditional startEvent is moved out of event subprocess', function() {

      it('should not have an variableEvents property', inject(function(elementRegistry, modeling, canvas) {

        // given
        const root = canvas.getRootElement(),
              startEvent = elementRegistry.get('startEvent_1'),
              startBusinessObject = getBusinessObject(startEvent),
              eventSubProcess = elementRegistry.get('Activity_subprocess1');

        let eventDefinitions = startBusinessObject.get('eventDefinitions');

        // assume
        eventDefinitions.forEach(eventDefinition => {
          expect(eventDefinition.get('camunda:variableEvents')).to.not.be.undefined;
        });

        // when
        modeling.moveShape(startEvent, { x: eventSubProcess.width, y: eventSubProcess.height }, root);

        eventDefinitions = startBusinessObject.get('eventDefinitions');

        // then
        eventDefinitions.forEach(def => {
          expect(def.get('camunda:variableEvents')).to.be.undefined;
        });
      }));

    });


    describe('when conditional startEvent is moved out to another event subprocess', function() {

      it('should maintain variableEvents property', inject(function(elementRegistry, modeling, canvas) {

        // given
        const startEvent = elementRegistry.get('startEvent_1'),
              startBusinessObject = getBusinessObject(startEvent),
              eventDefinitions = startBusinessObject.get('eventDefinitions'),
              eventSubProcess = elementRegistry.get('Activity_subprocess2');

        // assume
        eventDefinitions.forEach(def => {
          expect(def.get('camunda:variableEvents')).to.not.be.undefined;
        });

        // when
        modeling.moveShape(startEvent, { x: 0, y: eventSubProcess.height }, eventSubProcess);

        // then
        eventDefinitions.forEach(eventDefinition => {
          expect(eventDefinition.get('camunda:variableEvents')).to.not.be.undefined;
        });
      }));

    });


    describe('when conditional startEvent with variableEvents property is created out of event subprocess', function() {

      it('should not have variableEvents property', inject(function(canvas, modeling, bpmnFactory) {

        // given
        const root = canvas.getRootElement(),
              eventDefinition = bpmnFactory.create('bpmn:ConditionalEventDefinition', { variableEvents:'abc' }),
              eventBusinessObject = bpmnFactory.create('bpmn:StartEvent', { eventDefinitions: [ eventDefinition ] });

        // when
        modeling.createShape({ type: 'bpmn:StartEvent' , businessObject: eventBusinessObject }, { x: 0, y: 0 }, root);

        // then
        eventBusinessObject.get('eventDefinitions').forEach(eventDefinition => {
          expect(eventDefinition.get('camunda:variableEvents')).to.be.undefined;
        });
      }));

    });

  });

});