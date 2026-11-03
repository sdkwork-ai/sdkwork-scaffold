# Repository Specs

This directory owns repository/application-wide machine contracts that span modules. It does not replace global standards.

- `component.spec.json` — application-level component contract.
- `topology.spec.json` — runtime topology, when an API/runtime is added.

Module-local specs live beside each module under `<module-root>/specs/`. Follow `__SPECS_REL__/COMPONENT_SPEC.md`.

Do not copy `*_SPEC.md` bodies into this repository.
