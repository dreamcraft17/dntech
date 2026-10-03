/**
 * Default service delivery process — PRD v2 §4.3
 *
 * Only the ordering lives here; the copy is translated under
 * `catalog.services.process.<key>` in the message catalogs.
 */

export const SERVICE_PROCESS_STEPS = [
  { step: 1, key: 'discovery' },
  { step: 2, key: 'planning' },
  { step: 3, key: 'development' },
  { step: 4, key: 'testing' },
  { step: 5, key: 'launch' },
] as const;

export type ServiceProcessStepKey = (typeof SERVICE_PROCESS_STEPS)[number]['key'];
