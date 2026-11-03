# deployments

Infrastructure descriptors, packaging handoff files, installers, rollout/rollback assets, and deployment documentation.

No deployment artifact is defined at scaffold time. Browser surfaces currently produce static artifacts under `apps/*/dist/<deployment-profile>/<environment>/`.

When a server runtime or container image is added, keep deployment descriptors here and source configuration under `etc/`. Follow `__SPECS_REL__/DEPLOYMENT_SPEC.md`, `__SPECS_REL__/SDKWORK_DEPLOY_SPEC.md`, and `__SPECS_REL__/DOCKER_SPEC.md`.
