# My Account Capability

Standard application capability: **Me / My account**.

Machine contract: `specs/capabilities/catalog.json` (`id: "me"`).

## Purpose

Give every SDKWork application one predictable account surface for identity,
session, security, and preferences. The capability is IAM-backed; it is not a
product-specific profile page.

## IAM Contract

| Concern | IAM surface |
| --- | --- |
| Current session | `auth.sessions.current.retrieve()` |
| Revoke session | `auth.sessions.current.delete()` |
| Current profile | `iam.users.current.retrieve()` |
| Password | `iam.users.current.password.update()` |
| Email binding | `iam.users.current.emailBindings` |
| Phone binding | `iam.users.current.phoneBindings` |
| Persona | `iam.users.current.persona.retrieve()` |

The web projection is generated at `src/account/iam-account.ts` when the `iam`
component is linked. It consumes `@sdkwork/iam-app-sdk` only; it never builds raw
HTTP calls or manual auth headers.

## States

1. **Authenticated** — session and profile are available.
2. **Anonymous** — no session; the host routes to the IAM login flow.
3. **Unavailable** — IAM is not selected or the runtime is not configured.

The scaffold renders the **Unavailable** state by default because a generated
repository has no runtime endpoint or credentials yet. Do not fake a signed-in
user.

## Required Layout

- Identity block: avatar/initials, display name, account status.
- Facts: application, IAM package, tenant, session source.
- Capability rows: Profile, Session, Security, Preferences.
- No card borders, shadows, or gradients; use the tech-blue tokens.

## Surface Projections

| Surface | Navigation | Projection |
| --- | --- | --- |
| PC / Pad | Left rail `Me` item | `#me` account panel |
| H5 | Bottom tab `Me` | `#me` account panel |
| Flutter | `NavigationBar` `Me` destination | `_meTab` |
| iOS | `TabView` `Me` tab | `MeTab` |
| Android | `NavigationBar` `Me` item | `MeScreen` |
| HarmonyOS | `Tabs` `Me` tab | `Me()` builder |
| Mini program | Fixed bottom tab `Me` | `activeTab === 'me'` |

## Invariants

- Account state is never invented in the shell; it comes from IAM or is shown as unavailable.
- Sign-out revokes the IAM session before clearing local state.
- Tenant and organization context come from the authenticated session.
- Credentials and tokens stay in the global token manager, never in component configuration.
