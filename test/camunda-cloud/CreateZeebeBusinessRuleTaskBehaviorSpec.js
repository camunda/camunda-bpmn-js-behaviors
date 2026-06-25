import { expect } from 'chai';

import { bootstrapCamundaCloudModeler, inject } from 'test/TestHelper';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { find } from 'min-dash';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';


import emptyProcessDiagramXML from './process-empty.bpmn';
import businessRuleTasksXML from './process-businessRuleTask.bpmn';


describe('camunda-cloud/features/modeling - CreateZeebeBusinessRuleTaskBehavior', function() {

  describe('when a shape is created', function() {

    beforeEach(bootstrapCamundaCloudModeler(emptyProcessDiagramXML));


    it('should add zeebe:CalledDecision when creating bpmn:BusinessRuleTask', inject(function(
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:BusinessRuleTask' },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            calledDecisionExtensions = getExtensionElementsList(businessObject, 'zeebe:CalledDecision');

      expect(calledDecisionExtensions).to.exist;
      expect(calledDecisionExtensions).to.have.lengthOf(1);
    }));


    it('should NOT add zeebe:CalledDecision if zeebe:CalledDecision already present', inject(function(
        canvas,
        bpmnFactory,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement(),
            bo = bpmnFactory.create('bpmn:BusinessRuleTask', {
              extensionElements: bpmnFactory.create('bpmn:ExtensionElements', {
                values: [ bpmnFactory.create('zeebe:CalledDecision', {
                  decisionId: 'myDecision',
                  resultVariable: 'result'
                }) ],
              }),
            });

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:BusinessRuleTask', businessObject: bo },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            calledDecisionExtensions = getExtensionElementsList(businessObject, 'zeebe:CalledDecision');

      expect(calledDecisionExtensions).to.exist;
      expect(calledDecisionExtensions).to.have.lengthOf(1);
    }));


    it('should NOT add zeebe:CalledDecision if zeebe:TaskDefinition already present', inject(function(
        canvas,
        bpmnFactory,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement(),
            bo = bpmnFactory.create('bpmn:BusinessRuleTask', {
              extensionElements: bpmnFactory.create('bpmn:ExtensionElements', {
                values: [ bpmnFactory.create('zeebe:TaskDefinition', { type: 'my-job' }) ],
              }),
            });

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:BusinessRuleTask', businessObject: bo },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            calledDecisionExtensions = getExtensionElementsList(businessObject, 'zeebe:CalledDecision');

      expect(calledDecisionExtensions).to.have.lengthOf(0);
    }));


    it('should NOT add zeebe:CalledDecision when creating bpmn:Task', inject(function(
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:Task' },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const calledDecision = getCalledDecision(newShape);

      expect(calledDecision).not.to.exist;
    }));
  });


  describe('when a shape is pasted', function() {

    beforeEach(bootstrapCamundaCloudModeler(businessRuleTasksXML));


    it('should NOT add zeebe:CalledDecision to pasted bpmn:BusinessRuleTask with job worker', inject(function(
        canvas,
        copyPaste,
        elementRegistry
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_2'); // has zeebe:TaskDefinition

      // when
      copyPaste.copy(businessRuleTask);

      const elements = copyPaste.paste({
        element: rootElement,
        point: { x: 1000, y: 1000 },
      });

      // then
      const pastedTask = find(elements, (element) =>
        is(element, 'bpmn:BusinessRuleTask')
      );

      const calledDecisionExtensions = getExtensionElementsList(
        getBusinessObject(pastedTask), 'zeebe:CalledDecision'
      );

      // job worker implementation should be preserved
      expect(calledDecisionExtensions).to.have.lengthOf(0);
    }));


    it('should keep existing zeebe:CalledDecision on paste', inject(function(
        canvas,
        copyPaste,
        elementRegistry
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_1'); // has zeebe:CalledDecision

      // when
      copyPaste.copy(businessRuleTask);

      const elements = copyPaste.paste({
        element: rootElement,
        point: { x: 1000, y: 1000 },
      });

      // then
      const pastedTask = find(elements, (element) =>
        is(element, 'bpmn:BusinessRuleTask')
      );

      const calledDecisionExtensions = getExtensionElementsList(
        getBusinessObject(pastedTask), 'zeebe:CalledDecision'
      );

      expect(calledDecisionExtensions).to.exist;
      expect(calledDecisionExtensions).to.have.lengthOf(1);
    }));
  });


  describe('when a shape is replaced', function() {

    beforeEach(bootstrapCamundaCloudModeler(emptyProcessDiagramXML));


    it('should add zeebe:CalledDecision when replacing bpmn:Task with bpmn:BusinessRuleTask', inject(function(
        elementRegistry,
        bpmnReplace,
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const task = modeling.createShape(
        { type: 'bpmn:Task', id: 'simpleTask' },
        { x: 100, y: 100 },
        rootElement
      );

      // when
      bpmnReplace.replaceElement(task, { type: 'bpmn:BusinessRuleTask' });

      // then
      const updatedTask = elementRegistry.get(task.id),
            calledDecision = getCalledDecision(updatedTask);

      expect(calledDecision).to.exist;
    }));


    it('should NOT add zeebe:CalledDecision when replacing bpmn:ServiceTask (with zeebe:TaskDefinition) with bpmn:BusinessRuleTask', inject(function(
        elementRegistry,
        bpmnFactory,
        bpmnReplace,
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      const bo = bpmnFactory.create('bpmn:ServiceTask', {
        id: 'serviceTask',
        extensionElements: bpmnFactory.create('bpmn:ExtensionElements', {
          values: [ bpmnFactory.create('zeebe:TaskDefinition', { type: 'my-job' }) ],
        }),
      });

      const serviceTask = modeling.createShape(
        { type: 'bpmn:ServiceTask', businessObject: bo, id: 'serviceTask' },
        { x: 100, y: 100 },
        rootElement
      );

      // when
      bpmnReplace.replaceElement(serviceTask, { type: 'bpmn:BusinessRuleTask' });

      // then
      const updatedTask = elementRegistry.get(serviceTask.id);
      const calledDecisionExtensions = getExtensionElementsList(
        getBusinessObject(updatedTask), 'zeebe:CalledDecision'
      );

      // existing job worker implementation must be preserved
      expect(calledDecisionExtensions).to.have.lengthOf(0);
    }));


    it('should NOT add zeebe:CalledDecision when replacing bpmn:BusinessRuleTask with bpmn:ServiceTask', inject(function(
        elementRegistry,
        bpmnReplace,
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const task = modeling.createShape(
        { type: 'bpmn:Task', id: 'simpleTask' },
        { x: 100, y: 100 },
        rootElement
      );
      bpmnReplace.replaceElement(task, { type: 'bpmn:ServiceTask' });

      // then
      const updatedTask = elementRegistry.get(task.id),
            calledDecision = getCalledDecision(updatedTask);

      expect(calledDecision).not.to.exist;
    }));
  });
});


// helpers //////////

function getCalledDecision(element) {
  const businessObject = getBusinessObject(element);
  const calledDecisionElements = getExtensionElementsList(businessObject, 'zeebe:CalledDecision');

  return calledDecisionElements[0] || null;
}
