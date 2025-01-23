import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import { getExtensionElementsList } from 'lib/util/ExtensionElementsUtil';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './zeebe-ad-hoc.bpmn';


describe('camunda-cloud/features/modeling - ZeebeAdHocBehaviorSpec', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));

  it('should remove zeebe:AdHoc for non ad-hoc sub process', inject(function(bpmnReplace, elementRegistry) {

    // given
    const subprocess = elementRegistry.get('Adhoc_Subprocess');

    // when
    const result = bpmnReplace.replaceElement(subprocess, {
      type: 'bpmn:SubProcess'
    });

    // then
    const extensionElements = getExtensionElementsList(getBusinessObject(result));
    expect(extensionElements).to.have.lengthOf(0);
  }));

});