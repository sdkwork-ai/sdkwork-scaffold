# apis

Author-owned API contracts and materialization inputs.

This directory is intentionally empty at scaffold time. When the application owns HTTP, RPC, or event contracts, add them here by surface:

```text
apis/
  open-api/<domain>/
  app-api/<domain>/
  backend-api/<domain>/
  rpc/
  async/
```

Generated SDK families belong under `sdks/`, never here. Follow `__SPECS_REL__/API_SPEC.md`, `__SPECS_REL__/RPC_SPEC.md`, `__SPECS_REL__/SDK_WORKSPACE_GENERATION_SPEC.md`, and `__SPECS_REL__/WEB_FRAMEWORK_SPEC.md`.
