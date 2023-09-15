import CleanUpBusinessRuleTaskBehavior from './CleanUpBusinessRuleTaskBehavior';
import CleanUpEndEventBehavior from './CleanUpEndEventBehavior';
import CleanUpTimerExpressionBehavior from './CleanUpTimerExpressionBehavior';
import CopyPasteBehavior from './CopyPasteBehavior';
import CreateZeebeCallActivityBehavior from './CreateZeebeCallActivityBehavior';
import DeleteParticipantBehaviour from '../shared/DeleteParticipantBehaviour';
import FormsBehavior from './FormsBehavior';
import RemoveAssignmentDefinitionBehavior from './RemoveAssignmentDefinitionBehavior';
import RemoveTaskScheduleBehavior from './RemoveTaskScheduleBehavior';
import UpdatePropagateAllChildVariablesBehavior from './UpdatePropagateAllChildVariablesBehavior';

export default {
  __init__: [
    'cleanUpBusinessRuleTaskBehavior',
    'cleanUpEndEventBehavior',
    'cleanUpTimerExpressionBehavior',
    'copyPasteBehavior',
    'createZeebeCallActivityBehavior',
    'deleteParticipantBehaviour',
    'formsBehavior',
    'removeAssignmentDefinitionBehavior',
    'removeTaskScheduleBehavior',
    'updatePropagateAllChildVariablesBehavior'
  ],
  cleanUpBusinessRuleTaskBehavior: [ 'type', CleanUpBusinessRuleTaskBehavior ],
  cleanUpEndEventBehavior: [ 'type', CleanUpEndEventBehavior ],
  cleanUpTimerExpressionBehavior: [ 'type', CleanUpTimerExpressionBehavior ],
  copyPasteBehavior: [ 'type', CopyPasteBehavior ],
  createZeebeCallActivityBehavior: [ 'type', CreateZeebeCallActivityBehavior ],
  deleteParticipantBehaviour: [ 'type', DeleteParticipantBehaviour ],
  formsBehavior: [ 'type', FormsBehavior ],
  removeAssignmentDefinitionBehavior: [ 'type', RemoveAssignmentDefinitionBehavior ],
  removeTaskScheduleBehavior: [ 'type', RemoveTaskScheduleBehavior ],
  updatePropagateAllChildVariablesBehavior: [ 'type', UpdatePropagateAllChildVariablesBehavior ]
};
