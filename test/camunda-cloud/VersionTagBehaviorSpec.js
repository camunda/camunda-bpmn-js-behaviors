import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import diagramProcessXML from './version-tag-process.bpmn';
import diagramCollaborationXML from './version-tag-collaboration.bpmn';


describe('camunda-cloud/features/modeling - VersionTagBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramProcessXML));


  [
    'CallActivity',
    'BusinessRuleTask',
    'UserTask'
  ].forEach(function(type) {

    describe('unset version tag', function() {

      it('should unset version tag', inject(function(elementRegistry, modeling) {

        // given
        const element = elementRegistry.get(`${ type }_1`);

        const extensionElement = getExtensionElementWithVersionTag(element);

        expect(extensionElement.get('bindingType')).to.equal('versionTag');
        expect(extensionElement.get('versionTag')).to.equal('v1.0.0');

        // when
        modeling.updateModdleProperties(element, extensionElement, {
          bindingType: 'deployment'
        });

        // then
        expect(extensionElement.get('bindingType')).to.equal('deployment');
        expect(extensionElement.get('versionTag')).not.to.exist;
      }));


      it('should keep version tag unset if version tag is undefined', inject(function(elementRegistry, modeling) {

        // given
        const element = elementRegistry.get(`${ type }_2`);

        const extensionElement = getExtensionElementWithVersionTag(element);

        expect(extensionElement.get('bindingType')).to.equal('deployment');

        // when
        modeling.updateModdleProperties(element, extensionElement, {
          versionTag: undefined
        });

        // then
        expect(extensionElement.get('bindingType')).to.equal('deployment');
        expect(extensionElement.get('versionTag')).not.to.exist;
      }));

    });

    describe('set binding type', function() {

      it('should set binding type when setting versionTag', inject(function(elementRegistry, modeling) {

        // given
        const element = elementRegistry.get(`${ type }_2`);

        const extensionElement = getExtensionElementWithVersionTag(element);

        expect(extensionElement.get('bindingType')).to.equal('deployment');

        // when
        modeling.updateModdleProperties(element, extensionElement, {
          versionTag: 'v1.0.0'
        });

        // then
        expect(extensionElement.get('bindingType')).to.equal('versionTag');
        expect(extensionElement.get('versionTag')).to.equal('v1.0.0');
      }));

    });

  });


  describe('remove version tag', function() {

    describe('process', function() {

      beforeEach(bootstrapCamundaCloudModeler(diagramProcessXML));


      it('should remove version tag (process)', inject(function(elementRegistry, modeling) {

        // given
        const element = elementRegistry.get('Process_1');

        const versionTag = getVersionTag(element);

        // assume
        expect(versionTag).to.exist;

        // when
        modeling.updateModdleProperties(element, versionTag, {
          value: ''
        });

        // then
        expect(getVersionTag(element)).not.to.exist;
      }));

    });


    describe('collaboration', function() {

      beforeEach(bootstrapCamundaCloudModeler(diagramCollaborationXML));


      it('should remove version tag (collaboration)', inject(function(elementRegistry, modeling) {

        // given
        const element = elementRegistry.get('Participant_1');

        const versionTag = getVersionTag(element);

        // assume
        expect(versionTag).to.exist;

        // when
        modeling.updateModdleProperties(element, versionTag, {
          value: ''
        });

        // then
        expect(getVersionTag(element)).not.to.exist;
      }));

    });

  });

});

// helpers //////////

function getExtensionElementWithVersionTag(element) {
  const businessObject = getBusinessObject(element);

  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return null;
  }

  return extensionElements.get('values').find(extensionElement => {
    return isAny(extensionElement, [
      'zeebe:CalledDecision',
      'zeebe:CalledElement',
      'zeebe:FormDefinition'
    ]);
  });
}

function getVersionTag(element) {
  let businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:Participant')) {
    businessObject = businessObject.get('processRef');
  }

  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return null;
  }

  return extensionElements.get('values').find(extensionElement => {
    return is(extensionElement, 'zeebe:VersionTag');
  });
}