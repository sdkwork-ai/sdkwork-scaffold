import { integratedComponents, type IntegratedComponent } from '../../composition/components';

type PageData = {
  appName: string;
  appCode: string;
  components: readonly IntegratedComponent[];
};

Page({
  data: {
    appName: '__APP_NAME__',
    appCode: 'sdkwork-__APP_CODE__',
    components: integratedComponents,
  } satisfies PageData,
});
