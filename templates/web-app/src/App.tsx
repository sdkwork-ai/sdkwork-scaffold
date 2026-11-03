import { integratedComponents } from './composition/components';

const surface = '__SURFACE__';
const surfaceTitle = '__SURFACE_TITLE__';
const architectureRoots = __ARCHITECTURE_ROOTS_JSON__;
const deploymentProfile = import.meta.env.VITE_SDKWORK_DEPLOYMENT_PROFILE
  ?? import.meta.env.MODE;

type FoundationStep = {
  readonly title: string;
  readonly body: string;
  readonly state: 'ready' | 'pending';
};

const steps: readonly FoundationStep[] = [
  {
    title: 'Repository baseline',
    body: 'Canon documentation, application identity, workspace metadata, and the standard root directory dictionary are in place.',
    state: 'ready',
  },
  {
    title: 'Architecture surfaces',
    body: 'Web, tablet, native, Flutter, and mini-program roots share one product identity while keeping independent architecture roots.',
    state: 'ready',
  },
  {
    title: 'First vertical workflow',
    body: 'Add requirements, API contracts, generated SDKs, and package-level feature modules before building product screens.',
    state: 'pending',
  },
];

export default function App() {
  const linked = integratedComponents.filter((component) => component.supported).length;
  const planned = integratedComponents.length - linked;

  return (
    <div className="scaffold-app" data-surface={surface}>
      <aside className="scaffold-rail">
        <a className="scaffold-rail-brand" href="#overview" aria-label="__APP_NAME__ home">
          __APP_INITIALS__
        </a>
        <nav className="scaffold-rail-nav" aria-label="Application sections">
          <a className="scaffold-rail-item" href="#overview" aria-current="page">
            <span className="scaffold-rail-icon" aria-hidden="true">◫</span>
            <span>Overview</span>
          </a>
          <a className="scaffold-rail-item" href="#surfaces">
            <span className="scaffold-rail-icon" aria-hidden="true">▤</span>
            <span>Surfaces</span>
          </a>
          <a className="scaffold-rail-item" href="#components">
            <span className="scaffold-rail-icon" aria-hidden="true">◇</span>
            <span>Components</span>
          </a>
        </nav>
        <div className="scaffold-rail-footer">
          <span className="scaffold-rail-meta">{deploymentProfile}</span>
          <code>pnpm dev</code>
        </div>
      </aside>

      <main className="scaffold-main">
        <header className="scaffold-page-header">
          <div>
            <p className="scaffold-eyebrow">SDKWork application foundation</p>
            <h1 className="scaffold-page-title">__APP_NAME__</h1>
            <p className="scaffold-page-subtitle">
              __APP_DESCRIPTION__
            </p>
          </div>
          <div className="scaffold-header-actions">
            <a className="scaffold-button" data-tone="primary" href="#components">Review components</a>
            <span className="scaffold-surface-chip">{surfaceTitle} surface</span>
          </div>
        </header>

        <section className="scaffold-overview" id="overview" aria-label="Foundation overview">
          <article className="scaffold-stat">
            <span className="scaffold-stat-label">Architectures</span>
            <strong className="scaffold-stat-value">{architectureRoots.length}</strong>
          </article>
          <article className="scaffold-stat">
            <span className="scaffold-stat-label">Components</span>
            <strong className="scaffold-stat-value">{integratedComponents.length}</strong>
          </article>
          <article className="scaffold-stat">
            <span className="scaffold-stat-label">Linked SDKs</span>
            <strong className="scaffold-stat-value">{linked}</strong>
          </article>
          <article className="scaffold-stat">
            <span className="scaffold-stat-label">Profile</span>
            <strong className="scaffold-stat-value scaffold-stat-value-small">{deploymentProfile}</strong>
          </article>
        </section>

        <section className="scaffold-panel" aria-labelledby="foundation-title">
          <div className="scaffold-panel-head">
            <div>
              <h2 className="scaffold-panel-title" id="foundation-title">Foundation status</h2>
              <p className="scaffold-panel-subtitle">The initial delivery boundary is visible and explicit.</p>
            </div>
            <span className="scaffold-badge" data-status="ok">Ready</span>
          </div>
          <div className="scaffold-step-grid">
            {steps.map((step, index) => (
              <article className="scaffold-step" key={step.title}>
                <span className={`scaffold-step-index ${step.state}`}>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <span className="scaffold-badge" data-status={step.state === 'ready' ? 'ok' : 'warn'}>
                  {step.state === 'ready' ? 'Ready' : 'Next'}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="scaffold-panel" id="surfaces" aria-labelledby="surfaces-title">
          <div className="scaffold-panel-head">
            <div>
              <h2 className="scaffold-panel-title" id="surfaces-title">Surfaces</h2>
              <p className="scaffold-panel-subtitle">Each architecture keeps its own root, manifest, and toolchain.</p>
            </div>
            <span className="scaffold-badge" data-status="skipped">{architectureRoots.length} roots</span>
          </div>
          <ul className="scaffold-list">
            {architectureRoots.map((architecture) => (
              <li className="scaffold-list-row" key={architecture.id}>
                <span className="scaffold-list-mark" aria-hidden="true">
                  {architecture.id.slice(0, 2).toUpperCase()}
                </span>
                <span className="scaffold-list-copy">
                  <strong>{architecture.id === surface ? `${architecture.title} · current` : architecture.title}</strong>
                  <code>{architecture.root}</code>
                </span>
                <span className="scaffold-list-meta">{architecture.kind}</span>
                <span className="scaffold-badge" data-status={architecture.kind === 'web' ? 'ok' : 'skipped'}>
                  {architecture.kind === 'web' ? 'Buildable' : 'Toolchain'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="scaffold-panel" id="components" aria-labelledby="components-title">
          <div className="scaffold-panel-head">
            <div>
              <h2 className="scaffold-panel-title" id="components-title">Component composition</h2>
              <p className="scaffold-panel-subtitle">
                {linked} linked · {planned} planned · resolved from sibling SDK manifests.
              </p>
            </div>
            <span className="scaffold-badge" data-status={planned > 0 ? 'warn' : 'ok'}>
              {planned > 0 ? 'Review plan' : 'All linked'}
            </span>
          </div>
          {integratedComponents.length === 0 ? (
            <p className="scaffold-empty">No common component is enabled for this application.</p>
          ) : (
            <div className="scaffold-component-grid">
              {integratedComponents.map((component) => (
                <article className="scaffold-component" key={component.id}>
                  <div className="scaffold-component-head">
                    <span className="scaffold-component-mark" aria-hidden="true">
                      {component.id.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="scaffold-badge" data-status={component.supported ? 'ok' : 'warn'}>
                      {component.supported ? 'Linked' : 'Plan'}
                    </span>
                  </div>
                  <h3>{component.title}</h3>
                  <p>{component.description}</p>
                  <code>{component.sdkPackage ?? `${component.repo} runtime`}</code>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="scaffold-callout" aria-label="Next step">
          <div>
            <p className="scaffold-eyebrow">Recommended next move</p>
            <h2>Write the requirement before the screen.</h2>
          </div>
          <p>
            Capture the first workflow in <code>docs/product/prd/PRD.md</code>, record the boundary
            decision, then add API, SDK, and package work through the owning architecture standard.
          </p>
        </section>

        <footer className="scaffold-footer">
          <span>sdkwork-__APP_CODE__ · {surfaceTitle}</span>
          <span>Generated __GENERATED_DATE__</span>
        </footer>
      </main>
    </div>
  );
}
