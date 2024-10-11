import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

const buildScripts = [
  '*.js',
  '*.mjs',
  'test/*.js'
];

export default [
  ...bpmnIoPlugin.configs.recommended,
  ...bpmnIoPlugin.configs.browser.map((config) => {
    return {
      ...config,
      files: [ 'lib/**/*.js', 'test/**/*.js' ],
      ignores: buildScripts
    };
  }),
  ...bpmnIoPlugin.configs.node.map((config) => {
    return {
      ...config,
      files: buildScripts
    };
  }),
  ...bpmnIoPlugin.configs.mocha.map((config) => {
    return {
      ...config,
      files: [ 'test/**/*.js' ]
    };
  })
];