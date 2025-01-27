import { without } from 'min-dash';

import {
  bootstrapCamundaCloudModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

import {
  getFormDefinition,
  getUserTaskForm,
  userTaskFormIdToFormKey
} from 'lib/camunda-cloud/util/FormsUtil';

import diagramXML from './process-user-tasks.bpmn';


describe('camunda-cloud/features/modeling - FormsBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  describe('remove user task form', function() {

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


    it('should remove extension elements', inject(function(canvas, elementRegistry, modeling) {

      // given
      const rootElement = canvas.getRootElement();

      const userTask1 = elementRegistry.get('UserTask_1');

      modeling.updateModdleProperties(rootElement, getBusinessObject(rootElement).get('extensionElements'), {
        values: [
          getUserTaskForm(userTask1)
        ]
      });

      // when
      modeling.removeElements([ userTask1 ]);

      // then
      const extensionElements = getBusinessObject(rootElement).get('extensionElements');

      expect(extensionElements).not.to.exist;
    }));

  });


  describe('create and reference new user task form', function() {

    describe('no existing form definition or user task form', function() {

      it('should not create and reference new user task form', inject(function(canvas, elementFactory) {

        // given
        const element = elementFactory.createShape({
          type: 'bpmn:UserTask'
        });

        // when
        createShape(element);

        // then
        expect(getUserTaskForm(element)).not.to.exist;
        expect(getUserTaskForms(canvas.getRootElement())).to.have.length(3);
      }));

    });


    describe('existing form definition, no user task form', function() {

      it('should not create and reference new form definition', inject(function(bpmnFactory, canvas, elementFactory) {

        // given
        const formDefinition = bpmnFactory.create('zeebe:FormDefinition', {
          formId: 'foo'
        });

        const extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
          values: [ formDefinition ]
        });

        formDefinition.$parent = extensionElements;

        const businessObject = bpmnFactory.create('bpmn:UserTask', {
          extensionElements
        });

        extensionElements.$parent = businessObject;

        const element = elementFactory.createShape({
          type: 'bpmn:UserTask',
          businessObject
        });

        // when
        createShape(element);

        // then
        expect(getUserTaskForm(element)).not.to.exist;
        expect(getUserTaskForms(canvas.getRootElement())).to.have.length(3);
      }));

    });


    describe('existing form definition, user task form not referenced', function() {

      it('should not create and reference new form definition', inject(function(bpmnFactory, canvas, elementFactory) {

        // given
        const formDefinition = bpmnFactory.create('zeebe:FormDefinition', {
          formKey: userTaskFormIdToFormKey('UserTaskForm_3')
        });

        const extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
          values: [ formDefinition ]
        });

        formDefinition.$parent = extensionElements;

        const businessObject = bpmnFactory.create('bpmn:UserTask', {
          extensionElements
        });

        extensionElements.$parent = businessObject;

        const element = elementFactory.createShape({
          type: 'bpmn:UserTask',
          businessObject
        });

        // when
        createShape(element);

        // then
        expect(getUserTaskForm(element)).to.exist;
        expect(getUserTaskForms(canvas.getRootElement())).to.have.length(3);
      }));

    });


    describe('existing form definition, user task form referenced', function() {

      let element;

      beforeEach(inject(function(bpmnFactory, elementFactory) {

        // given
        const formDefinition = bpmnFactory.create('zeebe:FormDefinition', {
          formKey: userTaskFormIdToFormKey('UserTaskForm_1')
        });

        const extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
          values: [ formDefinition ]
        });

        formDefinition.$parent = extensionElements;

        const businessObject = bpmnFactory.create('bpmn:UserTask', {
          extensionElements
        });

        extensionElements.$parent = businessObject;

        element = elementFactory.createShape({
          type: 'bpmn:UserTask',
          businessObject
        });

        // when
        createShape(element);
      }));


      it('should create and reference new user task form (execute)', inject(function(canvas) {

        // then
        expect(getUserTaskForm(element)).to.exist;
        expect(getUserTaskForm(element).get('id')).to.not.equal('UserTaskForm_1');
        expect(getUserTaskForms(canvas.getRootElement())).to.have.length(4);
      }));


      it('should create and reference new user task form (undo)', inject(function(canvas, commandStack) {

        // when
        commandStack.undo();

        // then
        expect(getUserTaskForms(canvas.getRootElement())).to.have.length(3);
      }));


      it('should create and reference new user task form (redo)', inject(function(canvas, commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(getUserTaskForm(element)).to.exist;
        expect(getUserTaskForm(element).get('id')).to.not.equal('UserTaskForm_1');
        expect(getUserTaskForms(canvas.getRootElement())).to.have.length(4);
      }));

    });

  });


  describe('update form definition', function() {

    describe('set form ID', function() {

      it('should remove custom form key', inject(function(elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_11');

        const formDefinition = getFormDefinition(userTask);

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          formId: 'foobar'
        });

        // then
        expect(formDefinition.get('formKey')).not.to.exist;
      }));


      it('should remove user task form', inject(function(canvas, elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const formDefinition = getFormDefinition(userTask);

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          formId: 'foobar'
        });

        // then
        expect(formDefinition.get('formKey')).not.to.exist;

        const rootElement = canvas.getRootElement();

        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.false;
      }));


      it('should remove extension elements', inject(function(canvas, elementRegistry, modeling) {

        // given
        const rootElement = canvas.getRootElement();

        const userTask1 = elementRegistry.get('UserTask_1');

        modeling.updateModdleProperties(rootElement, getBusinessObject(rootElement).get('extensionElements'), {
          values: [
            getUserTaskForm(userTask1)
          ]
        });

        const formDefinition = getFormDefinition(userTask1);

        // when
        modeling.updateModdleProperties(userTask1, formDefinition, {
          formId: 'foobar'
        });

        // then
        expect(formDefinition.get('formKey')).not.to.exist;

        const extensionElements = getBusinessObject(rootElement).get('extensionElements');

        expect(extensionElements).not.to.exist;
      }));


      it('should not remove binding type', inject(function(elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_12');

        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.get('bindingType')).to.equal('deployment');

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          formId: 'foobar'
        });

        // then
        expect(formDefinition.get('bindingType')).to.equal('deployment');
      }));

    });


    describe('set form key', function() {

      it('should remove form ID', inject(function(elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_12');

        const formDefinition = getFormDefinition(userTask);

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          formKey: 'foobar'
        });

        // then
        expect(formDefinition.get('formId')).not.to.exist;
      }));


      it('should remove user task form', inject(function(canvas, elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const formDefinition = getFormDefinition(userTask);

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          formKey: 'foobar'
        });

        // then
        const rootElement = canvas.getRootElement();

        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.false;
      }));


      it('should remove extension elements', inject(function(canvas, elementRegistry, modeling) {

        // given
        const rootElement = canvas.getRootElement();

        const userTask1 = elementRegistry.get('UserTask_1');

        modeling.updateModdleProperties(rootElement, getBusinessObject(rootElement).get('extensionElements'), {
          values: [
            getUserTaskForm(userTask1)
          ]
        });

        const formDefinition = getFormDefinition(userTask1);

        // when
        modeling.updateModdleProperties(userTask1, formDefinition, {
          formKey: 'foobar'
        });

        // then
        const extensionElements = getBusinessObject(rootElement).get('extensionElements');

        expect(extensionElements).not.to.exist;
      }));


      it('should remove binding type', inject(function(elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_12');

        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.get('bindingType')).to.equal('deployment');

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          formKey: 'foobar'
        });

        // then
        expect(formDefinition.get('bindingType')).to.equal('latest'); // default value
      }));

    });


    describe('set external reference', function() {

      it('should remove form ID', inject(function(elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('withFormId');

        const formDefinition = getFormDefinition(userTask);

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          externalReference: 'foobar'
        });

        // then
        expect(formDefinition.get('formId')).not.to.exist;
      }));


      it('should remove binding type', inject(function(elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_12');

        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.get('bindingType')).to.equal('deployment');

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          externalReference: 'foobar'
        });

        // then
        expect(formDefinition.get('bindingType')).to.equal('latest'); // default value
      }));

    });


    describe('set binding type', function() {

      it('should set form ID', inject(function(elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.get('bindingType')).to.equal('latest'); // default value
        expect(formDefinition.get('formId')).not.to.exist;

        // when
        modeling.updateModdleProperties(userTask, formDefinition, {
          bindingType: 'deployment'
        });

        // then
        expect(formDefinition.get('bindingType')).to.equal('deployment');
        expect(formDefinition.get('formId')).to.equal('');
      }));

    });


    describe('remove form definition', function() {

      it('should remove user task form', inject(function(canvas, elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_1'),
              extensionElements = getBusinessObject(userTask).get('extensionElements');

        const formDefinition = getFormDefinition(userTask);

        // when
        modeling.updateModdleProperties(userTask, extensionElements, {
          values: without(extensionElements.get('values'), formDefinition)
        });

        // then
        const rootElement = canvas.getRootElement();

        const userTaskForms = getUserTaskForms(rootElement);

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.false;
      }));


      it('should remove extension elements', inject(function(elementRegistry, modeling) {

        // given
        const userTask = elementRegistry.get('UserTask_1'),
              extensionElements = getBusinessObject(userTask).get('extensionElements');

        const formDefinition = getFormDefinition(userTask);

        // when
        modeling.updateModdleProperties(userTask, extensionElements, {
          values: without(extensionElements.get('values'), formDefinition)
        });

        // then
        expect(getBusinessObject(userTask).get('extensionElements')).not.to.exist;
      }));

    });


    describe('change to Zeebe User Task', function() {

      it('should remove embedded form', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        // when
        addZeebeUserTask(userTask);

        // then
        const userTaskForms = getUserTaskForms();

        expect(hasUsertaskForm('UserTaskForm_1', userTaskForms)).to.be.false;

        const formDefinition = getFormDefinition(userTask);
        expect(formDefinition.formKey).not.to.exist;
      }));


      it('should keep custom form reference as externalReference', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('UserTask_11');
        const originalFormKey = getFormDefinition(userTask).get('formKey');

        // when
        addZeebeUserTask(userTask);

        // then
        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.formKey).not.to.exist;
        expect(formDefinition.externalReference).to.eql(originalFormKey);
        expect(formDefinition.formId).not.to.exist;
      }));


      it('should keep empty custom form reference as externalReference', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('UserTask_13');
        const originalFormKey = getFormDefinition(userTask).get('formKey');

        // when
        addZeebeUserTask(userTask);

        // then
        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.formKey).not.to.exist;
        expect(formDefinition.externalReference).to.eql(originalFormKey);
        expect(formDefinition.formId).not.to.exist;
      }));


      it('should keep Camunda Form (linked)', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('UserTask_12');
        const originalFormId = getFormDefinition(userTask).get('formId');

        // when
        addZeebeUserTask(userTask);

        // then
        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.formKey).not.to.exist;
        expect(formDefinition.externalReference).not.to.exist;
        expect(formDefinition.formId).to.eql(originalFormId);
      }));


      it('should keep binding type', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('UserTask_12');

        expect(getFormDefinition(userTask).get('bindingType')).to.equal('deployment');

        // when
        addZeebeUserTask(userTask);

        // then
        expect(getFormDefinition(userTask).get('bindingType')).to.equal('deployment');
      }));

    });


    describe('change from Zeebe User Task', function() {

      it('should keep externalReference as formKey', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('withExternalReference');
        const externalReference = getFormDefinition(userTask).get('externalReference');

        // when
        removeZeebeUserTask(userTask);

        // then
        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.externalReference).not.to.exist;
        expect(formDefinition.formId).not.to.exist;
        expect(formDefinition.formKey).to.eql(externalReference);
      }));


      it('should keep externalReference as formKey (empty value)', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('withEmptyExternalReference');
        const externalReference = getFormDefinition(userTask).get('externalReference');

        // when
        removeZeebeUserTask(userTask);

        // then
        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.externalReference).not.to.exist;
        expect(formDefinition.formId).not.to.exist;
        expect(formDefinition.formKey).to.eql(externalReference);
      }));


      it('should keep Camunda Form (linked)', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('withFormId');
        const originalFormId = getFormDefinition(userTask).get('formId');

        // when
        removeZeebeUserTask(userTask);

        // then
        const formDefinition = getFormDefinition(userTask);

        expect(formDefinition.formKey).not.to.exist;
        expect(formDefinition.externalReference).not.to.exist;
        expect(formDefinition.formId).to.eql(originalFormId);
      }));


      it('should keep binding type', inject(function(elementRegistry) {

        // given
        const userTask = elementRegistry.get('UserTask_12');

        expect(getFormDefinition(userTask).get('bindingType')).to.equal('deployment');

        // when
        removeZeebeUserTask(userTask);

        // then
        expect(getFormDefinition(userTask).get('bindingType')).to.equal('deployment');
      }));

    });

  });

});


