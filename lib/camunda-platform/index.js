import DeleteErrorEventDefinitionBehavior from './DeleteErrorEventDefinitionBehavior';
import DeleteParticipantBehaviour from '../shared/DeleteParticipantBehaviour';
import DeleteRetryTimeCycleBehavior from './DeleteRetryTimeCycleBehavior';
import UpdateCamundaExclusiveBehavior from './UpdateCamundaExclusiveBehavior';
import UpdateInputOutputBehavior from './UpdateInputOutputBehavior';
import UpdateResultVariableBehavior from './UpdateResultVariableBehavior';
import UserTaskFormsBehavior from './UserTaskFormsBehavior';
import UserTaskGeneratedFormsBehavior from './UserTaskGeneratedFormsBehavior';

export default {
  __init__: [
    'deleteErrorEventDefinitionBehavior',
    'deleteParticipantBehaviour',
    'deleteRetryTimeCycleBehavior',
    'updateCamundaExclusiveBehavior',
    'updateResultVariableBehavior',
    'updateInputOutputBehavior',
    'userTaskFormsBehavior',
    'userTaskGeneratedFormsBehavior'
  ],
  deleteErrorEventDefinitionBehavior: [ 'type', DeleteErrorEventDefinitionBehavior ],
  deleteParticipantBehaviour: [ 'type', DeleteParticipantBehaviour ],
  deleteRetryTimeCycleBehavior: [ 'type', DeleteRetryTimeCycleBehavior ],
  updateCamundaExclusiveBehavior: [ 'type', UpdateCamundaExclusiveBehavior ],
  updateResultVariableBehavior: [ 'type', UpdateResultVariableBehavior ],
  updateInputOutputBehavior: [ 'type', UpdateInputOutputBehavior ],
  userTaskFormsBehavior: [ 'type', UserTaskFormsBehavior ],
  userTaskGeneratedFormsBehavior: [ 'type', UserTaskGeneratedFormsBehavior ]
};
