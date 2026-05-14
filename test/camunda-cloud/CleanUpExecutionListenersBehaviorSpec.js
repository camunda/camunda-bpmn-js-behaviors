import { expect } from 'chai';

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


  describe('remove `beforeAll` listeners when multi-instance is removed', function() {

    it('should remove `beforeAll` and keep `start` / `end`',
      inject(function(elementRegistry, modeling) {

        // given
        const el = elementRegistry.get('MultiInstanceTask');

        // when
        modeling.updateProperties(el, { loopCharacteristics: undefined });

        // then
        const listeners = getListeners(el);
        expect(listeners).to.have.lengthOf(2);
        expect(listeners.map(l => l.get('eventType'))).to.eql([ 'start', 'end' ]);
      })
    );


    it('should remove `beforeAll` when multi-instance is removed via `updateModdleProperties`',
      inject(function(elementRegistry, modeling) {

        // given
        const el = elementRegistry.get('MultiInstanceTask');
        const bo = getBusinessObject(el);

        // when
        modeling.updateModdleProperties(el, bo, { loopCharacteristics: undefined });

        // then
        const listeners = getListeners(el);
        expect(listeners).to.have.lengthOf(2);
        expect(listeners.map(l => l.get('eventType'))).to.eql([ 'start', 'end' ]);
      })
    );


    it('should remove the listeners container when only `beforeAll` was present',
      inject(function(elementRegistry, modeling) {

        // given
        const el = elementRegistry.get('MultiInstanceTask_OnlyBeforeAll');

        // when
        modeling.updateProperties(el, { loopCharacteristics: undefined });

        // then
        const container = getExecutionListenersContainer(el);
        expect(container).not.to.exist;
      })
    );


    it('should undo',
      inject(function(elementRegistry, modeling, commandStack) {

        // given
        const el = elementRegistry.get('MultiInstanceTask');

        // when
        modeling.updateProperties(el, { loopCharacteristics: undefined });
        commandStack.undo();

        // then
        const listeners = getListeners(el);
        expect(listeners).to.have.lengthOf(3);
        expect(listeners.map(l => l.get('eventType'))).to.eql([ 'beforeAll', 'start', 'end' ]);
      })
    );


    it('should redo',
      inject(function(elementRegistry, modeling, commandStack) {

        // given
        const el = elementRegistry.get('MultiInstanceTask');

        // when
        modeling.updateProperties(el, { loopCharacteristics: undefined });
        commandStack.undo();
        commandStack.redo();

        // then
        const listeners = getListeners(el);
        expect(listeners).to.have.lengthOf(2);
        expect(listeners.map(l => l.get('eventType'))).to.eql([ 'start', 'end' ]);
      })
    );


    it('should NOT remove `beforeAll` when new loopCharacteristics is also multi-instance',
      inject(function(elementRegistry, modeling, bpmnFactory) {

        // given
        const el = elementRegistry.get('MultiInstanceTask');
        const loopCharacteristics = bpmnFactory.create('bpmn:MultiInstanceLoopCharacteristics', { isSequential: true });

        // when
        modeling.updateProperties(el, { loopCharacteristics });

        // then
        const listeners = getListeners(el);
        expect(listeners).to.have.lengthOf(3);
      })
    );


    it('should NOT remove `beforeAll` when updating loopCharacteristics properties',
      inject(function(elementRegistry, modeling) {

        // given
        const el = elementRegistry.get('MultiInstanceTask');
        const bo = getBusinessObject(el);

        // when
        modeling.updateModdleProperties(el, bo.get('loopCharacteristics'), { isSequential: true });

        // then
        const listeners = getListeners(el);
        expect(listeners).to.have.lengthOf(3);
        expect(listeners.map(l => l.get('eventType'))).to.eql([ 'beforeAll', 'start', 'end' ]);
      })
    );
  });


  it('should keep `beforeAll` when MI task is replaced with another MI-capable type',
    inject(function(bpmnReplace, elementRegistry) {

      // given
      const el = elementRegistry.get('MultiInstanceTask');

      // when
      bpmnReplace.replaceElement(el, { type: 'bpmn:UserTask' });

      // then
      const replaced = elementRegistry.get('MultiInstanceTask');
      const listeners = getListeners(replaced);
      expect(listeners).to.have.lengthOf(3);
      expect(listeners.map(l => l.get('eventType'))).to.eql([ 'beforeAll', 'start', 'end' ]);
    })
  );
});

function getListeners(element) {
  const container = getExecutionListenersContainer(element);
  return (container && container.get('listeners')) || [];
}

function getExecutionListenersContainer(element) {
  return getExtensionElementsList(getBusinessObject(element), 'zeebe:ExecutionListeners')[0];
}
