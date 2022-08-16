import CleanUpBusinessRuleTaskBehavior from './CleanUpBusinessRuleTaskBehavior';
import CreateZeebeCallActivityBehavior from './CreateZeebeCallActivityBehavior';
import DeleteParticipantBehaviour from '../shared/DeleteParticipantBehaviour';
import FormDefinitionBehavior from './FormDefinitionBehavior';
import RemoveAssignmentDefinitionBehavior from './RemoveAssignmentDefinitionBehavior';
import UpdatePropagateAllChildVariablesBehavior from './UpdatePropagateAllChildVariablesBehavior';


export default {
  __init__: [
    'cleanUpBusinessRuleTaskBehavior',
    'createZeebeCallActivityBehavior',
    'deleteParticipantBehaviour',
    'formDefinitionBehavior',
    'removeAssignmentDefinitionBehavior',
    'updatePropagateAllChildVariablesBehavior'
  ],
  cleanUpBusinessRuleTaskBehavior: [ 'type', CleanUpBusinessRuleTaskBehavior ],
  createZeebeCallActivityBehavior: [ 'type', CreateZeebeCallActivityBehavior ],
  deleteParticipantBehaviour: [ 'type', DeleteParticipantBehaviour ],
  formDefinitionBehavior: [ 'type', FormDefinitionBehavior ],
  removeAssignmentDefinitionBehavior: [ 'type', RemoveAssignmentDefinitionBehavior ],
  updatePropagateAllChildVariablesBehavior: [ 'type', UpdatePropagateAllChildVariablesBehavior ]
};
