import camundaModdle from 'camunda-bpmn-moddle/resources/camunda.json';

import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';
import zeebeModdleExtension from 'zeebe-bpmn-moddle/lib';

export * from 'bpmn-js/test/helper';

import { bootstrapModeler } from 'bpmn-js/test/helper';

import camundaCloudModule from 'lib/camunda-cloud';
import camundaPlatformModule from 'lib/camunda-platform';

const defaultCamundaCloudAdditionalModules = [
  camundaCloudModule
];

const defaultCamundaPlatformAdditionalModules = [
  camundaPlatformModule
];

export function bootstrapCamundaCloudModeler(diagram, options = {}) {
  const { additionalModules = [] } = options;

  return bootstrapModeler(diagram, {
    additionalModules: [
      zeebeModdleExtension,
      ...defaultCamundaCloudAdditionalModules,
      ...additionalModules
    ],
    moddleExtensions: {
      zeebe: zeebeModdle
    }
  });
}

export function bootstrapCamundaPlatformModeler(diagram, options = {}) {
  const { additionalModules = [] } = options;

  return bootstrapModeler(diagram, {
    additionalModules: [
      ...defaultCamundaPlatformAdditionalModules,
      ...additionalModules
    ],
    moddleExtensions: {
      camunda: camundaModdle
    }
  });
}