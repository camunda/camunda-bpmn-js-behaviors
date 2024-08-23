import { isDefined } from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { isAny } from 'bpmn-js/lib/util/ModelUtil';

/**
 * Zeebe BPMN specific version tag behavior.
 */
export default class VersionTagBehavior extends CommandInterceptor {
  constructor(eventBus) {
    super(eventBus);

    /**
     * Ensure that `zeebe:BindingTypeSupported` (`zeebe:CalledDecision`,
     * `zeebe:CalledElement` and `zeebe:FormDefinition`) only has
     * `zeebe:versionTag` if `zeebe:bindingType` is `versionTag`.
     */
    this.preExecute('element.updateModdleProperties', function(context) {
      const {
        moddleElement,
        properties
      } = context;

      if (!isAny(moddleElement, [
        'zeebe:CalledDecision',
        'zeebe:CalledElement',
        'zeebe:FormDefinition'
      ])) {
        return;
      }

      // unset `zeebe:versionTag` if `zeebe:bindingType` is not set to `versionTag`
      if ('bindingType' in properties
        && properties.bindingType !== 'versionTag'
        && isDefined(moddleElement.get('versionTag'))) {
        properties.versionTag = undefined;
      }

      // set `zeebe:bindingType` to `versionTag` if `zeebe:versionTag` is set
      if ('versionTag' in properties && moddleElement.get('bindingType') !== 'versionTag') {
        properties.bindingType = 'versionTag';
      }
    }, true);
  }
}

VersionTagBehavior.$inject = [
  'eventBus'
];