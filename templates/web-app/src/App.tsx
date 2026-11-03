import { integratedComponents } from './composition/components';

const surface = '__SURFACE__';
const surfaceTitle = '__SURFACE_TITLE__';
const deploymentProfile = import.meta.env.VITE_SDKWORK_DEPLOYMENT_PROFILE
  ?? import.meta.env.MODE;

type FoundationStep = {
  readonly title: string;
  readonly body: string;
  readonly state: 'ready' | 'next';
};

const steps: readonly FoundationStep[] = [
  {
    title: 'Repository baseline',
    body: 'Canon documentation, application identity, workspace metadata, and the standard root directory dictionary are in place.',
    state: 'ready',
  },
  {
    title: 'Browser surfaces',
    body: 'PC and H5 shells share one product identity while keeping independent architecture roots and package manifests.',
    state: 'ready',
  },
  {
    title: 'First vertical workflow',
    body: 'Add requirements, API contracts, generated SDKs, and package-level feature modules before building product screens.',
    state: 'next',
  },
];

export default function App() {
  return (
    <div className="app" data-sdkwork-app-ready data-surface={surface}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="/" aria-label="__APP_NAME__ home">
          <span className="brand-mark" aria-hidden="true">__APP_INITIALS__</span>
          <span className="brand-name">__APP_NAME__</span>
        </a>
        <div className="surface-pill">
          <span className="status-dot" aria-hidden="true" />
          {surfaceTitle} surface
        </div>
      </header>

      <main id="main" className="main">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">SDKWork application foundation</p>
          <h1 id="hero-title">
            A clean start for
            <span> __APP_NAME__.</span>
          </h1>
          <p className="lede">
            __APP_DESCRIPTION__
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#foundation">Explore the foundation</a>
            <code className="command">pnpm dev</code>
          </div>
          <dl className="facts" aria-label="Application facts">
            <div>
              <dt>Application</dt>
              <dd>sdkwork-__APP_CODE__</dd>
            </div>
            <div>
              <dt>Domain</dt>
              <dd>__APP_DOMAIN__</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{deploymentProfile}</dd>
            </div>
          </dl>
        </section>

        <section className="foundation" id="foundation" aria-labelledby="foundation-title">
          <div className="section-heading">
            <p className="eyebrow">Initialized scope</p>
            <h2 id="foundation-title">A thin shell with explicit next steps.</h2>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <article className="step" key={step.title}>
                <span className={`step-index ${step.state}`}>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <span className={`step-state ${step.state}`}>
                  {step.state === 'ready' ? 'Ready' : 'Next'}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="components" aria-labelledby="components-title">
          <div className="section-heading">
            <p className="eyebrow">Composition</p>
            <h2 id="components-title">Shared capabilities, resolved per surface.</h2>
          </div>
          {integratedComponents.length === 0 ? (
            <p className="empty-state">No common component is enabled for this application.</p>
          ) : (
            <div className="component-grid">
              {integratedComponents.map((component) => (
                <article className="component-card" key={component.id}>
                  <div className="component-heading">
                    <span className="component-mark" aria-hidden="true">
                      {component.id.slice(0, 2).toUpperCase()}
                    </span>
                    <span className={`component-state ${component.supported ? 'ready' : 'planned'}`}>
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

        <section className="next" aria-labelledby="next-title">
          <div>
            <p className="eyebrow">Recommended next move</p>
            <h2 id="next-title">Write the requirement before the screen.</h2>
          </div>
          <p>
            Capture the first workflow in <code>docs/product/prd/PRD.md</code>, record the
            boundary decision, then add API, SDK, and package work through the owning
            architecture standard.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>sdkwork-__APP_CODE__ · __SURFACE_TITLE__</span>
        <span>Generated __GENERATED_DATE__</span>
      </footer>
    </div>
  );
}
