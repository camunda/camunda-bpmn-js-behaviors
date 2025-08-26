import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './process-timer.bpmn';


describe('camunda-cloud/features/modeling - CleanUpTimerExpressionBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  describe('move', function() {

    it('should remove timeCycle when start event is moved to event subprocess', inject(
      function(elementRegistry, modeling) {

        // given
        const startEvent = elementRegistry.get('StartEventCycle'),
              eventSubprocess = elementRegistry.get('EventSubProcess');

        // when
        modeling.moveElements([ startEvent ], { x: eventSubprocess.x + 20, y: eventSubprocess.y + 20 }, eventSubprocess);

        // then
        const timerEventDefinition = getTimerEventDefinition(startEvent);

        expect(timerEventDefinition.get('timeCycle')).not.to.exist;
      }
    ));


    it('should NOT remove timeCycle when moving start event around process', inject(
      function(elementRegistry, modeling) {

        // given
        const startEvent = elementRegistry.get('StartEventCycle'),
              process = elementRegistry.get('Process');

        // when
        modeling.moveElements([ startEvent ], { x: startEvent.x + 20, y: startEvent.y + 20 }, process);

        // then
        const timerEventDefinition = getTimerEventDefinition(startEvent);

        expect(timerEventDefinition.get('timeCycle')).to.exist;
      }
    ));

  });


  describe('replace', function() {

    it('should remove timeCycle when boundary event is replaced with an interrupting one', inject(
      function(elementRegistry, bpmnReplace) {

        // given
        let boundaryEvent = elementRegistry.get('NonInterruptingBoundaryEvent');

        // when
        bpmnReplace.replaceElement(boundaryEvent, {
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:TimerEventDefinition',
          cancelActivity: true
        });

        // then
        boundaryEvent = elementRegistry.get('NonInterruptingBoundaryEvent');
        const timerEventDefinition = getTimerEventDefinition(boundaryEvent);

        expect(timerEventDefinition.get('timeCycle')).not.to.exist;
      }
    ));

    describe('with non-interrupting of the same type (in subprocess)', function() {

      it('should copy timeDate', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          let startEvent = elementRegistry.get('StartEventDate');

          // when
          bpmnReplace.replaceElement(startEvent, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition',
            isInterrupting: false
          });

          // then
          startEvent = elementRegistry.get('StartEventDate');
          const timerEventDefinition = getTimerEventDefinition(startEvent);

          expect(timerEventDefinition.get('timeDate')).to.exist;
        }
      ));


      it('should copy timeDuration', inject(
        function(elementRegistry, bpmnReplace) {

          // given
          let startEvent = elementRegistry.get('StartEventDuration');

          // when
          bpmnReplace.replaceElement(startEvent, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition',
            isInterrupting: false
          });

          // then
          startEvent = elementRegistry.get('StartEventDuration');
          const timerEventDefinition = getTimerEventDefinition(startEvent);

          expect(timerEventDefinition.get('timeDuration')).to.exist;
        }
      ));
    });
  });


  describe('update', function() {

    it('should remove time cycle when `modeling.updateProperties` makes it disallowed', inject(
      function(elementRegistry, modeling) {

        // given
        const boundaryEvent = elementRegistry.get('NonInterruptingBoundaryEvent');

        // when
        modeling.updateProperties(boundaryEvent, {
          cancelActivity: undefined
        });

        // then
        const timerEventDefinition = getTimerEventDefinition(boundaryEvent);

        expect(timerEventDefinition.get('timeCycle')).not.to.exist;
      }
    ));


    it('should remove time cycle when `modeling.updateModdleProperties` makes it disallowed', inject(
      function(elementRegistry, modeling) {

        // given
        const boundaryEvent = elementRegistry.get('NonInterruptingBoundaryEvent');

        // when
        let timerEventDefinition = getTimerEventDefinition(boundaryEvent);
        modeling.updateModdleProperties(boundaryEvent, getBusinessObject(boundaryEvent), {
          cancelActivity: undefined
        });

        // then
        timerEventDefinition = getTimerEventDefinition(boundaryEvent);
        expect(timerEventDefinition.get('timeCycle')).not.to.exist;
      }
    ));

  });

});



// helpers //////////

function getTimerEventDefinition(element) {
  const businessObject = getBusinessObject(element);

  return businessObject.get('eventDefinitions').find(eventDefinition => {
    return is(eventDefinition, 'bpmn:TimerEventDefinition');
  });
}