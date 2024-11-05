import { bootstrapCamundaCloudModeler, inject } from 'test/TestHelper';

import { find } from 'min-dash';

import {
  getZeebeUserTaskElement,
  getZeebeUserTaskElements,
} from '../../lib/camunda-cloud/util/ZeebeUserTaskUtil';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

import emptyProcessDiagramXML from './process-empty.bpmn';
import userTasksXML from './process-user-tasks.bpmn';

describe('camunda-cloud/features/modeling - CreateZeebeUserTaskBehavior', function() {
  describe('populate zeebe:userTask', function() {
    describe('when creating new shapes', function() {
      beforeEach(bootstrapCamundaCloudModeler(emptyProcessDiagramXML));

      it('should execute when creating bpmn:UserTask', inject(function(
          canvas,
          modeling
      ) {

        // given
        const rootElement = canvas.getRootElement();

        // when
        const newShape = modeling.createShape(
          { type: 'bpmn:UserTask' },
          { x: 100, y: 100 },
          rootElement
        );

        // then
        const businessObject = getBusinessObject(newShape),
              extensionElements = businessObject.get('extensionElements'),
              zeebeUserTaskExtension = getZeebeUserTaskElement(newShape);

        expect(zeebeUserTaskExtension).to.exist;
        expect(extensionElements).to.exist;
        expect(zeebeUserTaskExtension.$parent).to.equal(extensionElements);
      }));

      it('should not execute when creating bpmn:Task', inject(function(
          canvas,
          modeling
      ) {

        // given
        const rootElement = canvas.getRootElement();

        // when
        const newShape = modeling.createShape(
          { type: 'bpmn:Task' },
          { x: 100, y: 100 },
          rootElement
        );

        // then
        const zeebeUserTaskExtension = getZeebeUserTaskElement(newShape);

        expect(zeebeUserTaskExtension).not.to.exist;
      }));
    });

    describe('when copying bpmn:UserTask', function() {
      beforeEach(bootstrapCamundaCloudModeler(userTasksXML));

      it('should re-use existing extensionElement', inject(function(
          canvas,
          copyPaste,
          elementRegistry
      ) {

        // given
        const rootElement = canvas.getRootElement();
        const userTask = elementRegistry.get('withZeebeUserTask');

        // when
        copyPaste.copy(userTask);

        const elements = copyPaste.paste({
          element: rootElement,
          point: {
            x: 1000,
            y: 1000,
          },
        });

        // then
        const pastedUserTask = find(elements, (element) =>
          is(element, 'bpmn:UserTask')
        );

        const businessObject = getBusinessObject(pastedUserTask),
              extensionElements = businessObject.get('extensionElements'),
              zeebeUserTaskExtensions = getZeebeUserTaskElements(pastedUserTask);

        expect(zeebeUserTaskExtensions).to.exist;
        expect(extensionElements).to.exist;
        expect(zeebeUserTaskExtensions.length).to.equal(1);
        expect(zeebeUserTaskExtensions[0].$parent).to.equal(extensionElements);
      }));
    });
  });
});
