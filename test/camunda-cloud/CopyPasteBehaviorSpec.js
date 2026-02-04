import CopyPasteBehavior from '../../lib/camunda-cloud/CopyPasteBehavior';

import { BpmnModdle } from 'bpmn-moddle';

import zeebeDescriptor from 'zeebe-bpmn-moddle/resources/zeebe.json';


describe('CopyPasteBehavior', function() {

  let copyPasteBehavior,
      moddle;

  beforeEach(function() {
    copyPasteBehavior = new CopyPasteBehavior(new EventBusMock());

    moddle = new BpmnModdle({
      zeebe: zeebeDescriptor
    });
  });


  describe('zeebe:CalledElement', function() {

    it('should allow on CallActivity', function() {

      // given
      const calledElement = moddle.create('zeebe:CalledElement'),
            callActivity = moddle.create('bpmn:CallActivity'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = callActivity;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(calledElement, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should not allow on ServiceTask', function() {

      // given
      const calledElement = moddle.create('zeebe:CalledElement'),
            serviceTask = moddle.create('bpmn:ServiceTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = serviceTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(calledElement, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });


  describe('zeebe:LoopCharacteristics', function() {

    it('should allow on bpmn:MultiInstanceLoopCharacteristics', function() {

      // given
      const loopCharacteristics = moddle.create('zeebe:LoopCharacteristics'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            multiInstanceLoopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      extensionElements.$parent = multiInstanceLoopCharacteristics;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(loopCharacteristics, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should not allow on bpmn:StandardLoopCharacteristics', function() {

      // given
      const loopCharacteristics = moddle.create('zeebe:LoopCharacteristics'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            standardLoopCharacteristics = moddle.create('bpmn:StandardLoopCharacteristics');

      extensionElements.$parent = standardLoopCharacteristics;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(loopCharacteristics, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });


  describe('zeebe:Input', function() {

    it('should allow on ServiceTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            input = moddle.create('zeebe:Input'),
            serviceTask = moddle.create('bpmn:ServiceTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = serviceTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(input, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on UserTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            input = moddle.create('zeebe:Input'),
            userTask = moddle.create('bpmn:UserTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = userTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(input, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should not allow on ReceiveTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            input = moddle.create('zeebe:Input'),
            receiveTask = moddle.create('bpmn:ReceiveTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = receiveTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(input, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should not allow on Task', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            input = moddle.create('zeebe:Input'),
            task = moddle.create('bpmn:Task'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = task;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(input, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

    it('should not allow on NoneEndEvents', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            input = moddle.create('zeebe:Input'),
            endEvent = moddle.create('bpmn:EndEvent'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = endEvent;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(input, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

    it('should allow on MessageEndEvents', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            input = moddle.create('zeebe:Input'),
            messageEndEvent = moddle.create('bpmn:EndEvent'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = messageEndEvent;
      messageEventDefinition.$parent = messageEndEvent;
      messageEndEvent.eventDefinitions = [ messageEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(input, extensionElements);

      // then
      expect(canCopyProperty).to.not.be.false;
    });

  });


  describe('zeebe:Output', function() {

    it('should allow on ServiceTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            output = moddle.create('zeebe:Output'),
            serviceTask = moddle.create('bpmn:ServiceTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = serviceTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(output, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on ReceiveTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            output = moddle.create('zeebe:Output'),
            receiveTask = moddle.create('bpmn:ReceiveTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = receiveTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(output, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on StartEvent', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            output = moddle.create('zeebe:Output'),
            startEvent = moddle.create('bpmn:StartEvent'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = startEvent;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(output, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on UserTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            output = moddle.create('zeebe:Output'),
            userTask = moddle.create('bpmn:UserTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = userTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(output, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should not allow on Task', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            output = moddle.create('zeebe:Output'),
            task = moddle.create('bpmn:Task'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = task;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(output, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should allow on NoneEndEvents', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            output = moddle.create('zeebe:Output'),
            endEvent = moddle.create('bpmn:EndEvent'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = endEvent;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(output, extensionElements);

      // then
      expect(canCopyProperty).to.not.be.false;
    });


    it('should allow on MessageEndEvents', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            output = moddle.create('zeebe:Output'),
            messageEndEvent = moddle.create('bpmn:EndEvent'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      ioMapping.$parent = extensionElements;
      extensionElements.$parent = messageEndEvent;
      messageEventDefinition.$parent = messageEndEvent;
      messageEndEvent.eventDefinitions = [ messageEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(output, extensionElements);

      // then
      expect(canCopyProperty).to.not.be.false;
    });

  });


  describe('zeebe:IoMapping', function() {

    it('should allow on ServiceTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            serviceTask = moddle.create('bpmn:ServiceTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = serviceTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(ioMapping, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on ReceiveTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            receiveTask = moddle.create('bpmn:ReceiveTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = receiveTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(ioMapping, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on UserTask', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            userTask = moddle.create('bpmn:UserTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = userTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(ioMapping, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on EndEvent', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            endEvent = moddle.create('bpmn:EndEvent'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = endEvent;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(ioMapping, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on CallActivity', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            callActivity = moddle.create('bpmn:CallActivity'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = callActivity;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(ioMapping, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on SubProcess', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            subProcess = moddle.create('bpmn:SubProcess'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = subProcess;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(ioMapping, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should not allow on Task', function() {

      // given
      const ioMapping = moddle.create('zeebe:IoMapping'),
            task = moddle.create('bpmn:Task'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = task;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(ioMapping, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });


  describe('zeebe:TaskHeaders', function() {

    it('should allow on ServiceTask', function() {

      // given
      const taskHeaders = moddle.create('zeebe:TaskHeaders'),
            serviceTask = moddle.create('bpmn:ServiceTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = serviceTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskHeaders, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on SendTask', function() {

      // given
      const taskHeaders = moddle.create('zeebe:TaskHeaders'),
            sendTask = moddle.create('bpmn:SendTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = sendTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskHeaders, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on ScriptTask', function() {

      // given
      const taskHeaders = moddle.create('zeebe:TaskHeaders'),
            scriptTask = moddle.create('bpmn:ScriptTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = scriptTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskHeaders, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on BusinessRuleTask', function() {

      // given
      const taskHeaders = moddle.create('zeebe:TaskHeaders'),
            businessRuleTask = moddle.create('bpmn:BusinessRuleTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = businessRuleTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskHeaders, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should allow on UserTask', function() {

      // given
      const taskHeaders = moddle.create('zeebe:TaskHeaders'),
            userTask = moddle.create('bpmn:UserTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = userTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskHeaders, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should NOT allow on ReceiveTask', function() {

      // given
      const taskHeaders = moddle.create('zeebe:TaskHeaders'),
            receiveTask = moddle.create('bpmn:ReceiveTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = receiveTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskHeaders, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should NOT allow on SubProcess', function() {

      // given
      const taskHeaders = moddle.create('zeebe:TaskHeaders'),
            subProcess = moddle.create('bpmn:SubProcess'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = subProcess;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskHeaders, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should NOT allow on Task', function() {

      // given
      const taskHeaders = moddle.create('zeebe:TaskHeaders'),
            task = moddle.create('bpmn:Task'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      extensionElements.$parent = task;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskHeaders, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });


  describe('zeebe:TaskDefinition', function() {

    it('should allow on ServiceTask', function() {

      // given
      const taskDefinition = moddle.create('zeebe:TaskDefinition'),
            serviceTask = moddle.create('bpmn:ServiceTask'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      taskDefinition.$parent = extensionElements;
      extensionElements.$parent = serviceTask;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskDefinition, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should not allow on Task', function() {

      // given
      const taskDefinition = moddle.create('zeebe:TaskDefinition'),
            task = moddle.create('bpmn:Task'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      taskDefinition.$parent = extensionElements;
      extensionElements.$parent = task;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskDefinition, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should not allow on StartEvent', function() {

      // given
      const taskDefinition = moddle.create('zeebe:TaskDefinition'),
            startEvent = moddle.create('bpmn:StartEvent'),
            extensionElements = moddle.create('bpmn:ExtensionElements');

      taskDefinition.$parent = extensionElements;
      extensionElements.$parent = startEvent;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskDefinition, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });


    it('should allow on endEvent with messageDefinition', function() {

      // given
      const taskDefinition = moddle.create('zeebe:TaskDefinition'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            messageEventDefinition = moddle.create('bpmn:MessageEventDefinition'),
            messageEndEvent = moddle.create('bpmn:EndEvent');

      extensionElements.$parent = messageEndEvent;
      messageEventDefinition.$parent = messageEndEvent;
      messageEndEvent.eventDefinitions = [ messageEventDefinition ];

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskDefinition, extensionElements);

      // then
      expect(canCopyProperty).not.to.be.false;
    });


    it('should not allow on endEvent without messageDefinition', function() {

      // given
      const taskDefinition = moddle.create('zeebe:TaskDefinition'),
            extensionElements = moddle.create('bpmn:ExtensionElements'),
            endEvent = moddle.create('bpmn:EndEvent');

      extensionElements.$parent = endEvent;

      // when
      const canCopyProperty = copyPasteBehavior.canCopyProperty(taskDefinition, extensionElements);

      // then
      expect(canCopyProperty).to.be.false;
    });

  });


  describe('bpmn:TimerEventDefinition', function() {

    describe('timeCycle', function() {

      it('should allow to copy to non-interrupting timer boundary event (start event)', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              startEvent = moddle.create('bpmn:StartEvent'),
              timeCycle = moddle.create('bpmn:FormalExpression', { body: 'R/PT1H' });

        startEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = startEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeCycle, timerEventDefinition, 'timeCycle');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to non-interrupting timer boundary event', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              boundaryEvent = moddle.create('bpmn:BoundaryEvent', { cancelActivity: false }),
              timeCycle = moddle.create('bpmn:FormalExpression', { body: 'R/PT1H' });

        boundaryEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = boundaryEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeCycle, timerEventDefinition, 'timeCycle');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to non-interrupting timer start event in event subprocess', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              startEvent = moddle.create('bpmn:StartEvent', { isInterrupting: false }),
              eventSubProcess = moddle.create('bpmn:SubProcess', { triggeredByEvent: true }),
              timeCycle = moddle.create('bpmn:FormalExpression', { body: 'R/PT1H' });

        startEvent.$parent = eventSubProcess;
        startEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = startEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeCycle, timerEventDefinition, 'timeCycle');

        // then
        expect(canCopyProperty).not.to.be.false;
      });

    });


    describe('timeDate', function() {

      it('should allow to copy to non-interrupting timer boundary event (start event)', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              startEvent = moddle.create('bpmn:StartEvent'),
              timeDate = moddle.create('bpmn:FormalExpression', { body: '2019-10-01T12:00:00Z' });

        startEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = startEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDate, timerEventDefinition, 'timeDate');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to non-interrupting timer boundary event (intermediate catch event)', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              intermediateCatchEvent = moddle.create('bpmn:IntermediateCatchEvent'),
              timeDate = moddle.create('bpmn:FormalExpression', { body: '2019-10-01T12:00:00Z' });

        intermediateCatchEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = intermediateCatchEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDate, timerEventDefinition, 'timeDate');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to timer boundary event', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              boundaryEvent = moddle.create('bpmn:BoundaryEvent'),
              timeDate = moddle.create('bpmn:FormalExpression', { body: '2019-10-01T12:00:00Z' });

        boundaryEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = boundaryEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDate, timerEventDefinition, 'timeDate');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to non-interrupting timer boundary event (boundary event)', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              boundaryEvent = moddle.create('bpmn:BoundaryEvent', { cancelActivity: false }),
              timeDate = moddle.create('bpmn:FormalExpression', { body: '2019-10-01T12:00:00Z' });

        boundaryEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = boundaryEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDate, timerEventDefinition, 'timeDate');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to timer start event in event subprocess', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              startEvent = moddle.create('bpmn:StartEvent'),
              eventSubProcess = moddle.create('bpmn:SubProcess', { triggeredByEvent: true }),
              timeDate = moddle.create('bpmn:FormalExpression', { body: '2019-10-01T12:00:00Z' });

        startEvent.$parent = eventSubProcess;
        startEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = startEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDate, timerEventDefinition, 'timeDate');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to non-interrupting timer start event in event subprocess', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              startEvent = moddle.create('bpmn:StartEvent', { isInterrupting: false }),
              eventSubProcess = moddle.create('bpmn:SubProcess', { triggeredByEvent: true }),
              timeDate = moddle.create('bpmn:FormalExpression', { body: '2019-10-01T12:00:00Z' });

        startEvent.$parent = eventSubProcess;
        startEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = startEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDate, timerEventDefinition, 'timeDate');

        // then
        expect(canCopyProperty).not.to.be.false;
      });

    });


    describe('timeDuration', function() {


      it('should allow to copy to non-interrupting timer boundary event (intermediate catch event)', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              intermediateCatchEvent = moddle.create('bpmn:IntermediateCatchEvent'),
              timeDuration = moddle.create('bpmn:FormalExpression', { body: 'P14D' });

        intermediateCatchEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = intermediateCatchEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDuration, timerEventDefinition, 'timeDuration');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to timer boundary event', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              boundaryEvent = moddle.create('bpmn:BoundaryEvent'),
              timeDuration = moddle.create('bpmn:FormalExpression', { body: 'P14D' });

        boundaryEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = boundaryEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDuration, timerEventDefinition, 'timeDuration');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to non-interrupting timer boundary event (boundary event)', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              boundaryEvent = moddle.create('bpmn:BoundaryEvent', { cancelActivity: false }),
              timeDuration = moddle.create('bpmn:FormalExpression', { body: 'P14D' });

        boundaryEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = boundaryEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDuration, timerEventDefinition, 'timeDuration');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to timer start event in event subprocess', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              startEvent = moddle.create('bpmn:StartEvent'),
              eventSubProcess = moddle.create('bpmn:SubProcess', { triggeredByEvent: true }),
              timeDuration = moddle.create('bpmn:FormalExpression', { body: 'P14D' });

        startEvent.$parent = eventSubProcess;
        startEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = startEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDuration, timerEventDefinition, 'timeDuration');

        // then
        expect(canCopyProperty).not.to.be.false;
      });


      it('should allow to copy to non-interrupting timer start event in event subprocess', function() {

        // given
        const timerEventDefinition = moddle.create('bpmn:TimerEventDefinition'),
              startEvent = moddle.create('bpmn:StartEvent', { isInterrupting: false }),
              eventSubProcess = moddle.create('bpmn:SubProcess', { triggeredByEvent: true }),
              timeDuration = moddle.create('bpmn:FormalExpression', { body: 'P14D' });

        startEvent.$parent = eventSubProcess;
        startEvent.set('eventDefinitions', [ timerEventDefinition ]);

        timerEventDefinition.$parent = startEvent;

        // when
        const canCopyProperty = copyPasteBehavior.canCopyProperty(timeDuration, timerEventDefinition, 'timeDuration');

        // then
        expect(canCopyProperty).not.to.be.false;
      });

    });

  });

});


// helpers //////////

function EventBusMock() {
  this.on = function() {};
}
