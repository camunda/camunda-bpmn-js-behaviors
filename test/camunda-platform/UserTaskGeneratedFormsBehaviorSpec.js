import {
  bootstrapCamundaPlatformModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from './camunda-user-task-generated-forms-diagram.bpmn';


describe('camunda-platform/features/modeling - UserTaskGeneratedFormsBehavior', function() {

  beforeEach(bootstrapCamundaPlatformModeler(diagramXML));

  [
    [ 'start event', 'StartEvent' ],
    [ 'user task', 'UserTask' ]
  ].forEach(([ type, prefix ]) => {

    describe('setting camunda:FormField#type to boolean', function() {

      describe(type, function() {

        describe('camunda:FormField#values', function() {

          it('should delete camunda:FormField#values', inject(function(elementRegistry, modeling) {

            // when
            const element = elementRegistry.get(`${ prefix }_1`);

            const businessObject = getFormField(element);

            // when
            modeling.updateModdleProperties(element, businessObject, { 'camunda:type': 'boolean' });

            // then
            expect(businessObject.get('camunda:values')).to.be.empty;
          }));


          it('should not delete camunda:FormField#values', inject(function(elementRegistry, modeling) {

            // when
            const element = elementRegistry.get(`${ prefix }_1`);

            const businessObject = getFormField(element);

            // when
            modeling.updateModdleProperties(element, businessObject, { 'camunda:type': 'enum' });

            // then
            expect(businessObject.get('camunda:values')).not.to.be.empty;
          }));

        });

      });

    });

  });


  describe('updating camunda:FormField#id', function() {

    it('should update camunda:FormData#businessKey', inject(function(elementRegistry, modeling) {

      // when
      const element = elementRegistry.get('StartEvent_1');

      const formData = getFormData(element),
            formField = getFormField(element);

      // when
      modeling.updateModdleProperties(element, formField, {
        'camunda:id': 'Foo'
      });

      // then
      expect(formData.get('camunda:businessKey')).to.equal('Foo');
    }));

  });


  describe('removing camunda:FormField', function() {

    it('should remove camunda:FormData#businessKey', inject(function(commandStack, elementRegistry) {

      // when
      const element = elementRegistry.get('StartEvent_1');

      const formData = getFormData(element);

      // when
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: formData,
        properties: {
          fields: []
        }
      });

      // then
      expect(formData.get('camunda:businessKey')).not.to.exist;
    }));

  });

});

// helpers //////////

function getFormData(element) {
  const businessObject = getBusinessObject(element);

  const extensionElements = businessObject.get('extensionElements'),
        values = extensionElements.get('values');

  return values.find((value) => {
    return is(value, 'camunda:FormData');
  });
}

function getFormField(element, index = 0) {
  const formData = getFormData(element);

  return formData.get('camunda:fields')[ index ];
}
