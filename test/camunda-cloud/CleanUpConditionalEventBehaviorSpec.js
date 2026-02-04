import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';
import { getEventDefinition } from '../../lib/util/EventDefinition';

import diagramXML from './process-conditional-event.bpmn';


describe('camunda-cloud/features/modeling - CleanUpConditionalEventBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));

  it('should remove variableEvents when moving from subprocess to root', inject(
    function(elementRegistry, modeling) {

      // given
      const event = elementRegistry.get('NestedConditionalEvent'),
            process = elementRegistry.get('Process_1');

      // assume
      const conditionalFilterBefore = getConditionalFilter(event);
      expect(conditionalFilterBefore).to.exist;
      expect(conditionalFilterBefore.get('variableEvents')).to.equal('create,update');

      // when
      modeling.moveElements([ event ], { x: -200, y: 0 }, process);

      // then
      const conditionalFilter = getConditionalFilter(event);
      expect(conditionalFilter).to.exist;
      expect(conditionalFilter.get('variableNames')).to.equal('status');
      expect(conditionalFilter.get('variableEvents')).not.to.exist;
    }
  ));


  it('should keep variableEvents when moving inside subprocess', inject(
    function(elementRegistry, modeling) {

      // given
      const event = elementRegistry.get('NestedConditionalEvent'),
            subProcess = elementRegistry.get('SubProcess_1');

      // assume
      const conditionalFilterBefore = getConditionalFilter(event);
      expect(conditionalFilterBefore).to.exist;
      expect(conditionalFilterBefore.get('variableEvents')).to.equal('create,update');

      // when
      modeling.moveElements([ event ], { x: 50, y: 0 }, subProcess);

      // then
      const conditionalFilter = getConditionalFilter(event);
      expect(conditionalFilter).to.exist;
      expect(conditionalFilter.get('variableEvents')).to.equal('create,update');
    }
  ));


  describe('undo/redo', function() {

    it('should undo removal of variableEvents', inject(
      function(elementRegistry, modeling, commandStack) {

        // given
        const event = elementRegistry.get('NestedConditionalEvent'),
              process = elementRegistry.get('Process_1');

        // when
        modeling.moveElements([ event ], { x: -200, y: 0 }, process);

        // then
        let conditionalFilter = getConditionalFilter(event);
        expect(conditionalFilter.get('variableEvents')).not.to.exist;

        // when
        commandStack.undo();

        // then
        conditionalFilter = getConditionalFilter(event);
        expect(conditionalFilter.get('variableEvents')).to.equal('create,update');
      }
    ));


    it('should redo removal of variableEvents', inject(
      function(elementRegistry, modeling, commandStack) {

        // given
        const event = elementRegistry.get('NestedConditionalEvent'),
              process = elementRegistry.get('Process_1');

        // when
        modeling.moveElements([ event ], { x: -200, y: 0 }, process);
        commandStack.undo();
        commandStack.redo();

        // then
        const conditionalFilter = getConditionalFilter(event);
        expect(conditionalFilter.get('variableEvents')).not.to.exist;
      }
    ));

  });

});


// helpers //////////

function getConditionalEventDefinition(element) {
  return getEventDefinition(element, 'bpmn:ConditionalEventDefinition');
}

function getConditionalFilter(element) {
  const conditionalEventDefinition = getConditionalEventDefinition(element);

  if (!conditionalEventDefinition) {
    return null;
  }

  return getExtensionElementsList(conditionalEventDefinition, 'zeebe:ConditionalFilter')[ 0 ];
}
