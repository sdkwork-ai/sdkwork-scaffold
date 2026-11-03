# tests

Cross-package tests, contract tests, integration tests, end-to-end tests, fixtures, and static verification inputs.

`tests/repository-contract.test.mjs` verifies the generated repository contract: required files, JSON validity, app manifest identity, surface package names, and standard root scripts. Run it with:

```bash
pnpm test
```

Follow `__SPECS_REL__/TEST_SPEC.md`.
