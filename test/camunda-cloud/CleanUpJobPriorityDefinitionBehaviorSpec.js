import { expect } from 'chai';

import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import diagramXML from './process-job-priority.bpmn';


describe('camunda-cloud/features/modeling - CleanUpJobPriorityDefinitionBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  describe('BusinessRuleTask implementation changed to DMN decision', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('BusinessRuleTaskWithJobPriority');

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            calledDecision = bpmnFactory.create('zeebe:CalledDecision', {
              decisionId: 'a',
              resultVariable: 'b'
            });

      calledDecision.$parent = extensionElements;

      // when
      const values = extensionElements.get('values')
        .filter(value => value.$type !== 'zeebe:TaskDefinition')
        .concat(calledDecision);

      modeling.updateModdleProperties(element, extensionElements, {
        values
      });
    }));


    it('should execute', function() {

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('50');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).not.to.exist;
    }));

  });


  describe('BusinessRuleTask updated but stays as job worker', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('BusinessRuleTaskWithJobPriority');

      const businessObject = getBusinessObject(element),
            extensionElements = businessObject.get('extensionElements'),
            taskHeaders = bpmnFactory.create('zeebe:TaskHeaders', {});

      taskHeaders.$parent = extensionElements;

      // when
      const values = extensionElements.get('values').concat(taskHeaders);

      modeling.updateModdleProperties(element, extensionElements, {
        values
      });
    }));


    it('should NOT execute', inject(function() {

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).to.exist;
    }));

  });


  describe('ServiceTask morphed to UserTask', function() {

    let newElement;

    beforeEach(inject(function(bpmnReplace, elementRegistry) {

      // given
      const serviceTask = elementRegistry.get('ServiceTaskWithJobPriority');

      // when
      bpmnReplace.replaceElement(serviceTask, { type: 'bpmn:UserTask' });

      newElement = elementRegistry.get('ServiceTaskWithJobPriority');
    }));


    it('should execute', inject(function() {

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).not.to.exist;
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // when
      commandStack.undo();

      newElement = elementRegistry.get('ServiceTaskWithJobPriority');

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('50');
    }));


    it('should undo/redo', inject(function(commandStack, elementRegistry) {

      // when
      commandStack.undo();
      commandStack.redo();

      newElement = elementRegistry.get('ServiceTaskWithJobPriority');

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).not.to.exist;
    }));

  });


  describe('ServiceTask morphed to another ZeebeServiceTask type', function() {

    let newElement;

    beforeEach(inject(function(bpmnReplace, elementRegistry) {

      // given
      const serviceTask = elementRegistry.get('ServiceTaskWithJobPriority');

      // when
      bpmnReplace.replaceElement(serviceTask, { type: 'bpmn:ScriptTask' });

      newElement = elementRegistry.get('ServiceTaskWithJobPriority');
    }));


    it('should execute', inject(function() {

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('50');
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // when
      commandStack.undo();

      newElement = elementRegistry.get('ServiceTaskWithJobPriority');

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('50');
    }));


    it('should undo/redo', inject(function(commandStack, elementRegistry) {

      // when
      commandStack.undo();
      commandStack.redo();

      newElement = elementRegistry.get('ServiceTaskWithJobPriority');

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('50');
    }));

  });


  describe('MessageEndEvent morphed to ErrorEndEvent', function() {

    let newElement;

    beforeEach(inject(function(bpmnReplace, elementRegistry) {

      // given
      const messageEndEvent = elementRegistry.get('MessageEndEventWithJobPriority');

      // when
      bpmnReplace.replaceElement(messageEndEvent, {
        type: 'bpmn:EndEvent', eventDefinitionType: 'bpmn:ErrorEventDefinition'
      });

      newElement = elementRegistry.get('MessageEndEventWithJobPriority');
    }));


    it('should execute', inject(function() {

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).not.to.exist;
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // when
      commandStack.undo();

      newElement = elementRegistry.get('MessageEndEventWithJobPriority');

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('50');
    }));


    it('should undo/redo', inject(function(commandStack, elementRegistry) {

      // when
      commandStack.undo();
      commandStack.redo();

      newElement = elementRegistry.get('MessageEndEventWithJobPriority');

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(newElement);

      expect(jobPriorityDefinition).not.to.exist;
    }));

  });


  describe('priority erased', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('BusinessRuleTaskWithJobPriority');
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      // when
      modeling.updateModdleProperties(element, jobPriorityDefinition, {
        priority: undefined
      });
    }));


    it('should execute', function() {

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('50');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).not.to.exist;
    }));

  });


  describe('priority changed', function() {

    let element;

    beforeEach(inject(function(bpmnFactory, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('BusinessRuleTaskWithJobPriority');
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      // when
      modeling.updateModdleProperties(element, jobPriorityDefinition, {
        priority: '100'
      });
    }));


    it('should execute', function() {

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('100');
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('50');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const jobPriorityDefinition = getJobPriorityDefinition(element);

      expect(jobPriorityDefinition).to.exist;
      expect(jobPriorityDefinition.priority).to.equal('100');
    }));

  });

});


// helpers //////////

function getJobPriorityDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:JobPriorityDefinition')[ 0 ];
}
