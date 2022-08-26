import CleanUpBusinessRuleTaskBehavior from './CleanUpBusinessRuleTaskBehavior';
import CopyPasteBehavior from './CopyPasteBehavior';
import CreateZeebeCallActivityBehavior from './CreateZeebeCallActivityBehavior';
import DeleteParticipantBehaviour from '../shared/DeleteParticipantBehaviour';
import FormDefinitionBehavior from './FormDefinitionBehavior';
import RemoveAssignmentDefinitionBehavior from './RemoveAssignmentDefinitionBehavior';
import UpdatePropagateAllChildVariablesBehavior from './UpdatePropagateAllChildVariablesBehavior';


export default {
  __init__: [
    'cleanUpBusinessRuleTaskBehavior',
    'copyPasteBehavior',
    'createZeebeCallActivityBehavior',
    'deleteParticipantBehaviour',
    'formDefinitionBehavior',
    'removeAssignmentDefinitionBehavior',
    'updatePropagateAllChildVariablesBehavior'
  ],
  cleanUpBusinessRuleTaskBehavior: [ 'type', CleanUpBusinessRuleTaskBehavior ],
  copyPasteBehavior: [ 'type', CopyPasteBehavior ],
  createZeebeCallActivityBehavior: [ 'type', CreateZeebeCallActivityBehavior ],
  deleteParticipantBehaviour: [ 'type', DeleteParticipantBehaviour ],
  formDefinitionBehavior: [ 'type', FormDefinitionBehavior ],
  removeAssignmentDefinitionBehavior: [ 'type', RemoveAssignmentDefinitionBehavior ],
  updatePropagateAllChildVariablesBehavior: [ 'type', UpdatePropagateAllChildVariablesBehavior ]
};
