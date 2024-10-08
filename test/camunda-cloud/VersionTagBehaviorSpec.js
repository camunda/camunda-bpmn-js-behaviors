import {
  bootstrapCamundaCloudModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject,
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './version-tag.bpmn';


describe('camunda-cloud/features/modeling - VersionTagBehavior', function() {

  beforeEach(bootstrapCamundaCloudModeler(diagramXML));


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

    });

    describe('set binding type', function() {

      it('should set binding type', inject(function(elementRegistry, modeling) {

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

    it('should remove version tag', inject(function(elementRegistry, modeling) {

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
  const businessObject = getBusinessObject(element);

  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return null;
  }

  return extensionElements.get('values').find(extensionElement => {
    return is(extensionElement, 'zeebe:VersionTag');
  });
}