import { expect } from 'chai';

import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getCalledElement } from 'lib/camunda-cloud/util/CalledElementUtil';

import diagramXML from './process-call-activity-business-id.bpmn';


describe('camunda-cloud/features/modeling - Call Activity Business ID', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));

  [
    'bpmn:Task',
    'bpmn:UserTask',
    'bpmn:SubProcess'
  ].forEach(function(targetType) {

    describe(`morph Call Activity with Business ID to ${targetType}`, function() {

      it('should remove Business ID', inject(function(bpmnReplace, elementRegistry) {

        // given
        const callActivity = elementRegistry.get('CallActivityWithBusinessId');

        // assume
        expect(getCalledElement(callActivity).get('businessId')).to.equal('=order.customerId');

        // when
        bpmnReplace.replaceElement(callActivity, { type: targetType });

        // then
        const element = elementRegistry.get('CallActivityWithBusinessId');

        expect(getCalledElement(element)).not.to.exist;
      }));


      it('should remove empty (null) Business ID', inject(function(bpmnReplace, elementRegistry) {

        // given
        const callActivity = elementRegistry.get('CallActivityWithEmptyBusinessId');

        // assume
        expect(getCalledElement(callActivity).get('businessId')).to.equal('');

        // when
        bpmnReplace.replaceElement(callActivity, { type: targetType });

        // then
        const element = elementRegistry.get('CallActivityWithEmptyBusinessId');

        expect(getCalledElement(element)).not.to.exist;
      }));

    });

  });


  describe('undo', function() {

    it('should restore Business ID', inject(function(bpmnReplace, elementRegistry, commandStack) {

      // given
      const callActivity = elementRegistry.get('CallActivityWithBusinessId');

      bpmnReplace.replaceElement(callActivity, { type: 'bpmn:Task' });

      // when
      commandStack.undo();

      // then
      const element = elementRegistry.get('CallActivityWithBusinessId');

      expect(getCalledElement(element).get('businessId')).to.equal('=order.customerId');
    }));

  });

});
