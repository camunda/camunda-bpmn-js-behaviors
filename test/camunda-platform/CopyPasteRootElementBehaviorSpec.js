import {
  bootstrapCamundaPlatformModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  find,
  matchPattern
} from 'min-dash';

import {
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import diagramXML from './camunda-root-element-reference.bpmn';


describe('CopyPasteRootElementBehavior', function() {

  beforeEach(bootstrapCamundaPlatformModeler(diagramXML));


  describe('copy/paste external service task', function() {

    describe('without any camunda:ErrorEventDefinition', function() {

      let pastedBusinessObject;


      beforeEach(inject(function(canvas, copyPaste, elementRegistry) {

        // given
        const copiedServiceTask = elementRegistry.get('ServiceTask_1'),
              copiedBusinessObject = getBusinessObject(copiedServiceTask);

        // assume
        expect(getErrorEventDefinitions(copiedBusinessObject)).to.be.empty;

        // when
        copyPaste.copy(copiedServiceTask);

        const pastedServiceTask = copyPaste.paste({
          element: canvas.getRootElement(),
          point: {
            x: copiedServiceTask.x,
            y: copiedServiceTask.y
          },
        })[ 0 ];

        pastedBusinessObject = getBusinessObject(pastedServiceTask);

      }));


      it('should not create a camunda:ErrorEventDefinition on paste', function() {

        // then
        expect(getErrorEventDefinitions(pastedBusinessObject)).to.be.empty;
      });

    });


    describe('with one camunda:ErrorEventDefinition', function() {

      let copiedBusinessObject,
          copiedServiceTask,
          pastedBusinessObject,
          pastedRootElement,
          pastedServiceTask,
          referencedRootElement;


      describe('without altering the copied service task', function() {

        beforeEach(inject(function(canvas, copyPaste, elementRegistry) {

          // given
          copiedServiceTask = elementRegistry.get('ServiceTask_2');

          // when
          copyPaste.copy(copiedServiceTask);

          pastedServiceTask = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: copiedServiceTask.x,
              y: copiedServiceTask.y
            },
          })[ 0 ];

          pastedBusinessObject = getBusinessObject(pastedServiceTask);
        }));


        it('should copy the errorRef on paste', function() {

          // then
          expect(getErrorEventDefinitions(pastedBusinessObject)[ 0 ].get('errorRef')).to.exist;
        });


        it('should not add temporary attributes to shape on paste', function() {

          // then
          expect(pastedServiceTask.referencedRootElements).not.to.exist;
        });

      });


      describe('removing the copied service task', function() {

        beforeEach(inject(function(canvas, copyPaste, elementRegistry, modeling) {

          // given
          copiedServiceTask = elementRegistry.get('ServiceTask_2');

          // when
          copyPaste.copy(copiedServiceTask);

          modeling.removeShape(copiedServiceTask);

          pastedServiceTask = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: copiedServiceTask.x,
              y: copiedServiceTask.y
            },
          })[ 0 ];

          pastedBusinessObject = getBusinessObject(pastedServiceTask);
        }));


        it('should copy the errorRef on paste', function() {

          // then
          expect(getErrorEventDefinitions(pastedBusinessObject)[ 0 ].get('errorRef')).to.exist;
        });

      });


      describe('without altering the root bpmn:Error', function() {

        beforeEach(inject(function(bpmnjs, canvas, copyPaste, elementRegistry) {

          // given
          copiedServiceTask = elementRegistry.get('ServiceTask_2');

          copiedBusinessObject = getBusinessObject(copiedServiceTask);

          referencedRootElement = getErrorEventDefinitions(copiedBusinessObject)[ 0 ].get('errorRef');

          // remove all root errors except the referenced one
          const rootElements = getRootElementsOfType('bpmn:Error');

          rootElements.forEach(function(element) {
            if (element.get('id') !== referencedRootElement.get('id')) {
              collectionRemove(bpmnjs.getDefinitions().get('rootElements'), element);
            }
          });

          // assume
          expect(hasRootElement(referencedRootElement)).to.be.true;
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(1);

          // when
          copyPaste.copy(copiedServiceTask);

          pastedServiceTask = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: copiedServiceTask.x,
              y: copiedServiceTask.y
            },
          })[ 0 ];
        }));


        it('should not create an additional root bpmn:Error', function() {

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(1);
        });

      });


      describe('removing the root bpmn:Error', function() {

        beforeEach(inject(function(bpmnjs, canvas, copyPaste, elementRegistry) {

          // given
          copiedServiceTask = elementRegistry.get('ServiceTask_2');

          copiedBusinessObject = getBusinessObject(copiedServiceTask);

          referencedRootElement = getErrorEventDefinitions(copiedBusinessObject)[ 0 ].get('errorRef');

          // when
          copyPaste.copy(copiedServiceTask);

          // remove all root errors
          var rootElements = getRootElementsOfType('bpmn:Error');

          rootElements.forEach((element) => {
            collectionRemove(bpmnjs.getDefinitions().get('rootElements'), element);
          });

          // assume
          expect(hasRootElement(referencedRootElement)).to.be.false;
          expect(getRootElementsOfType('bpmn:Error')).to.be.empty;

          pastedServiceTask = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: copiedServiceTask.x,
              y: copiedServiceTask.y
            },
          })[0];

          pastedBusinessObject = getBusinessObject(pastedServiceTask);

          pastedRootElement = getErrorEventDefinitions(pastedBusinessObject)[0].errorRef;
        }));


        it('should do', function() {

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(1);
          expect(hasRootElement(referencedRootElement)).to.be.false;
          expect(hasRootElement(pastedRootElement)).to.be.true;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.be.empty;
          expect(hasRootElement(referencedRootElement)).to.be.false;
          expect(hasRootElement(pastedRootElement)).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // given
          commandStack.undo();

          // when
          commandStack.redo();

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(1);
          expect(hasRootElement(referencedRootElement)).to.be.false;
          expect(hasRootElement(pastedRootElement)).to.be.true;
        }));

      });
    });


    describe('with multiple camunda:ErrorEventDefinition', function() {

      let copiedBusinessObject,
          copiedServiceTask,
          pastedBusinessObject,
          pastedRootElements,
          pastedServiceTask,
          referencedRootElements;


      describe('with one missing bpmn:Error reference', function() {

        it('should not create any additional bpmn:Error', inject(
          function(canvas, copyPaste, elementRegistry) {

            // given
            copiedServiceTask = elementRegistry.get('ServiceTask_4');

            copiedBusinessObject = getBusinessObject(copiedServiceTask);

            // assume
            expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);

            // when
            copyPaste.copy(copiedServiceTask);

            pastedServiceTask = copyPaste.paste({
              element: canvas.getRootElement(),
              point: {
                x: copiedServiceTask.x,
                y: copiedServiceTask.y
              },
            })[0];

            pastedBusinessObject = getBusinessObject(pastedServiceTask);

            var extensionElements = getErrorEventDefinitions(pastedBusinessObject);

            pastedRootElements = extensionElements
              .reduce((rootElements, extensionElement) => {

                if (extensionElement.get('errorRef')) {
                  rootElements.push(extensionElement.get('errorRef'));
                }

                return rootElements;
              }, []);

            // then
            expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);

            pastedRootElements.forEach((referencedRootElement) => {
              expect(hasRootElement(referencedRootElement)).to.be.true;
            });
          })
        );

      });


      describe('without altering any root bpmn:Error', function() {

        beforeEach(inject(function(canvas, copyPaste, elementRegistry) {

          // given
          copiedServiceTask = elementRegistry.get('ServiceTask_3');

          copiedBusinessObject = getBusinessObject(copiedServiceTask);

          // assume
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);

          // when
          copyPaste.copy(copiedServiceTask);

          pastedServiceTask = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: copiedServiceTask.x,
              y: copiedServiceTask.y
            },
          })[0];

          pastedBusinessObject = getBusinessObject(pastedServiceTask);

          var extensionElements = getErrorEventDefinitions(pastedBusinessObject);

          pastedRootElements = extensionElements.map((extensionElement) => {
            return extensionElement.get('errorRef');
          });
        }));


        it('should not create any additional bpmn:Error', function() {

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);

          pastedRootElements.forEach((referencedRootElement) => {
            expect(hasRootElement(referencedRootElement)).to.be.true;
          });
        });

      });


      describe('removing one root bpmn:Error', function() {

        beforeEach(inject(function(bpmnjs, canvas, copyPaste, elementRegistry) {

          // given
          copiedServiceTask = elementRegistry.get('ServiceTask_3');

          copiedBusinessObject = getBusinessObject(copiedServiceTask);

          let extensionElements = getErrorEventDefinitions(copiedBusinessObject);

          referencedRootElements = extensionElements.map((extensionElement) => {
            return extensionElement.get('errorRef');
          });

          // remove one referenced root error
          collectionRemove(bpmnjs.getDefinitions().get('rootElements'), referencedRootElements[ 1 ]);


          // assume
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(2);

          // when
          copyPaste.copy(copiedServiceTask);

          pastedServiceTask = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: copiedServiceTask.x,
              y: copiedServiceTask.y
            },
          })[ 0 ];

          pastedBusinessObject = getBusinessObject(pastedServiceTask);

          extensionElements = getErrorEventDefinitions(pastedBusinessObject);

          pastedRootElements = extensionElements.map((extensionElement) => {
            return extensionElement.get('errorRef');
          });
        }));


        it('should recreate the missing root bpmn:Error', function() {

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);
          expect(hasRootElement(pastedRootElements[ 1 ])).to.be.true;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(2);
          expect(hasRootElement(pastedRootElements[ 1 ])).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // given
          commandStack.undo();

          // when
          commandStack.redo();

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);
          expect(hasRootElement(pastedRootElements[ 1 ])).to.be.true;
        }));

      });


      describe('removing every root bpmn:Error', function() {

        beforeEach(inject(function(bpmnjs, canvas, copyPaste, elementRegistry) {

          // given
          copiedServiceTask = elementRegistry.get('ServiceTask_3');

          copiedBusinessObject = getBusinessObject(copiedServiceTask);

          let extensionElements = getErrorEventDefinitions(copiedBusinessObject);

          referencedRootElements = extensionElements.map((extensionElement) => {
            return extensionElement.get('errorRef');
          });

          // remove all root errors
          const rootElements = getRootElementsOfType('bpmn:Error');

          rootElements.forEach(function(element) {
            collectionRemove(bpmnjs.getDefinitions().get('rootElements'), element);
          });

          // assume
          expect(getRootElementsOfType('bpmn:Error')).to.be.empty;

          // when
          copyPaste.copy(copiedServiceTask);

          pastedServiceTask = copyPaste.paste({
            element: canvas.getRootElement(),
            point: {
              x: copiedServiceTask.x,
              y: copiedServiceTask.y
            },
          })[0];

          pastedBusinessObject = getBusinessObject(pastedServiceTask);

          extensionElements = getErrorEventDefinitions(pastedBusinessObject);

          pastedRootElements = extensionElements.map((extensionElement) => {
            return extensionElement.get('errorRef');
          });
        }));


        it('should recreate every missing root bpmn:Error', function() {

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.be.empty;
        }));


        it('should redo', inject(function(commandStack) {

          // given
          commandStack.undo();

          // when
          commandStack.redo();

          // then
          expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);
        }));

      });


      describe('with complex extension elements', function() {


        it('should set root elements to correct position', inject(
          function(canvas, copyPaste, elementRegistry) {

            // given
            copiedServiceTask = elementRegistry.get('ServiceTask_5');

            copiedBusinessObject = getBusinessObject(copiedServiceTask);

            // assume
            expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);

            // when
            copyPaste.copy(copiedServiceTask);

            pastedServiceTask = copyPaste.paste({
              element: canvas.getRootElement(),
              point: {
                x: copiedServiceTask.x,
                y: copiedServiceTask.y
              },
            })[0];

            pastedBusinessObject = getBusinessObject(pastedServiceTask);

            const extensionElements = getErrorEventDefinitions(pastedBusinessObject),
                  rootElements = getRootElementsOfType('bpmn:Error');

            // then
            expect(extensionElements.length).to.equal(3);

            expect(extensionElements[ 0 ].errorRef).to.equal(rootElements[ 0 ]);
            expect(extensionElements[ 1 ].errorRef).to.not.exist;
            expect(extensionElements[ 2 ].errorRef).to.equal(rootElements[ 1 ]);
          }
        ));


        it('should not create any additional bpmn:Error', inject(
          function(canvas, copyPaste, elementRegistry) {

            // given
            copiedServiceTask = elementRegistry.get('ServiceTask_5');

            copiedBusinessObject = getBusinessObject(copiedServiceTask);

            // assume
            expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);

            // when
            copyPaste.copy(copiedServiceTask);

            pastedServiceTask = copyPaste.paste({
              element: canvas.getRootElement(),
              point: {
                x: copiedServiceTask.x,
                y: copiedServiceTask.y
              },
            })[0];

            pastedBusinessObject = getBusinessObject(pastedServiceTask);

            const extensionElements = getErrorEventDefinitions(pastedBusinessObject);

            pastedRootElements = extensionElements
              .reduce((rootElements, extensionElement) => {

                if (extensionElement.get('errorRef')) {
                  rootElements.push(extensionElement.get('errorRef'));
                }

                return rootElements;
              }, []);

            // then
            expect(getRootElementsOfType('bpmn:Error')).to.have.length(3);

            pastedRootElements.forEach((referencedRootElement) => {
              expect(hasRootElement(referencedRootElement)).to.be.true;
            });
          })
        );

      });

    });

  });

});


// helpers //////////

function getErrorEventDefinitions(businessObject) {
  return getExtensionElementsOfType(businessObject, 'camunda:ErrorEventDefinition');
}

function getExtensionElementsOfType(businessObject, type) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return [];
  }

  return extensionElements.get('values').filter((element) => {
    return is(element, type);
  });
}

function getRootElementsOfType(type) {
  return getBpmnJS()
    .getDefinitions()
    .get('rootElements')
    .filter((element) => is(element, type));
}

function hasRootElement(rootElement) {
  const rootElements = getBpmnJS().getDefinitions().get('rootElements');

  return !!rootElement && !!find(rootElements, matchPattern({ id: rootElement.get('id') }));
}
