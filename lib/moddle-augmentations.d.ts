// Opt-in to the OPTIONAL moddle extension namespaces this package targets
// (zeebe, camunda) — the type-level mirror of the runtime `moddleExtensions`
// config. `bpmn:*` is NOT referenced here: it flows automatically via bpmn-js
// (which depends on bpmn-moddle and re-exposes its ModdleTypeMap augmentation).
/// <reference types="zeebe-bpmn-moddle" />
