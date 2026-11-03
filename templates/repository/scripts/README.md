# scripts

Thin command entrypoints for build, verification, generation, migration, packaging, and release workflows.

The standard public command surface is defined in the root `package.json`. `scripts/sdkwork-command.mjs` is the single local implementation for browser-surface development, build, test, check, verify, stop, and clean.

Rules:

- Public script names follow `__SPECS_REL__/PNPM_SCRIPT_SPEC.md`.
- Scripts fail fast with a non-zero exit code.
- `clean` removes only enumerated reproducible build paths; never delete by wildcard or recursive source walk.
- Build and dev runners follow `__SPECS_REL__/CODE_STYLE_SPEC.md` §7.
