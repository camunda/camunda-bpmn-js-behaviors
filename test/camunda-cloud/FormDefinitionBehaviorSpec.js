import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  getFormDefinition,
  getUserTaskForm
} from 'lib/camunda-cloud/util/FormsUtil';

import diagramXML from './process-user-tasks.bpmn';


describe('camunda-cloud/features/modeling - FormsBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  describe('cleanup user task forms', function() {

    describe('on remove user task', function() {

      it('should execute', inject(function(canvas, elementRegistry, modeling) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        // when
        modeling.removeElements([ element ]);

        // then
        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.false;
      }));


      it('should undo', inject(function(canvas, commandStack, elementRegistry, modeling) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        // when
        modeling.removeElements([ element ]);

        commandStack.undo();

        // then
        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.true;
      }));


      it('should redo', inject(function(canvas, commandStack, elementRegistry, modeling) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        // when
        modeling.removeElements([ element ]);

        commandStack.undo();
        commandStack.redo();

        // then
        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.false;
      }));

    });


    describe('on replace user task', function() {

      it('should execute', inject(function(bpmnReplace, canvas, elementRegistry) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        // when
        bpmnReplace.replaceElement(element, {
          type: 'bpmn:ServiceTask'
        });

        // then
        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.false;
      }));


      it('should undo', inject(function(bpmnReplace, canvas, commandStack, elementRegistry) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        // when
        bpmnReplace.replaceElement(element, {
          type: 'bpmn:ServiceTask'
        });

        commandStack.undo();

        // then
        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.true;
      }));


      it('should redo', inject(function(bpmnReplace, canvas, commandStack, elementRegistry) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        // when
        bpmnReplace.replaceElement(element, {
          type: 'bpmn:ServiceTask'
        });

        commandStack.undo();
        commandStack.redo();

        // then
        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.false;
      }));

    });

  });


  describe('create new user task form', function() {

    describe('on copy user task', function() {

      it('should execute', inject(function(canvas, copyPaste, elementRegistry) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        const oldUserTaskForm = getUserTaskForm(element);

        const oldFormDefinition = getFormDefinition(element);

        // when
        copyPaste.copy([ element ]);

        const newElements = copyPaste.paste({
          element: rootElement,
          point: {
            x: 1000,
            y: 1000
          }
        });

        const newElement = newElements[0];

        const formDefinition = getFormDefinition(newElement);

        const userTaskForm = getUserTaskForm(newElement);

        // then
        expect(formDefinition).not.to.eql(oldFormDefinition);

        expect(userTaskForm).not.to.eql(oldUserTaskForm);
      }));


      it('should undo', inject(function(canvas, commandStack, copyPaste, elementRegistry) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        copyPaste.copy([ element ]);

        copyPaste.paste({
          element: rootElement,
          point: {
            x: 1000,
            y: 1000
          }
        });

        // when
        commandStack.undo();

        const userTaskForms = getUserTaskForms(rootElement);

        // then
        expect(userTaskForms).to.have.length(2);
      }));


      it('should redo', inject(function(canvas, commandStack, copyPaste, elementRegistry) {

        // given
        const rootElement = canvas.getRootElement();

        const element = elementRegistry.get('UserTask_1');

        copyPaste.copy([ element ]);

        copyPaste.paste({
          element: rootElement,
          point: {
            x: 1000,
            y: 1000
          }
        });

        // when
        commandStack.undo();
        commandStack.redo();

        const userTaskForms = getUserTaskForms(rootElement);

        // then
        expect(userTaskForms).to.have.length(3);
      }));

    });

  });

});


// helpers //////////

function getUserTaskForms(rootElement) {
  const businessObject = getBusinessObject(rootElement);

  return getExtensionElementsList(businessObject, 'zeebe:UserTaskForm');
}

function hasUsertaskForm(id, userTaskForms) {
  return !!userTaskForms.find((userTaskForm) => {
    return userTaskForm.get('zeebe:id') === id;
  });
}
