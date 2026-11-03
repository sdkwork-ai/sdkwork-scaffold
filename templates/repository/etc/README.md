# etc

Source-controlled deployment and runtime profiles for `sdkwork-__APP_CODE__`.

`etc/` is the concrete environment/runtime configuration authority. The app manifest declares identity only; it must not contain environment domains, ports, SDK Base URLs, bind addresses, database targets, or secrets.

## Current State

The scaffold initializes client surfaces only. Add typed topology profiles here when an API runtime, database, or deployable service is introduced:

- `etc/topology/standalone.development.env`
- `etc/topology/cloud.development.env`
- `etc/sdkwork.deployment.config.json`

These profiles currently carry profile identity only. Add service URLs, bind addresses, database targets, and secret references here when the corresponding runtime is introduced.

Follow `__SPECS_REL__/SOURCE_CONFIG_SPEC.md`, `__SPECS_REL__/CONFIG_SPEC.md`, `__SPECS_REL__/ENVIRONMENT_SPEC.md`, and `__SPECS_REL__/DEPLOYMENT_SPEC.md`.

## Rules

- Never commit secrets. Commit secret-file references only.
- Keep environment values out of `agent.app.config.json`.
- Use profile ids `<deployment-profile>.<environment>` with `standalone|cloud` and `development|test|staging|demo|production`.
