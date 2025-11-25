import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import {
  getOutputParameters,
} from 'lib/camunda-cloud/util/InputOutputUtil';

import {
  getCalledElement
} from 'lib/camunda-cloud/util/CalledElementUtil';

import diagramXML from './process-call-activities.bpmn';


describe('camunda-cloud/features/modeling - CallActivityVariablesPropagationBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));

  [
    'propagateAllChildVariables',
    'zeebe:propagateAllChildVariables'
  ].forEach((key) => {

    describe(`removing zeebe:Output elements when zeebe:propagateAllChildVariables is set to true (${ key })`, function() {

      let element;

      beforeEach(inject(function(elementRegistry, modeling) {

        // given
        element = elementRegistry.get('CallActivity_3');

        // when
        modeling.updateModdleProperties(element, getCalledElement(element), { [ key ]: true });
      }));


      it('should execute', inject(function() {

        // then
        const outputParameters = getOutputParameters(element);

        expect(outputParameters).to.exist;
        expect(outputParameters).to.be.empty;
      }));


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        const outputParameters = getOutputParameters(element);

        expect(outputParameters).to.exist;
        expect(outputParameters).to.have.length(1);
      }));


      it('should undo/redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        const outputParameters = getOutputParameters(element);

        expect(outputParameters).to.exist;
        expect(outputParameters).to.be.empty;
      }));

    });
  });
});
