import { expect } from 'chai';

import { bootstrapCamundaCloudModeler, inject } from 'test/TestHelper';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { find } from 'min-dash';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';


import emptyProcessDiagramXML from './process-empty.bpmn';
import scriptTasksXML from './process-scriptTasks.bpmn';


describe('camunda-cloud/features/modeling - CreateZeebeScriptTaskBehavior', function() {

  describe('when a shape is created', function() {

    beforeEach(bootstrapCamundaCloudModeler(emptyProcessDiagramXML));


    it('should add zeebe:Script when creating bpmn:ScriptTask', inject(function(
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:ScriptTask' },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            scriptExtensions = getExtensionElementsList(businessObject, 'zeebe:Script');

      expect(scriptExtensions).to.exist;
      expect(scriptExtensions).to.have.lengthOf(1);
    }));


    it('should NOT add zeebe:Script if zeebe:Script already present', inject(function(
        canvas,
        bpmnFactory,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement(),
            bo = bpmnFactory.create('bpmn:ScriptTask', {
              extensionElements: bpmnFactory.create('bpmn:ExtensionElements', {
                values: [ bpmnFactory.create('zeebe:Script', {
                  expression: '= 1 + 1',
                  resultVariable: 'result'
                }) ],
              }),
            });

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:ScriptTask', businessObject: bo },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            scriptExtensions = getExtensionElementsList(businessObject, 'zeebe:Script');

      expect(scriptExtensions).to.exist;
      expect(scriptExtensions).to.have.lengthOf(1);
    }));


    it('should NOT add zeebe:Script if zeebe:TaskDefinition already present', inject(function(
        canvas,
        bpmnFactory,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement(),
            bo = bpmnFactory.create('bpmn:ScriptTask', {
              extensionElements: bpmnFactory.create('bpmn:ExtensionElements', {
                values: [ bpmnFactory.create('zeebe:TaskDefinition', { type: 'my-job' }) ],
              }),
            });

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:ScriptTask', businessObject: bo },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            scriptExtensions = getExtensionElementsList(businessObject, 'zeebe:Script');

      expect(scriptExtensions).to.have.lengthOf(0);
    }));


    it('should NOT add zeebe:Script when creating bpmn:Task', inject(function(
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
      const scriptExtension = getScript(newShape);

      expect(scriptExtension).not.to.exist;
    }));
  });


  describe('when a shape is pasted', function() {

    beforeEach(bootstrapCamundaCloudModeler(scriptTasksXML));


    it('should NOT add zeebe:Script to pasted bpmn:ScriptTask with job worker implementation', inject(function(
        canvas,
        copyPaste,
        elementRegistry
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // ScriptTask_jobWorker has zeebe:TaskDefinition (job worker) — paste it
      const scriptTask = elementRegistry.get('ScriptTask_jobWorker');

      // when
      copyPaste.copy(scriptTask);

      const elements = copyPaste.paste({
        element: rootElement,
        point: { x: 1000, y: 1000 },
      });

      // then
      const pastedScriptTask = find(elements, (element) =>
        is(element, 'bpmn:ScriptTask')
      );

      const scriptExtensions = getExtensionElementsList(
        getBusinessObject(pastedScriptTask), 'zeebe:Script'
      );

      // job worker implementation should be preserved, no zeebe:Script added
      expect(scriptExtensions).to.have.lengthOf(0);
    }));


    it('should keep existing zeebe:Script on paste', inject(function(
        canvas,
        copyPaste,
        elementRegistry
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const scriptTask = elementRegistry.get('ScriptTask_feelExpression');

      // when
      copyPaste.copy(scriptTask);

      const elements = copyPaste.paste({
        element: rootElement,
        point: { x: 1000, y: 1000 },
      });

      // then
      const pastedScriptTask = find(elements, (element) =>
        is(element, 'bpmn:ScriptTask')
      );

      const scriptExtensions = getExtensionElementsList(
        getBusinessObject(pastedScriptTask), 'zeebe:Script'
      );

      expect(scriptExtensions).to.exist;
      expect(scriptExtensions).to.have.lengthOf(1);
    }));
  });


  describe('when a shape is replaced', function() {

    beforeEach(bootstrapCamundaCloudModeler(emptyProcessDiagramXML));


    it('should add zeebe:Script when replacing bpmn:Task with bpmn:ScriptTask', inject(function(
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
      bpmnReplace.replaceElement(task, { type: 'bpmn:ScriptTask' });

      // then
      const updatedTask = elementRegistry.get(task.id),
            scriptExtension = getScript(updatedTask);

      expect(scriptExtension).to.exist;
    }));


    it('should NOT add zeebe:Script when replacing bpmn:ServiceTask (with zeebe:TaskDefinition) with bpmn:ScriptTask', inject(function(
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
      bpmnReplace.replaceElement(serviceTask, { type: 'bpmn:ScriptTask' });

      // then
      const updatedTask = elementRegistry.get(serviceTask.id);
      const scriptExtensions = getExtensionElementsList(
        getBusinessObject(updatedTask), 'zeebe:Script'
      );

      // existing job worker implementation must be preserved
      expect(scriptExtensions).to.have.lengthOf(0);
    }));


    it('should NOT carry over zeebe:Script when replacing bpmn:ScriptTask with bpmn:ServiceTask', inject(function(
        elementRegistry,
        bpmnReplace,
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // Create a ScriptTask — behavior adds zeebe:Script automatically
      const scriptTask = modeling.createShape(
        { type: 'bpmn:ScriptTask', id: 'scriptTask' },
        { x: 100, y: 100 },
        rootElement
      );

      // when
      bpmnReplace.replaceElement(scriptTask, { type: 'bpmn:ServiceTask' });

      // then
      const updatedTask = elementRegistry.get(scriptTask.id),
            script = getScript(updatedTask);

      expect(script).not.to.exist;
    }));
  });
});


// helpers //////////

function getScript(element) {
  const businessObject = getBusinessObject(element);
  const scriptElements = getExtensionElementsList(businessObject, 'zeebe:Script');

  return scriptElements[0] || null;
}