// helpers //////////

function getUserTaskForms() {
  const BPMN_JS = getBpmnJS();

  return BPMN_JS.invoke(function(canvas) {
    const rootElement = canvas.getRootElement();
    const businessObject = getBusinessObject(rootElement);

    return getExtensionElementsList(businessObject, 'zeebe:UserTaskForm');
  });
}

function addZeebeUserTask(element) {
  getBpmnJS().invoke(function(bpmnFactory, modeling) {
    const extensionElements = getBusinessObject(element).get('extensionElements'),
          values = extensionElements.get('values'),
          zeebeUserTask = bpmnFactory.create('zeebe:UserTask');

    // when
    modeling.updateModdleProperties(element, extensionElements, {
      values: values.concat(zeebeUserTask)
    });
  });
}

function removeZeebeUserTask(element) {
  getBpmnJS().invoke(function(modeling) {
    const extensionElements = getBusinessObject(element).get('extensionElements'),
          values = extensionElements.get('values');

    // when
    modeling.updateModdleProperties(element, extensionElements, {
      values: values.filter(value => !is(value, 'zeebe:UserTask'))
    });
  });
}

function hasUsertaskForm(id, userTaskForms) {
  return !!userTaskForms.find((userTaskForm) => {
    return userTaskForm.get('zeebe:id') === id;
  });
}

/**
 * Create shape without invoking create behavior.
 * This allows to create a job-worker user task for the tests purpose.
 * @param {ModdleElement} element
 */
function createShape(element) {
  return getBpmnJS().invoke(function(canvas, modeling) {
    const rootElement = canvas.getRootElement();
    return modeling.createShape(element, { x: 100, y: 100 }, rootElement, { createElementsBehavior: false });
  });
}
