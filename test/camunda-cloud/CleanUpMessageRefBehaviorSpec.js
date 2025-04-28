import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './message.bpmn';


describe('camunda-cloud/features/modeling - CleanUpMessageThrowEventBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));

  describe('replace', function() {

    it('should remove message ref when replacing with message throw event', inject(
      function(elementRegistry, bpmnReplace) {

        // given
        let event = elementRegistry.get('Event');

        // assume
        expect(getMessageRef(event)).to.exist;

        // when
        bpmnReplace.replaceElement(event, {
          type: 'bpmn:EndEvent',
          eventDefinitionType: 'bpmn:MessageEventDefinition'
        });

        // then
        event = elementRegistry.get('Event');
        expect(getMessageRef(event)).not.to.exist;
      }
    ));


    it('should remove message ref when replacing with send task', inject(
      function(elementRegistry, bpmnReplace) {

        // given
        let task = elementRegistry.get('ReceiveTask');

        // assume
        expect(getMessageRef(task)).to.exist;

        // when
        bpmnReplace.replaceElement(task, {
          type: 'bpmn:SendTask'
        });

        // then
        task = elementRegistry.get('ReceiveTask');
        expect(getMessageRef(task)).not.to.exist;
      }
    ));


    it('should keep message ref when replacing with message catch event', inject(
      function(elementRegistry, bpmnReplace) {

        // given
        let event = elementRegistry.get('Event');

        // assume
        expect(getMessageRef(event)).to.exist;

        // when
        bpmnReplace.replaceElement(event, {
          type: 'bpmn:StartEvent',
          eventDefinitionType: 'bpmn:MessageEventDefinition'
        });

        // then
        event = elementRegistry.get('Event');
        expect(getMessageRef(event)).to.exist;
      }
    ));
  });


});


// helpers //////////

function getMessageRef(element) {
  const bo = getBusinessObject(element);
  if (is(element, 'bpmn:Event')) {
    return bo.get('eventDefinitions')[0].get('messageRef');
  }

  return bo.get('messageRef');
}
