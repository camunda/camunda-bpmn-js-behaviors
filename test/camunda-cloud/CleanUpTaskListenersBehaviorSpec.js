import {
  bootstrapCamundaCloudModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

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
          const extensionElements = getElementExtensions(el);

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
      const container = getFirstExtensionElement(el, 'zeebe:TaskListeners');

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
      const container = getFirstExtensionElement(el, 'zeebe:TaskListeners');

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
      const container = getFirstExtensionElement(el, 'zeebe:TaskListeners');

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
      const extensionElements = getElementExtensions(el);

      expect(extensionElements.get('values')).to.have.lengthOf(0);
    }));


    it('should remove zeebe:TaskListeners container when empty', inject(function(elementRegistry, modeling) {

      // given
      const el = elementRegistry.get('UserTask');
      const listenersContainer = getTaskListenersContainer(el);

      // when
      modeling.updateModdleProperties(el, listenersContainer, { listeners: [] });

      // then
      const extensionElements = getElementExtensions(el);

      expect(extensionElements.get('values')).to.have.lengthOf(1);
    }));


    it('should remove zeebe:TaskListeners when user task is not zeebe user task', inject(function(elementRegistry, modeling) {

      // given
      const el = elementRegistry.get('UserTask');

      // when
      const extensionElements = getElementExtensions(el);
      modeling.updateModdleProperties(el, extensionElements, { values: removeZeebeUserTask(extensionElements) });

      // then
      const listenersContainer = getTaskListenersContainer(el);
      expect(listenersContainer).not.to.exist;
    }));


    it('should NOT remove zeebe:TaskListeners when an unrelated property is added', inject(function(elementRegistry, modeling) {

      // given
      const el = elementRegistry.get('UserTask');

      // when
      addFormDefinition(el);

      // then
      const extensionElements = getElementExtensions(el);

      const taskListeners = getFirstExtensionElement(el, 'zeebe:TaskListeners');
      const userTask = getFirstExtensionElement(el, 'zeebe:UserTask');
      const formDefinition = getFirstExtensionElement(el, 'zeebe:FormDefinition');

      expect(extensionElements.get('values')).to.have.lengthOf(3);
      expect(taskListeners).to.exist;
      expect(userTask).to.exist;
      expect(formDefinition).to.exist;
    }));
  });
});


// helpers

function getElementExtensions(element) {
  return getBusinessObject(element).get('extensionElements');
}

function getFirstExtensionElement(element, type) {
  return getExtensionElementsList(getBusinessObject(element), type)[0];
}

function getTaskListenersContainer(element) {
  return getFirstExtensionElement(element, 'zeebe:TaskListeners');
}

function removeZeebeUserTask(extensionElements) {
  return extensionElements.get('values').filter(extensionElement => !is(extensionElement, 'zeebe:UserTask'));
}

function addFormDefinition(element) {
  getBpmnJS().invoke(function(bpmnFactory, modeling) {
    const extensionElements = getElementExtensions(element);
    const values = extensionElements.get('values'),
          formDefinition = bpmnFactory.create('zeebe:FormDefinition');

    modeling.updateModdleProperties(element, extensionElements, {
      values: values.concat(formDefinition)
    });
  });
}