import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './process-executable-participant.bpmn';


describe('camunda-platform/features/modeling - DeleteParticipantBehaviour', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));

  describe('remove set isExecuteable on new Process', function() {

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

});