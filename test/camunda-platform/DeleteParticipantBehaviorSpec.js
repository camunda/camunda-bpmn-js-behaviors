import {
  bootstrapCamundaPlatformModeler,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import participantXML from './camunda-executable-participant.bpmn';
import emptyParticipantXML from './camunda-empty-participant.bpmn';


describe('camunda-platform/features/modeling - DeleteParticipantBehaviour', function() {

  describe('set isExecuteable on new process after deleting last participant', function() {

    describe('non-empty participant', function() {

      beforeEach(bootstrapCamundaPlatformModeler(participantXML));

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        const shape = elementRegistry.get('Participant_1');

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', inject(function(canvas) {

        // then
        const newRoot = getBusinessObject(canvas.getRootElement());
        expect(newRoot.isExecutable).to.be.true;
      }));


      it('should undo', inject(function(canvas, commandStack) {

        // given
        const newRoot = getBusinessObject(canvas.getRootElement());

        // when
        commandStack.undo();

        // then
        expect(newRoot.isExecutable).not.to.exist;
      }));


      it('should redo', inject(function(canvas, commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        const newRoot = getBusinessObject(canvas.getRootElement());
        expect(newRoot.isExecutable).to.be.true;
      }));

    });


    describe('empty participant', function() {

      beforeEach(bootstrapCamundaPlatformModeler(emptyParticipantXML));

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        const shape = elementRegistry.get('Participant_1');

        // when
        modeling.removeShape(shape);
      }));


      it('should execute', inject(function(canvas) {

        // then
        const newRoot = getBusinessObject(canvas.getRootElement());
        expect(newRoot.isExecutable).not.to.exist;
      }));


      it('should undo', inject(function(canvas, commandStack) {

        // given
        const newRoot = getBusinessObject(canvas.getRootElement());

        // when
        commandStack.undo();

        // then
        expect(newRoot.isExecutable).not.to.exist;
      }));


      it('should redo', inject(function(canvas, commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        const newRoot = getBusinessObject(canvas.getRootElement());
        expect(newRoot.isExecutable).not.to.exist;
      }));

    });

  });

});