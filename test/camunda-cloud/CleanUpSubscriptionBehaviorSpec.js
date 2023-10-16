import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import diagramXML from './message-subscription.bpmn';


describe('camunda-cloud/features/modeling - CleanUpSubscriptionBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


  describe('removing zeebe:subscription when correlationKey is removed', function() {

    let element;

    beforeEach(inject(function(elementRegistry, modeling) {

      // given
      element = elementRegistry.get('Event');

      const subscription = getSubscription(element);

      // when
      modeling.updateModdleProperties(element, subscription, {
        correlationKey: undefined
      });
    }));


    it('should execute', function() {

      // then
      const subscription = getSubscription(element);

      expect(subscription).not.to.exist;
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      const subscription = getSubscription(element);

      expect(subscription).to.exist;
      expect(subscription.get('correlationKey')).to.equal('=abc');
    }));


    it('should undo/redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      const subscription = getSubscription(element);

      expect(subscription).not.to.exist;
    }));

  });
});

// helpers //////////

function getSubscription(element) {
  const businessObject = getBusinessObject(element);
  const eventDefiniton = businessObject.get('eventDefinitions')[ 0 ];
  const message = eventDefiniton.get('messageRef');

  return getExtensionElementsList(message, 'zeebe:Subscription')[ 0 ];
}
