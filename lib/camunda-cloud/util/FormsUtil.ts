import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { getPrefixedId } from '../../util/IdsUtil';

import { getExtensionElementsList } from '../../util/ExtensionElementsUtil';

import type { Element, ModdleElement, ModdleTypeMap } from 'bpmn-js/lib/model/Types';

const FORM_KEY_PREFIX = 'camunda-forms:bpmn:',
      USER_TASK_FORM_ID_PREFIX = 'UserTaskForm_';

type FormDefinition = ModdleTypeMap['zeebe:FormDefinition'];
type UserTaskForm = ModdleTypeMap['zeebe:UserTaskForm'];

export function getFormDefinition(element: Element | ModdleElement): FormDefinition | undefined {
  const businessObject = getBusinessObject(element);

  const formDefinitions = getExtensionElementsList(businessObject, 'zeebe:FormDefinition');

  return formDefinitions[ 0 ];
}

export function getUserTaskForm(
    element: Element | ModdleElement,
    options: { formKey?: string; rootElement?: ModdleElement } = {}
): UserTaskForm | undefined {
  let {
    formKey,
    rootElement
  } = options;

  rootElement = rootElement || getRootElement(element);

  if (!formKey) {
    const formDefinition = getFormDefinition(element);

    if (!formDefinition) {
      return;
    }

    formKey = formDefinition.get('formKey');
  }

  const userTaskForms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');

  return userTaskForms.find(userTaskForm => {
    return userTaskFormIdToFormKey(userTaskForm.get('id')) === formKey;
  });
}

export function userTaskFormIdToFormKey(userTaskFormId: string | undefined): string {
  return `${ FORM_KEY_PREFIX }${ userTaskFormId }`;
}

export function formKeyToUserTaskFormId(formKey: string): string {
  return formKey.replace(FORM_KEY_PREFIX, '');
}

export function isUserTaskFormKey(formKey: string | undefined): boolean {
  return !!formKey && formKey.startsWith(FORM_KEY_PREFIX);
}

export function createUserTaskFormId(): string {
  return getPrefixedId(USER_TASK_FORM_ID_PREFIX);
}

export function getRootElement(element: Element | ModdleElement): ModdleElement {
  const businessObject = getBusinessObject(element);

  let parent: ModdleElement = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}
