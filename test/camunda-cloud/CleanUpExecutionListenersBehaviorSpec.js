import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './execution-listeners.bpmn';


describe('camunda-cloud/features/modeling - CleanUpExecutionListenersBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  it('should keep valid execution listeners', inject(function(bpmnReplace, elementRegistry) {

    // given
    const el = elementRegistry.get('Gateway');

    // when
    const result = bpmnReplace.replaceElement(el, {
      type: 'bpmn:InclusiveGateway'
    });

    // then
    const container = getExtensionElementsList(getBusinessObject(result), 'zeebe:ExecutionListeners')[0];

    expect(container.get('listeners')).to.have.lengthOf(2);
  }));


  describe('remove execution listeners if disallowed in element type', function() {

    const testCases = [
      {
        title: 'Timer Boundary Event -> Compensation Boundary Event',
        element: 'BoundaryEvent',
        target: {
          type: 'bpmn:BoundaryEvent',
          eventDefinitionType: 'bpmn:CompensateEventDefinition'
        }
      },
      {
        title: 'Timer End Event -> Error End Event',
        element: 'TimerEndEvent',
        target: {
          type: 'bpmn:EndEvent',
          eventDefinitionType: 'bpmn:ErrorEventDefinition'
        }
      },
      {
        title: 'Exclusive Gateway -> Complex Gateway',
        element: 'Gateway',
        target: {
          type: 'bpmn:ComplexGateway'
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
          const executionListenersContainer = getExecutionListenersContainer(el);

          expect(executionListenersContainer).not.to.exist;
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

          expect(extensionElements.get('values')).to.have.lengthOf(1);
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
          const executionListenersContainer = getExecutionListenersContainer(el);

          expect(executionListenersContainer).not.to.exist;
        }));
      });
    }
  });

  describe('remove execution listeners of disallowed type', function() {

    const testCases = [
      {
        title: 'End Event -> Start Event',
        element: 'EndEvent',
        target: {
          type: 'bpmn:StartEvent'
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
          const container = getExtensionElementsList(getBusinessObject(el), 'zeebe:ExecutionListeners')[0];

          expect(container.get('listeners')).to.have.lengthOf(1);
        }));


        it('should undo', inject(function(bpmnReplace, commandStack, elementRegistry) {

          // given
          let el = elementRegistry.get(element);

          // when
          bpmnReplace.replaceElement(el, target);

          commandStack.undo();

          // then
          el = elementRegistry.get(element);
          const container = getExtensionElementsList(getBusinessObject(el), 'zeebe:ExecutionListeners')[0];

          expect(container.get('listeners')).to.have.lengthOf(2);
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
          const container = getExtensionElementsList(getBusinessObject(el), 'zeebe:ExecutionListeners')[0];

          expect(container.get('listeners')).to.have.lengthOf(1);
        }));
      });
    }


    it('should remove zeebe:ExecutionListeners', inject(function(elementRegistry, modeling) {

      // given
      const el = elementRegistry.get('SingleListener');
      const listenersContainer = getExecutionListenersContainer(el);

      // when
      modeling.updateModdleProperties(el, listenersContainer, { listeners: [] });

      // then
      const extensionElements = getBusinessObject(el).get('extensionElements');

      expect(extensionElements.get('values')).to.have.lengthOf(1);
    }));
  });
});

function getExecutionListenersContainer(element) {
  return getExtensionElementsList(getBusinessObject(element), 'zeebe:ExecutionListeners')[0];
}
