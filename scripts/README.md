# Scripts

Developer-only commands for the scaffold repository.

- `regression-matrix.mjs` — generate every architecture in isolation, run available toolchains, and write `.sdkwork/tmp/scaffold-regression-matrix.json`.

Run:

```bash
pnpm regression
node scripts/regression-matrix.mjs --architectures pc,flutter --components iam,im,agents
```

The matrix removes successful generated projects and keeps failed projects for inspection. It never deletes a path outside its own `_scratch/scaffold-matrix-*` working root.
