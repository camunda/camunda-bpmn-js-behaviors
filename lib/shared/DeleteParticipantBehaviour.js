import { is } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

const LOW_PRIORITY = 250;

/**
 * Camunda specific behavior ensuring process.isExecutable is kept after deleting
 * the last Participant.
 */
export default class DeleteParticipantBehaviour extends CommandInterceptor {
  constructor(eventBus, canvas, modeling) {
    super(eventBus);

    this.postExecuted('shape.delete', LOW_PRIORITY, function(context) {
      const {
        collaborationRoot,
        shape
      } = context;

      const newRoot = canvas.getRootElement();

      if (is(shape, 'bpmn:Participant') &&
          collaborationRoot &&
          !collaborationRoot.businessObject.participants.length &&
          is(newRoot, 'bpmn:Process')) {

        const oldProcessBo = shape.businessObject.processRef;

        modeling.updateProperties(newRoot, { isExecutable: oldProcessBo.isExecutable });
      }

    }, true);
  }
}

DeleteParticipantBehaviour.$inject = [
  'eventBus',
  'canvas',
  'modeling'
];