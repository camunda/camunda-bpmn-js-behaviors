import { bootstrapCamundaCloudModeler, inject } from 'test/TestHelper';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { find } from 'min-dash';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';


import emptyProcessDiagramXML from './process-empty.bpmn';
import userTasksXML from './process-user-tasks.bpmn';

describe('camunda-cloud/features/modeling - CreateZeebeUserTaskBehavior', function() {

  describe('when a shape is created', function() {

    beforeEach(bootstrapCamundaCloudModeler(emptyProcessDiagramXML));


    it('should execute when creating bpmn:UserTask', inject(function(
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:UserTask' },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            zeebeUserTaskExtensions = getExtensionElementsList(businessObject, 'zeebe:UserTask');

      expect(zeebeUserTaskExtensions).to.exist;
      expect(zeebeUserTaskExtensions).to.have.lengthOf(1);
    }));


    it('should NOT execute when zeebe:UserTask already present', inject(function(
        canvas,
        bpmnFactory,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement(),
            bo = bpmnFactory.create('bpmn:UserTask', {
              extensionElements: bpmnFactory.create('bpmn:ExtensionElements', {
                values: [ bpmnFactory.create('zeebe:UserTask') ],
              }),
            });

      // when
      const newShape = modeling.createShape(
        { type: 'bpmn:UserTask', businessObject: bo },
        { x: 100, y: 100 },
        rootElement
      );

      // then
      const businessObject = getBusinessObject(newShape),
            zeebeUserTaskExtensions = getExtensionElementsList(businessObject, 'zeebe:UserTask');

      expect(zeebeUserTaskExtensions).to.exist;
      expect(zeebeUserTaskExtensions).to.have.lengthOf(1);
    }));


    it('should NOT execute when creating bpmn:Task', inject(function(
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
      const zeebeUserTaskExtension = getZeebeUserTask(newShape);

      expect(zeebeUserTaskExtension).not.to.exist;
    }));
  });


  describe('when a shape is pasted', function() {

    beforeEach(bootstrapCamundaCloudModeler(userTasksXML));


    it('should NOT add zeebe:UserTask', inject(function(
        canvas,
        copyPaste,
        elementRegistry
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const userTask = elementRegistry.get('UserTask_1');

      // when
      copyPaste.copy(userTask);

      const elements = copyPaste.paste({
        element: rootElement,
        point: {
          x: 1000,
          y: 1000,
        },
      });

      // then
      const pastedUserTask = find(elements, (element) =>
        is(element, 'bpmn:UserTask')
      );

      const zeebeUserTask = getZeebeUserTask(pastedUserTask);

      expect(zeebeUserTask).not.to.exist;
    }));


    it('should keep existing zeebe:UserTask', inject(function(
        canvas,
        copyPaste,
        elementRegistry
    ) {

      // given
      const rootElement = canvas.getRootElement();
      const userTask = elementRegistry.get('withZeebeUserTask');

      // when
      copyPaste.copy(userTask);

      const elements = copyPaste.paste({
        element: rootElement,
        point: {
          x: 1000,
          y: 1000,
        },
      });

      // then
      const pastedUserTask = find(elements, (element) =>
        is(element, 'bpmn:UserTask')
      );
      const zeebeUserTasks = getExtensionElementsList(pastedUserTask, 'zeebe:UserTask');

      expect(zeebeUserTasks).to.exist;
      expect(zeebeUserTasks).to.have.lengthOf(1);
    }));
  });


  describe('when a shape is replaced', function() {

    beforeEach(bootstrapCamundaCloudModeler(userTasksXML));


    it('should add zeebe:UserTask when target is bpmn:UserTask', inject(function(
        elementRegistry,
        bpmnReplace,
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const task = modeling.createShape(
        { type: 'bpmn:Task', id: 'simpleTask' },
        { x: 100, y: 100 },
        rootElement
      );
      bpmnReplace.replaceElement(task, { type: 'bpmn:UserTask' });

      // then
      const updatedTask = elementRegistry.get(task.id),
            zeebeUserTaskExtension = getZeebeUserTask(updatedTask);

      expect(zeebeUserTaskExtension).to.exist;
    }));


    it('should NOT add zeebe:UserTask when target is bpmn:ServiceTask', inject(function(
        elementRegistry,
        bpmnReplace,
        canvas,
        modeling
    ) {

      // given
      const rootElement = canvas.getRootElement();

      // when
      const task = modeling.createShape(
        { type: 'bpmn:Task', id: 'simpleTask' },
        { x: 100, y: 100 },
        rootElement
      );
      bpmnReplace.replaceElement(task, { type: 'bpmn:ServiceTask' });

      // then
      const updatedTask = elementRegistry.get(task.id),
            zeebeUserTask = getZeebeUserTask(updatedTask);

      expect(zeebeUserTask).not.to.exist;
    }));
  });
});


// helpers //////////

/**
 * Get the first zeebe:userTask element of an element.
 *
 * @param {djs.model.Base|ModdleElement} element
 *
 * @returns {ModdleElement|null}
 */
function getZeebeUserTask(element) {
  const businessObject = getBusinessObject(element);
  const userTaskElements = getExtensionElementsList(businessObject, 'zeebe:UserTask');

  return userTaskElements[0] || null;
}
