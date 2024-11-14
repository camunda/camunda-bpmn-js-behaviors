import CleanUpBusinessRuleTaskBehavior from './CleanUpBusinessRuleTaskBehavior';
import CleanUpEndEventBehavior from './CleanUpEndEventBehavior';
import CleanUpExecutionListenersBehavior from './CleanUpExecutionListenersBehavior';
import CleanUpTaskListenersBehavior from './CleanUpTaskListenersBehavior';
import CleanUpSubscriptionBehavior from './CleanUpSubscriptionBehavior';
import CleanUpTimerExpressionBehavior from './CleanUpTimerExpressionBehavior';
import CopyPasteBehavior from './CopyPasteBehavior';
import CreateZeebeCallActivityBehavior from './CreateZeebeCallActivityBehavior';
import DeleteParticipantBehaviour from '../shared/DeleteParticipantBehaviour';
import FormsBehavior from './FormsBehavior';
import RemoveAssignmentDefinitionBehavior from './RemoveAssignmentDefinitionBehavior';
import RemoveTaskScheduleBehavior from './RemoveTaskScheduleBehavior';
import VersionTagBehavior from './VersionTagBehavior';

export default {
  __init__: [
    'cleanUpBusinessRuleTaskBehavior',
    'cleanUpEndEventBehavior',
    'cleanUpExecutionListenersBehavior',
    'cleanUpTaskListenersBehavior',
    'cleanUpSubscriptionBehavior',
    'cleanUpTimerExpressionBehavior',
    'copyPasteBehavior',
    'createZeebeCallActivityBehavior',
    'deleteParticipantBehaviour',
    'formsBehavior',
    'removeAssignmentDefinitionBehavior',
    'removeTaskScheduleBehavior',
    'versionTagBehavior'
  ],
  cleanUpBusinessRuleTaskBehavior: [ 'type', CleanUpBusinessRuleTaskBehavior ],
  cleanUpEndEventBehavior: [ 'type', CleanUpEndEventBehavior ],
  cleanUpExecutionListenersBehavior: [ 'type', CleanUpExecutionListenersBehavior ],
  cleanUpTaskListenersBehavior: [ 'type', CleanUpTaskListenersBehavior ],
  cleanUpSubscriptionBehavior: [ 'type', CleanUpSubscriptionBehavior ],
  cleanUpTimerExpressionBehavior: [ 'type', CleanUpTimerExpressionBehavior ],
  copyPasteBehavior: [ 'type', CopyPasteBehavior ],
  createZeebeCallActivityBehavior: [ 'type', CreateZeebeCallActivityBehavior ],
  deleteParticipantBehaviour: [ 'type', DeleteParticipantBehaviour ],
  formsBehavior: [ 'type', FormsBehavior ],
  removeAssignmentDefinitionBehavior: [ 'type', RemoveAssignmentDefinitionBehavior ],
  removeTaskScheduleBehavior: [ 'type', RemoveTaskScheduleBehavior ],
  versionTagBehavior: [ 'type', VersionTagBehavior ]
};
