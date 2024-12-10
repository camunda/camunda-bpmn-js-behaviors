# Changelog

All notable changes to [camunda-bpmn-js-behaviors](https://github.com/camunda/camunda-bpmn-js-behaviors) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 1.8.0

* `FEAT`: make `Zeebe user task` the default implementation of user task ([#86](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/86))

## 1.7.2

* `FIX`: create new user task form only if user task form referenced ([#85](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/85))

## 1.7.1

* `FIX`: clean up `zeebe:TaskListeners` on user task properties update ([#90](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/90))

## 1.7.0

* `FEAT`: support `zeebe:TaskListener` ([#88](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/88))

## 1.6.1

* `FIX`: remove empty `zeebe:VersionTag` ([#81](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/81))

## 1.6.0

* `FEAT`: support `zeebe:versionTag` for `zeebe:CalledDecision`, `zeebe:CalledElement` and `zeebe:FormDefinition` ([#80](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/80))

## 1.5.0

* `FEAT`: support `zeebe:bindingType` for `zeebe:CalledDecision`, `zeebe:CalledElement` and `zeebe:FormDefinition` ([#78](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/78))

## 1.4.0

* `FEAT`: support `zeebe:ExecutionListener` ([#76](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/76))
* `DEPS`: update to `zeebe-bpmn-moddle@1.2.0`

## 1.3.0

* `FEAT`: support `zeebe:UserTask` ([#67](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/67))

## 1.2.3

* `FIX`: remove variable propagation behavior ([#4051](https://github.com/camunda/camunda-modeler/issues/4051))

## 1.2.2

* `FIX`: do not try to copy `isExecutable` from empty participants ([#54](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/54))

## 1.2.1

* `DEPS`: update devDependencies

## 1.2.0

* `FEAT`: remove empty `zeebe:Subscription` extension elements ([#50](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/50))

## 1.1.0

* `FEAT`: support linking Camunda form through `zeebe:formId` ([#49](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/49))

## 1.0.0

* `FEAT`: remove output mappings from end events ([#42](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/42))

## 0.6.0

* `FEAT`: support `bpmn:timeDate` for timer boundary and intermediate catch events ([#36](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/36))

## 0.5.0

* `FEAT`: remove empty `zeebe:TaskSchedule` extension elements ([#34](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/34))

## 0.4.0

* `FEAT`: do not remove assignment if `zeebe:candidateUsers` set ([#20](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/20))

## 0.3.0

* `FEAT`: clean up timer expressions

## 0.2.2

* `DEPS` update to `min-dash@4`

## 0.2.1

* `DEPS`: support `bpmn-js@10`

## 0.2.0

* `FEAT`: incorporate `zeebe` + `camunda` moddle behaviors
* `FEAT`: keep `isExecutable` flag after participant deletion ([#3](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/3))

## 0.1.1

* `FIX`: do not update empty business key ([#2](https://github.com/camunda/camunda-bpmn-js-behaviors/pull/2))

## 0.1.0

* `CHORE`: initial import and first release 🎉
