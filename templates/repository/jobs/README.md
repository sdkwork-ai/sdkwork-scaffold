# jobs

Scheduled jobs, queue bindings, batch descriptors, maintenance runbooks, and non-Rust job packages.

No job is defined at scaffold time. Rust worker implementations belong under `crates/sdkwork-<domain>-<capability>-worker/`; this directory owns the schedule, binding, and operational descriptors.

Follow `__SPECS_REL__/EVENT_SPEC.md` and `__SPECS_REL__/OPERATIONS_SPEC.md`.
