import CleanUpAdHocSubProcessBehavior from './CleanUpAdHocSubProcessBehavior';
import CleanUpBusinessRuleTaskBehavior from './CleanUpBusinessRuleTaskBehavior';
import CleanUpJobPriorityDefinitionBehavior from './CleanUpJobPriorityDefinitionBehavior';
import CleanUpConditionalEventBehavior from './CleanUpConditionalEventBehavior';
import CleanUpEndEventBehavior from './CleanUpEndEventBehavior';
import CleanUpExecutionListenersBehavior from './CleanUpExecutionListenersBehavior';
import CleanUpMessageRefBehavior from './CleanUpMessageRefBehavior';
import CleanUpTaskListenersBehavior from './CleanUpTaskListenersBehavior';
import CleanUpSubscriptionBehavior from './CleanUpSubscriptionBehavior';
import CleanUpTimerExpressionBehavior from './CleanUpTimerExpressionBehavior';
import CopyPasteBehavior from './CopyPasteBehavior';
import CreateZeebeBusinessRuleTaskBehavior from './CreateZeebeBusinessRuleTaskBehavior';
import CreateZeebeCallActivityBehavior from './CreateZeebeCallActivityBehavior';
import CreateZeebeScriptTaskBehavior from './CreateZeebeScriptTaskBehavior';
import CreateZeebeUserTaskBehavior from './CreateZeebeUserTaskBehavior';
import DeleteParticipantBehaviour from '../shared/DeleteParticipantBehaviour';
import FormsBehavior from './FormsBehavior';
import RemoveAssignmentDefinitionBehavior from './RemoveAssignmentDefinitionBehavior';
import RemoveTaskScheduleBehavior from './RemoveTaskScheduleBehavior';
import CallActivityVariablesPropagationBehavior from './CallActivityVariablesPropagationBehavior';
import VersionTagBehavior from './VersionTagBehavior';

export default {
  __init__: [
    'callActivityVariablesPropagationBehavior',
    'cleanUpAdHocSubProcessBehavior',
    'cleanUpBusinessRuleTaskBehavior',
    'cleanUpJobPriorityDefinitionBehavior',
    'cleanUpConditionalEventBehavior',
    'cleanUpEndEventBehavior',
    'cleanUpExecutionListenersBehavior',
    'cleanUpMessageRefBehavior',
    'cleanUpTaskListenersBehavior',
    'cleanUpSubscriptionBehavior',
    'cleanUpTimerExpressionBehavior',
    'copyPasteBehavior',
    'createZeebeBusinessRuleTaskBehavior',
    'createZeebeCallActivityBehavior',
    'createZeebeScriptTaskBehavior',
    'createZeebeUserTaskBehavior',
    'deleteParticipantBehaviour',
    'formsBehavior',
    'removeAssignmentDefinitionBehavior',
    'removeTaskScheduleBehavior',
    'versionTagBehavior'
  ],
  callActivityVariablesPropagationBehavior: [ 'type', CallActivityVariablesPropagationBehavior ],
  cleanUpAdHocSubProcessBehavior: [ 'type', CleanUpAdHocSubProcessBehavior ],
  cleanUpBusinessRuleTaskBehavior: [ 'type', CleanUpBusinessRuleTaskBehavior ],
  cleanUpJobPriorityDefinitionBehavior: [ 'type', CleanUpJobPriorityDefinitionBehavior ],
  cleanUpConditionalEventBehavior: [ 'type', CleanUpConditionalEventBehavior ],
  cleanUpEndEventBehavior: [ 'type', CleanUpEndEventBehavior ],
  cleanUpExecutionListenersBehavior: [ 'type', CleanUpExecutionListenersBehavior ],
  cleanUpMessageRefBehavior: [ 'type', CleanUpMessageRefBehavior ],
  cleanUpTaskListenersBehavior: [ 'type', CleanUpTaskListenersBehavior ],
  cleanUpSubscriptionBehavior: [ 'type', CleanUpSubscriptionBehavior ],
  cleanUpTimerExpressionBehavior: [ 'type', CleanUpTimerExpressionBehavior ],
  copyPasteBehavior: [ 'type', CopyPasteBehavior ],
  createZeebeBusinessRuleTaskBehavior: [ 'type', CreateZeebeBusinessRuleTaskBehavior ],
  createZeebeCallActivityBehavior: [ 'type', CreateZeebeCallActivityBehavior ],
  createZeebeScriptTaskBehavior: [ 'type', CreateZeebeScriptTaskBehavior ],
  createZeebeUserTaskBehavior: [ 'type', CreateZeebeUserTaskBehavior ],
  deleteParticipantBehaviour: [ 'type', DeleteParticipantBehaviour ],
  formsBehavior: [ 'type', FormsBehavior ],
  removeAssignmentDefinitionBehavior: [ 'type', RemoveAssignmentDefinitionBehavior ],
  removeTaskScheduleBehavior: [ 'type', RemoveTaskScheduleBehavior ],
  versionTagBehavior: [ 'type', VersionTagBehavior ]
};
