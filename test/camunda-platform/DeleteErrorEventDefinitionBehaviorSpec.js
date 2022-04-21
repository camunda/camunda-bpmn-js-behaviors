import {
  bootstrapCamundaPlatformModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './camunda-error-event-definition-diagram.bpmn';


describe('camunda-platform/features/modeling - DeleteErrorEventDefinitionBehavior', function() {

  beforeEach(bootstrapCamundaPlatformModeler(diagramXML));

  function updateProperties(element, properties) {
    getBpmnJS().invoke(function(modeling) {
      modeling.updateProperties(element, properties);
    });
  }

  function updateModdleProperties(element, properties) {
    getBpmnJS().invoke(function(modeling) {
      modeling.updateModdleProperties(element, getBusinessObject(element), properties);
    });
  }

  [
    [ 'element.updateProperties', updateProperties ],
    [ 'element.updateModdleProperties', updateModdleProperties ],
  ].forEach(([ command, fn ]) => {

    describe(command, function() {

      describe('camunda:type to non-external (type)', function() {

        let businessObject,
            element;

        beforeEach(inject(function(elementRegistry) {

          // given
          element = elementRegistry.get('ServiceTask_1');

          businessObject = getBusinessObject(element);

          // assume
          expect(getErrorEventDefinitions(businessObject)).to.have.length(3);

          // when
          fn(element, {
            type: 'foo'
          });
        }));


        it('should execute', inject(function() {

          // then
          expect(getErrorEventDefinitions(businessObject)).to.be.empty;
        }));


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getErrorEventDefinitions(businessObject)).to.have.length(3);
        }));


        it('should undo/redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getErrorEventDefinitions(businessObject)).to.be.empty;
        }));

      });


      describe('camunda:type to non-external (camunda:type)', function() {

        let businessObject,
            element;

        beforeEach(inject(function(elementRegistry) {

          // given
          element = elementRegistry.get('ServiceTask_1');

          businessObject = getBusinessObject(element);

          // assume
          expect(getErrorEventDefinitions(businessObject)).to.have.length(3);

          // when
          fn(element, {
            'camunda:type': 'foo'
          });
        }));


        it('should execute', inject(function() {

          // then
          expect(getErrorEventDefinitions(businessObject)).to.be.empty;
        }));


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getErrorEventDefinitions(businessObject)).to.have.length(3);
        }));


        it('should undo/redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getErrorEventDefinitions(businessObject)).to.be.empty;
        }));

      });

    });

  });

});


// helpers //////////

function getErrorEventDefinitions(businessObject) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return;
  }

  return extensionElements.get('values').filter((element) => {
    return is(element, 'camunda:ErrorEventDefinition');
  });
}