# tools

Reusable developer, validation, generation, migration, and operator tools that are not shipped as app runtime code.

Thin command entrypoints belong in `scripts/`. Tools in this directory may be invoked by multiple scripts, CI jobs, or operators.

Follow `__SPECS_REL__/CODE_STYLE_SPEC.md` and, for Node tooling, `__SPECS_REL__/TYPESCRIPT_CODE_SPEC.md`.
