import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { find } from 'min-dash';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './process-end-event.bpmn';


describe('camunda-cloud/features/modeling - CleanUpEndEventBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));

  describe('replace', function() {

    it('should remove output mappings when replacing end event with error end event', inject(
      function(elementRegistry, bpmnReplace) {

        // given
        let endEvent = elementRegistry.get('EndEvent_1');

        // assume
        expect(getOutputs(endEvent)).to.have.length(1);

        // when
        bpmnReplace.replaceElement(endEvent, {
          type: 'bpmn:EndEvent',
          eventDefinitionType: 'bpmn:ErrorEventDefinition'
        });

        // then
        endEvent = elementRegistry.get('EndEvent_1');
        expect(getOutputs(endEvent)).to.have.length(0);
      }
    ));
  });


});


// helpers //////////

function getOutputs(element) {
  const ioMapping = getIoMapping(element);
  if (!ioMapping) {
    return [];
  }

  return ioMapping.get('outputParameters');
}

function getIoMapping(element) {
  const bo = getBusinessObject(element);

  const extensionElements = bo.get('extensionElements');

  if (!extensionElements) {
    return null;
  }

  const values = extensionElements.get('values');

  if (!values) {
    return null;
  }

  return find(values, value => is(value, 'zeebe:IoMapping'));
}
