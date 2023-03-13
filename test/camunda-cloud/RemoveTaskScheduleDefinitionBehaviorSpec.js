import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './process-user-tasks.bpmn';


describe('camunda-cloud/features/modeling - RemoveTaskScheduleBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  describe('removing zeebe:TaskSchedule when dueDate is set to undefined', function() {

    let element;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      element = elementRegistry.get('UserTask_9');

      const taskSchedule = getTaskSchedule(element);

      // when
      modeling.updateModdleProperties(element, taskSchedule, {
        dueDate: undefined
      });
    }));


    it('should execute', inject(function() {

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).not.to.exist;
    }));


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).to.exist;
      expect(taskSchedule.get('dueDate')).to.equal('=dueDate');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).not.to.exist;
    }));

  });


  describe('removing zeebe:TaskSchedule when followUpDate is set to undefined', function() {

    let element;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      element = elementRegistry.get('UserTask_10');

      const taskSchedule = getTaskSchedule(element);

      // when
      modeling.updateModdleProperties(element, taskSchedule, {
        followUpDate: undefined
      });
    }));


    it('should execute', inject(function() {

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).not.to.exist;
    }));


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).to.exist;
      expect(taskSchedule.get('followUpDate')).to.equal('=followUpDate');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).not.to.exist;
    }));

  });


  describe('removing zeebe:TaskSchedule when dueDate and followUpDate are set to undefined', function() {

    let element;

    beforeEach(inject(function(commandStack, elementRegistry, modeling) {

      // given
      element = elementRegistry.get('UserTask_8');

      const taskSchedule = getTaskSchedule(element);

      // when
      modeling.updateModdleProperties(element, taskSchedule, {
        dueDate: undefined,
        followUpDate: undefined
      });
    }));


    it('should execute', inject(function() {

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).not.to.exist;
    }));


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).to.exist;
      expect(taskSchedule.get('dueDate')).to.equal('=dueDate');
      expect(taskSchedule.get('followUpDate')).to.equal('=followUpDate');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).not.to.exist;
    }));

  });


  describe('NOT removing zeebe:TaskSchedule', function() {

    let element;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      element = elementRegistry.get('UserTask_8');

      const taskSchedule = getTaskSchedule(element);

      // when
      modeling.updateModdleProperties(element, taskSchedule, {
        dueDate: undefined
      });
    }));


    it('should NOT execute if task schedule has followUpDate', inject(function() {

      // then
      const taskSchedule = getTaskSchedule(element);

      expect(taskSchedule).to.exist;
    }));

  });

});

// helpers //////////

function getTaskSchedule(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskSchedule')[0];
}
