import { ComponentRegistry, IntegratedComponent } from '../composition/ComponentRegistry';

@Entry
@Component
struct Index {
  private components: IntegratedComponent[] = ComponentRegistry.components;

  build() {
    Column({ space: 14 }) {
      Text('SDKWORK APPLICATION FOUNDATION')
        .fontSize(11)
        .fontWeight(FontWeight.Bold)
        .fontColor('#B8F26B')
        .width('100%')

      Text('__APP_NAME__')
        .fontSize(36)
        .fontWeight(FontWeight.Bold)
        .fontColor('#D7FF9E')
        .width('100%')

      Text('Native HarmonyOS surface initialized with SDKWork component composition.')
        .fontSize(15)
        .fontColor('#A7B4AC')
        .width('100%')

      Text('Integrated components')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor('#F4F7F2')
        .width('100%')
        .margin({ top: 14 })

      if (this.components.length === 0) {
        Text('No common component is enabled for this application.')
          .fontSize(14)
          .fontColor('#A7B4AC')
          .width('100%')
      } else {
        List({ space: 10 }) {
          ForEach(this.components, (component: IntegratedComponent) => {
            ListItem() {
              Column({ space: 4 }) {
                Text(component.title)
                  .fontSize(16)
                  .fontWeight(FontWeight.Medium)
                  .fontColor('#F4F7F2')
                  .width('100%')
                Text(component.supported ? (component.sdkPackage.length > 0 ? component.sdkPackage : component.mode) : component.reason)
                  .fontSize(12)
                  .fontColor(component.supported ? '#B8F26B' : '#E6C67D')
                  .width('100%')
              }
              .padding(14)
              .backgroundColor('#102019')
              .borderRadius(14)
              .width('100%')
            }
          }, (component: IntegratedComponent) => component.id)
        }
        .width('100%')
        .layoutWeight(1)
      }

      Text('sdkwork-__APP_CODE__')
        .fontSize(11)
        .fontColor('#718078')
        .width('100%')
    }
    .padding(24)
    .width('100%')
    .height('100%')
    .backgroundColor('#08110F')
  }
}
