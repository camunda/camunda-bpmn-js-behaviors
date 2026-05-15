import { expect } from 'chai';

import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import {
  getFormDefinition,
} from 'lib/camunda-cloud/util/FormsUtil';

import diagramXML from './process-start-event-forms.bpmn';


describe('camunda-cloud/features/modeling - FormsBehavior - start events', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  describe('remove start event', function() {

    describe('with linked form', function() {

      it('should remove form definition', inject(
        function(elementRegistry, modeling) {

          // given
          const element = elementRegistry.get('StartEvent_Linked');

          // when
          modeling.removeElements([ element ]);

          // then
          expect(elementRegistry.get('StartEvent_Linked')).not.to.exist;
        }
      ));


      it('should undo', inject(
        function(commandStack, elementRegistry, modeling) {

          // given
          const element = elementRegistry.get('StartEvent_Linked');

          modeling.removeElements([ element ]);

          // when
          commandStack.undo();

          // then
          const restoredElement = elementRegistry.get('StartEvent_Linked');
          const formDefinition = getFormDefinition(restoredElement);

          expect(formDefinition).to.exist;
          expect(formDefinition.get('formId')).to.equal('myFormId');
        }
      ));

    });

    describe('with embedded form', function() {

      it('should remove user task form from root', inject(
        function(canvas, elementRegistry, modeling) {

          // given
          const rootElement = canvas.getRootElement();
          const element = elementRegistry.get('StartEvent_Embedded');

          // when
          modeling.removeElements([ element ]);

          // then
          const userTaskForms = getExtensionElementsList(
            getBusinessObject(rootElement), 'zeebe:UserTaskForm'
          );

          expect(userTaskForms).to.have.lengthOf(0);
        }
      ));


      it('should undo', inject(
        function(canvas, commandStack, elementRegistry, modeling) {

          // given
          const rootElement = canvas.getRootElement();
          const element = elementRegistry.get('StartEvent_Embedded');

          modeling.removeElements([ element ]);

          // when
          commandStack.undo();

          // then
          const userTaskForms = getExtensionElementsList(
            getBusinessObject(rootElement), 'zeebe:UserTaskForm'
          );

          expect(userTaskForms).to.have.lengthOf(1);
        }
      ));

    });

  });


  describe('replace start event', function() {

    describe('with linked form', function() {

      it('should remove form definition when replaced with message start event', inject(
        function(bpmnReplace, elementRegistry) {

          // given
          const element = elementRegistry.get('StartEvent_Linked');

          // when
          const newElement = bpmnReplace.replaceElement(element, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:MessageEventDefinition'
          });

          // then
          const formDefinition = getFormDefinition(newElement);

          expect(formDefinition).to.not.exist;
        }
      ));


      it('should undo', inject(
        function(bpmnReplace, commandStack, elementRegistry) {

          // given
          const element = elementRegistry.get('StartEvent_Linked');

          bpmnReplace.replaceElement(element, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:MessageEventDefinition'
          });

          // when
          commandStack.undo();

          // then
          const restoredElement = elementRegistry.get('StartEvent_Linked');
          const formDefinition = getFormDefinition(restoredElement);

          expect(formDefinition).to.exist;
          expect(formDefinition.get('formId')).to.equal('myFormId');
        }
      ));

    });


    describe('with embedded form', function() {

      it('should remove form definition and user task form when replaced with timer start event', inject(
        function(bpmnReplace, canvas, elementRegistry) {

          // given
          const rootElement = canvas.getRootElement();
          const element = elementRegistry.get('StartEvent_Embedded');

          // when
          const newElement = bpmnReplace.replaceElement(element, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition'
          });

          // then
          const formDefinition = getFormDefinition(newElement);

          expect(formDefinition).to.not.exist;

          const userTaskForms = getExtensionElementsList(
            getBusinessObject(rootElement), 'zeebe:UserTaskForm'
          );

          expect(userTaskForms).to.have.lengthOf(0);
        }
      ));


      it('should undo', inject(
        function(bpmnReplace, canvas, commandStack, elementRegistry) {

          // given
          const rootElement = canvas.getRootElement();
          const element = elementRegistry.get('StartEvent_Embedded');

          bpmnReplace.replaceElement(element, {
            type: 'bpmn:StartEvent',
            eventDefinitionType: 'bpmn:TimerEventDefinition'
          });

          // when
          commandStack.undo();

          // then
          const restoredElement = elementRegistry.get('StartEvent_Embedded');
          const formDefinition = getFormDefinition(restoredElement);

          expect(formDefinition).to.exist;

          const userTaskForms = getExtensionElementsList(
            getBusinessObject(rootElement), 'zeebe:UserTaskForm'
          );

          expect(userTaskForms).to.have.lengthOf(1);
        }
      ));

    });

  });


  describe('move start event to subprocess', function() {

    describe('with linked form', function() {

      it('should remove form definition', inject(
        function(elementRegistry, modeling) {

          // given
          const element = elementRegistry.get('StartEvent_Linked');
          const subProcess = elementRegistry.get('SubProcess_1');

          // when
          modeling.moveElements([ element ], { x: 0, y: 0 }, subProcess);

          // then
          const formDefinition = getFormDefinition(element);

          expect(formDefinition).not.to.exist;
        }
      ));


      it('should undo', inject(
        function(commandStack, elementRegistry, modeling) {

          // given
          const element = elementRegistry.get('StartEvent_Linked');
          const subProcess = elementRegistry.get('SubProcess_1');

          modeling.moveElements([ element ], { x: 0, y: 0 }, subProcess);

          // when
          commandStack.undo();

          // then
          const formDefinition = getFormDefinition(element);

          expect(formDefinition).to.exist;
          expect(formDefinition.get('formId')).to.equal('myFormId');
        }
      ));

    });


    describe('with embedded form', function() {

      it('should remove form definition and user task form', inject(
        function(canvas, elementRegistry, modeling) {

          // given
          const rootElement = canvas.getRootElement();
          const element = elementRegistry.get('StartEvent_Embedded');
          const subProcess = elementRegistry.get('SubProcess_1');

          // when
          modeling.moveElements([ element ], { x: 0, y: 0 }, subProcess);

          // then
          const formDefinition = getFormDefinition(element);

          expect(formDefinition).not.to.exist;

          const userTaskForms = getExtensionElementsList(
            getBusinessObject(rootElement), 'zeebe:UserTaskForm'
          );

          expect(userTaskForms).to.have.lengthOf(0);
        }
      ));


      it('should undo', inject(
        function(canvas, commandStack, elementRegistry, modeling) {

          // given
          const rootElement = canvas.getRootElement();
          const element = elementRegistry.get('StartEvent_Embedded');
          const subProcess = elementRegistry.get('SubProcess_1');

          modeling.moveElements([ element ], { x: 0, y: 0 }, subProcess);

          // when
          commandStack.undo();

          // then
          const formDefinition = getFormDefinition(element);

          expect(formDefinition).to.exist;

          const userTaskForms = getExtensionElementsList(
            getBusinessObject(rootElement), 'zeebe:UserTaskForm'
          );

          expect(userTaskForms).to.have.lengthOf(1);
        }
      ));

    });

  });

});
