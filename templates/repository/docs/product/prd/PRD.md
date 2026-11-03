# __APP_NAME__ PRD

Status: draft
Owner: __APP_OWNER__
Application: __APP_CODE__
Updated: __GENERATED_DATE__
Specs: REQUIREMENTS_SPEC.md, DOCUMENTATION_SPEC.md

## Document Map

- Add `PRD-<topic>.md` shards in this directory when the PRD grows beyond one reviewable screen.

## 1. Background And Problem

Describe the user problem and why it matters now. The scaffold initializes the delivery foundation; it does not define the product thesis.

## 2. Target Users

Identify the primary users, their context, and the jobs they need to complete.

## 3. Goals And Non-Goals

- Goal: deliver a focused `__APP_DOMAIN__` capability through the PC and H5 surfaces selected at generation time.
- Non-goal: add unrelated domains, speculative integrations, or backend APIs before a validated requirement exists.

## 4. Scope

Initial scaffold scope:

- Repository baseline, Canon documentation, and application identity.
- __SELECTED_SURFACES__ browser surface shells.
- Standard local command surface and verification.

Product scope is captured in requirements before implementation.

## 5. User Scenarios

Add the primary end-to-end scenarios here. Each scenario should name the surface, the user's goal, and the observable outcome.

## 6. Success Metrics

Define measurable outcome and quality metrics. Include accessibility, performance, and reliability targets when they affect acceptance.

## 7. Phases

1. Scaffold and delivery foundation.
2. Product discovery and requirements.
3. First vertical workflow.
4. Hardening, release, and operations.

## 8. Linked Requirements

Add `REQ-*` entries under `docs/product/requirements/` and link them here.

## 9. Open Questions

- Which product capabilities are in the first vertical slice?
- Which backend APIs, if any, does the first slice require?
- Which locales and regions must the first release support?
