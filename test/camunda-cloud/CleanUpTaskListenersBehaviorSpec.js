import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './task-listeners.bpmn';


describe('camunda-cloud/features/modeling - CleanUpTaskListenersBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));

  describe('remove task listeners if disallowed in element type', function() {

    const testCases = [
      {
        title: 'User Task -> Start Event',
        element: 'UserTask',
        target: {
          type: 'bpmn:StartEvent'
        }
      },
      {
        title: 'User Task -> ParallelGateway',
        element: 'UserTask',
        target: {
          type: 'bpmn:ParallelGateway'
        }
      }
    ];

    for (const { title, element, target } of testCases) {

      describe(title, function() {

        it('should execute', inject(function(bpmnReplace, elementRegistry) {

          // given
          let el = elementRegistry.get(element);

          // when
          bpmnReplace.replaceElement(el, target);

          // then
          el = elementRegistry.get(element);

          const taskListenersContainer = getTaskListenersContainer(el);

          expect(taskListenersContainer).not.to.exist;
        }));


        it('should undo', inject(function(bpmnReplace, commandStack, elementRegistry) {

          // given
          let el = elementRegistry.get(element);

          // when
          bpmnReplace.replaceElement(el, target);

          commandStack.undo();

          // then
          el = elementRegistry.get(element);
          const extensionElements = getBusinessObject(el).get('extensionElements');

          expect(extensionElements.get('values')).to.have.lengthOf(2);
        }));


        it('should redo', inject(function(bpmnReplace, commandStack, elementRegistry) {

          // given
          let el = elementRegistry.get(element);

          // when
          bpmnReplace.replaceElement(el, target);

          commandStack.undo();
          commandStack.redo();

          // then
          el = elementRegistry.get(element);
          const taskListenersContainer = getTaskListenersContainer(el);

          expect(taskListenersContainer).not.to.exist;
        }));
      });
    }
  });

  describe('should remove task listeners of disallowed type', function() {

    it('should execute', inject(function(bpmnReplace, elementRegistry) {

      // given
      let el = elementRegistry.get('UserTaskWrongType');
      let targetEl = elementRegistry.get('UserTask');

      // when
      bpmnReplace.replaceElement(el, targetEl);

      // then
      el = elementRegistry.get('UserTaskWrongType');
      const container = getExtensionElementsList(getBusinessObject(el), 'zeebe:TaskListeners')[0];

      expect(container.get('listeners')).to.have.lengthOf(1);
    }));


    it('should undo', inject(function(bpmnReplace, commandStack, elementRegistry) {

      // given
      let el = elementRegistry.get('UserTaskWrongType');
      let targetEl = elementRegistry.get('UserTask');

      // when
      bpmnReplace.replaceElement(el, targetEl);

      commandStack.undo();

      // then
      el = elementRegistry.get('UserTaskWrongType');
      const container = getExtensionElementsList(getBusinessObject(el), 'zeebe:TaskListeners')[0];

      expect(container.get('listeners')).to.have.lengthOf(2);
    }));


    it('should redo', inject(function(bpmnReplace, commandStack, elementRegistry) {

      // given
      let el = elementRegistry.get('UserTaskWrongType');
      let targetEl = elementRegistry.get('UserTask');

      // when
      bpmnReplace.replaceElement(el, targetEl);

      commandStack.undo();
      commandStack.redo();

      // then
      el = elementRegistry.get('UserTaskWrongType');
      const container = getExtensionElementsList(getBusinessObject(el), 'zeebe:TaskListeners')[0];

      expect(container.get('listeners')).to.have.lengthOf(1);
    }));


    it('should remove zeebe:TaskListeners for non zeebe user task', inject(function(bpmnReplace, elementRegistry) {

      // given
      let el = elementRegistry.get('NonZeebeUserTask');
      const targetEl = elementRegistry.get('UserTask');

      // when
      bpmnReplace.replaceElement(el, targetEl);

      // then
      el = elementRegistry.get('NonZeebeUserTask');
      const extensionElements = getBusinessObject(el).get('extensionElements');

      expect(extensionElements.get('values')).to.have.lengthOf(0);
    }));


    it('should remove zeebe:TaskListeners', inject(function(elementRegistry, modeling) {

      // given
      const el = elementRegistry.get('UserTask');
      const listenersContainer = getTaskListenersContainer(el);

      // when
      modeling.updateModdleProperties(el, listenersContainer, { listeners: [] });

      // then
      const extensionElements = getBusinessObject(el).get('extensionElements');

      expect(extensionElements.get('values')).to.have.lengthOf(1);
    }));
  });
});

function getTaskListenersContainer(element) {
  return getExtensionElementsList(getBusinessObject(element), 'zeebe:TaskListeners')[0];
}
