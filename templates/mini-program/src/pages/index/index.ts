import { architectureRoots, type ArchitectureRoot } from '../../composition/architectures';
import { integratedComponents, type IntegratedComponent } from '../../composition/components';

type MiniComponent = IntegratedComponent & { mark: string };
type MiniSurface = ArchitectureRoot & { mark: string };

type PageData = {
  appName: string;
  appCode: string;
  activeTab: string;
  linkedCount: number;
  plannedCount: number;
  components: readonly MiniComponent[];
  surfaces: readonly MiniSurface[];
};

const linkedCount = integratedComponents.filter((component) => component.supported).length;
const components: MiniComponent[] = integratedComponents.map((component) => ({
  ...component,
  mark: component.id.slice(0, 2).toUpperCase(),
}));
const surfaces: MiniSurface[] = architectureRoots.map((root) => ({
  ...root,
  mark: root.id.slice(0, 2).toUpperCase(),
}));

Page({
  data: {
    appName: '__APP_NAME__',
    appCode: 'sdkwork-__APP_CODE__',
    activeTab: 'overview',
    linkedCount,
    plannedCount: integratedComponents.length - linkedCount,
    components,
    surfaces,
  } satisfies PageData,

  switchTab(event: { currentTarget: { dataset: { tab?: string } } }): void {
    const tab = event.currentTarget.dataset.tab;
    if (tab === 'overview' || tab === 'surfaces' || tab === 'components') {
      const page = this as unknown as { setData(data: Partial<PageData>): void };
      page.setData({ activeTab: tab });
    }
  },
});
