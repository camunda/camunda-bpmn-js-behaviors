import CopyPasteBehavior from '../../lib/camunda-platform/CopyPasteBehavior';

import BpmnModdle from 'bpmn-moddle';

import camundaDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';


describe('CopyPasteBehavior', function() {

  let copyPasteBehavior,
      moddle;

  beforeEach(function() {
    copyPasteBehavior = new CopyPasteBehavior(new EventBusMock());

    moddle = new BpmnModdle({
      camunda: camundaDescriptor
    });
  });


  describe('connector', function() {

    it('should allow if parent has MessageEventDefinition', function() {

      // given
      const connector = moddle.create('camunda:Connector'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
            messageEndEvent = moddle.create('bpmn:EndEvent');

      extensionElements.$parent = messageEventDefinition;

      messageEventDefinition.$parent = messageEndEvent;
      messageEventDefinition.extensionElements = extensionElements;

      messageEndEvent.eventDefinitions = [ messageEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(connector, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should NOT allow if parent has no MessageEventDefinition', function() {

      // given
      const connector = moddle.create('camunda:Connector'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
            signalEndEvent = moddle.create('bpmn:EndEvent');

      extensionElements.$parent = signalEventDefinition;

      signalEventDefinition.$parent = signalEndEvent;
      signalEventDefinition.extensionElements = extensionElements;

      signalEndEvent.eventDefinitions = [ signalEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(connector, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should NOT allow if parent is not IntermediateThrowEvent or EndEvent', function() {

      // given
      const connector = moddle.create('camunda:Connector'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
            messageStartEvent = moddle.create('bpmn:StartEvent');

      extensionElements.$parent = messageEventDefinition;

      messageEventDefinition.$parent = messageStartEvent;
      messageEventDefinition.extensionElements = extensionElements;

      messageStartEvent.eventDefinitions = [ messageEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(connector, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should allow if parent is ServiceTask', function() {

      // given
      const connector = moddle.create('camunda:Connector'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            serviceTask = moddle.create('bpmn:ServiceTask');

      extensionElements.$parent = serviceTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(connector, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });

  });


  describe('camunda:Field', function() {

    it('should allow if parent has MessageEventDefinition', function() {

      // given
      const field = moddle.create('camunda:Field'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
            messageEndEvent = moddle.create('bpmn:EndEvent');

      extensionElements.$parent = messageEventDefinition;

      messageEventDefinition.$parent = messageEndEvent;
      messageEventDefinition.extensionElements = extensionElements;

      messageEndEvent.eventDefinitions = [ messageEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(field, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should NOT allow if parent has no MessageEventDefinition', function() {

      // given
      const field = moddle.create('camunda:Field'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
            signalEndEvent = moddle.create('bpmn:EndEvent');

      extensionElements.$parent = signalEventDefinition;

      signalEventDefinition.$parent = signalEndEvent;
      signalEventDefinition.extensionElements = extensionElements;

      signalEndEvent.eventDefinitions = [ signalEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(field, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should NOT allow if parent is not IntermediateThrowEvent or EndEvent', function() {

      // given
      const field = moddle.create('camunda:Field'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
            signalStartEvent = moddle.create('bpmn:StartEvent');

      extensionElements.$parent = signalEventDefinition;

      signalEventDefinition.$parent = signalStartEvent;
      signalEventDefinition.extensionElements = extensionElements;

      signalStartEvent.eventDefinitions = [ signalEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(field, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });


  describe('camunda:FailedJobRetryTimeCycle', function() {

    it('should allow if parent is Signal IntermediateThrowEvent',
      function() {

        // given
        const retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle'),
              extensionElements = moddle.create('bpmn:ExtensionElements'),
              signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
              signalIntermediateThrowEvent = moddle.create('bpmn:IntermediateThrowEvent');

        extensionElements.$parent = signalEventDefinition;

        signalEventDefinition.$parent = signalIntermediateThrowEvent;
        signalEventDefinition.extensionElements = extensionElements;

        signalIntermediateThrowEvent.eventDefinitions = [ signalEventDefinition ];

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(retryCycle, extensionElements);

        // then
        expect(canCopyProperty).not.to.be.false;
      }
    );


    it('should allow if parent is Signal StartEvent',
      function() {

        // given
        const retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle'),
              extensionElements = moddle.create('bpmn:ExtensionElements'),
              signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
              signalStartEvent = moddle.create('bpmn:StartEvent');

        extensionElements.$parent = signalEventDefinition;

        signalEventDefinition.$parent = signalStartEvent;
        signalEventDefinition.extensionElements = extensionElements;

        signalStartEvent.eventDefinitions = [ signalEventDefinition ];

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(retryCycle, extensionElements);

        // then
        expect(canCopyProperty).not.to.be.false;
      }
    );


    it('should allow if parent is Timer IntermediateCatchEvent', function() {

      // given
      const retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
            timerIntermediateCatchEvent = moddle.create('bpmn:IntermediateCatchEvent');

      extensionElements.$parent = timerEventDefinition;

      timerEventDefinition.$parent = timerIntermediateCatchEvent;
      timerEventDefinition.extensionElements = extensionElements;

      timerIntermediateCatchEvent.eventDefinitions = [ timerEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(retryCycle, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow if parent is Timer EndEvent', function() {

      // given
      const retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
            timerEndEvent = moddle.create('bpmn:EndEvent');

      extensionElements.$parent = timerEventDefinition;

      timerEventDefinition.$parent = timerEndEvent;
      timerEventDefinition.extensionElements = extensionElements;

      timerEndEvent.eventDefinitions = [ timerEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(retryCycle, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow if parent is Message IntermediateCatchEvent',
      function() {

        // given
        const retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle'),
              extensionElements = moddle.create('bpmn:ExtensionElements'),
              messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
              messageIntermediateCatchEvent = moddle.create('bpmn:IntermediateCatchEvent');

        extensionElements.$parent = messageEventDefinition;

        messageEventDefinition.$parent = messageIntermediateCatchEvent;
        messageEventDefinition.extensionElements = extensionElements;

        messageIntermediateCatchEvent.eventDefinitions = [ messageEventDefinition ];

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(retryCycle, extensionElements);

        // then
        expect(canCopyProperty).not.to.be.false;
      }
    );


    it('should allow if parent is MultiInstanceLoopCharacteristics', function() {

      // given
      const retryCycle = moddle.create('camunda:FailedJobRetryTimeCycle'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      extensionElements.$parent = loopCharacteristics;

      loopCharacteristics.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(retryCycle, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });

  });


  describe('camunda:ErrorEventDefinition', function() {

    it('should allow if parent is service task', function() {

      // given
      const errorEventDefinition = moddle.create('camunda:ErrorEventDefinition'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            serviceTask = moddle.create('bpmn:ServiceTask');

      extensionElements.$parent = serviceTask;

      serviceTask.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(errorEventDefinition, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should not allow if parent is not a service task', function() {

      // given
      const errorEventDefinition = moddle.create('camunda:ErrorEventDefinition'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            userTask = moddle.create('bpmn:UserTask');

      extensionElements.$parent = userTask;

      userTask.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(errorEventDefinition, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });


  describe('camunda:TaskListener', function() {

    it('should allow if parent is user task', function() {

      // given
      const taskListener = moddle.create('camunda:TaskListener'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            userTask = moddle.create('bpmn:UserTask');

      extensionElements.$parent = userTask;

      userTask.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskListener, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should NOT allow if parent is not user task', function() {

      // given
      const taskListener = moddle.create('camunda:TaskListener'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            serviceTask = moddle.create('bpmn:ServiceTask');

      extensionElements.$parent = serviceTask;

      serviceTask.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskListener, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });


  describe('camunda:In', function() {

    it('should allow <camunda:In> on CallActivity', function() {

      // given
      const inOutBinding = moddle.create('camunda:In'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            callActivity = moddle.create('bpmn:CallActivity');

      extensionElements.$parent = callActivity;

      callActivity.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inOutBinding, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow <camunda:In> on SignalIntermediateThrowEvent', function() {

      // given
      const inOutBinding = moddle.create('camunda:In'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
            intermediateThrowEvent = moddle.create('bpmn:IntermediateThrowEvent');

      extensionElements.$parent = signalEventDefinition;

      signalEventDefinition.extensionElements = extensionElements;

      signalEventDefinition.$parent = intermediateThrowEvent;

      intermediateThrowEvent.eventDefinitions = [ signalEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inOutBinding, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow <camunda:In> on SignalEndEvent', function() {

      // given
      const inOutBinding = moddle.create('camunda:In'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
            endEvent = moddle.create('bpmn:EndEvent');

      extensionElements.$parent = signalEventDefinition;

      signalEventDefinition.extensionElements = extensionElements;

      signalEventDefinition.$parent = endEvent;

      endEvent.eventDefinitions = [ signalEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inOutBinding, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should NOT allow <camunda:In> on SignalStartEvent', function() {

      // given
      const inOutBinding = moddle.create('camunda:In'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
            startEvent = moddle.create('bpmn:StartEvent');

      extensionElements.$parent = signalEventDefinition;

      signalEventDefinition.extensionElements = extensionElements;

      signalEventDefinition.$parent = startEvent;

      startEvent.eventDefinitions = [ signalEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inOutBinding, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should NOT allow <camunda:In> on SignalIntermediateCatchEvent', function() {

      // given
      const inOutBinding = moddle.create('camunda:In'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            signalEventDefinition = moddle.create('bpmn:SignalEventDefinition'),
            intermediateCatchEvent = moddle.create('bpmn:IntermediateCatchEvent');

      extensionElements.$parent = signalEventDefinition;

      signalEventDefinition.extensionElements = extensionElements;

      signalEventDefinition.$parent = intermediateCatchEvent;

      intermediateCatchEvent.eventDefinitions = [ signalEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inOutBinding, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should NOT allow <camunda:In> on MessageIntermediateThrowEvent', function() {

      // given
      const inOutBinding = moddle.create('camunda:In'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
            intermediateCatchEvent = moddle.create('bpmn:IntermediateCatchEvent');

      extensionElements.$parent = messageEventDefinition;

      messageEventDefinition.extensionElements = extensionElements;

      messageEventDefinition.$parent = intermediateCatchEvent;

      intermediateCatchEvent.eventDefinitions = [ messageEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inOutBinding, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });
  });


  describe('camunda:InputOutput', function() {

    it('should NOT allow on Gateway', function() {

      // given
      const inputOutput = moddle.create('camunda:InputOutput'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            gateway = moddle.create('bpmn:Gateway');

      extensionElements.$parent = gateway;

      gateway.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inputOutput, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should NOT allow on BoundaryEvent', function() {

      // given
      const inputOutput = moddle.create('camunda:InputOutput'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            boundaryEvent = moddle.create('bpmn:BoundaryEvent');

      extensionElements.$parent = boundaryEvent;

      boundaryEvent.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inputOutput, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should NOT allow on StartEvent', function() {

      // given
      const inputOutput = moddle.create('camunda:InputOutput'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            startEvent = moddle.create('bpmn:StartEvent');

      extensionElements.$parent = startEvent;

      startEvent.extensionElements = extensionElements;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(inputOutput, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });

});


// helpers //////////

class EventBusMock {
  on() {}
}