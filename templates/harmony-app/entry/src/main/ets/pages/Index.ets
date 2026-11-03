import { ComponentRegistry, IntegratedComponent } from '../composition/ComponentRegistry';

@Entry
@Component
struct Index {
  private components: IntegratedComponent[] = ComponentRegistry.components;
  private linkedCount: number = this.components.filter((component: IntegratedComponent) => component.supported).length;
  private plannedCount: number = this.components.length - this.linkedCount;

  build() {
    Column() {
      Row() {
        Text('__APP_NAME__')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#0A1324')
        Blank()
        Text('HarmonyOS')
          .fontSize(11)
          .fontWeight(FontWeight.Medium)
          .fontColor('#0747C9')
      }
      .width('100%')
      .padding({ top: 14, bottom: 10 })

      Text('SDKWORK APPLICATION FOUNDATION')
        .fontSize(10)
        .fontWeight(FontWeight.Bold)
        .fontColor('#0A5CFF')
        .letterSpacing(1.2)
        .width('100%')

      Text('__APP_DESCRIPTION__')
        .fontSize(13)
        .fontColor('#5A6B85')
        .lineHeight(20)
        .width('100%')
        .margin({ top: 6 })

      Row({ space: 10 }) {
        this.StatTile('Components', `${this.components.length}`)
        this.StatTile('Linked', `${this.linkedCount}`)
        this.StatTile('Plan', `${this.plannedCount}`)
      }
      .width('100%')
      .margin({ top: 16, bottom: 12 })

      Column() {
        Text('Foundation status')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#0A1324')
          .width('100%')
        Text('The initial delivery boundary is visible and explicit.')
          .fontSize(12)
          .fontColor('#5A6B85')
          .width('100%')
          .margin({ top: 4, bottom: 12 })
        this.StatusRow('Repository baseline', 'Canon, identity, workspace metadata, and root layout', 'Ready', true)
        this.StatusRow('Architecture surface', 'ArkTS/ArkUI root with component registry', 'Ready', true)
        this.StatusRow('First vertical workflow', 'Requirements, API contracts, and package modules', 'Next', false)
      }
      .padding(18)
      .backgroundColor('#FFFFFF')
      .borderRadius(14)
      .width('100%')

      Column() {
        Text('Integrated components')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#0A1324')
          .width('100%')
        Text(`${this.linkedCount} linked · ${this.plannedCount} planned`)
          .fontSize(12)
          .fontColor('#5A6B85')
          .width('100%')
          .margin({ top: 4, bottom: 12 })

        if (this.components.length === 0) {
          Text('No common component is enabled for this application.')
            .fontSize(12)
            .fontColor('#5A6B85')
            .width('100%')
        } else {
          List({ space: 8 }) {
            ForEach(this.components, (component: IntegratedComponent) => {
              ListItem() {
                Row({ space: 10 }) {
                  Text(component.id.slice(0, 2).toUpperCase())
                    .fontSize(10)
                    .fontWeight(FontWeight.Bold)
                    .fontColor('#FFFFFF')
                    .width(32)
                    .height(32)
                    .textAlign(TextAlign.Center)
                    .backgroundColor('#0A5CFF')
                    .borderRadius(9)
                  Column({ space: 2 }) {
                    Text(component.title)
                      .fontSize(14)
                      .fontWeight(FontWeight.Medium)
                      .fontColor('#0A1324')
                      .width('100%')
                    Text(component.supported ? (component.sdkPackage.length > 0 ? component.sdkPackage : component.mode) : component.reason)
                      .fontSize(11)
                      .fontColor(component.supported ? '#0747C9' : '#B26A00')
                      .maxLines(2)
                      .width('100%')
                  }
                  .layoutWeight(1)
                  .alignItems(HorizontalAlign.Start)

                  Text(component.supported ? 'Linked' : 'Plan')
                    .fontSize(10)
                    .fontWeight(FontWeight.Medium)
                    .fontColor(component.supported ? '#0E9F6E' : '#B26A00')
                    .padding({ left: 8, right: 8, top: 3, bottom: 3 })
                    .backgroundColor(component.supported ? '#E3F7EF' : '#FFF4E0')
                    .borderRadius(999)
                }
                .padding(12)
                .backgroundColor('#E6EDF8')
                .borderRadius(10)
                .width('100%')
              }
            }, (component: IntegratedComponent) => component.id)
          }
          .width('100%')
        }
      }
      .padding(18)
      .backgroundColor('#FFFFFF')
      .borderRadius(14)
      .width('100%')
      .margin({ top: 12 })

      Column() {
        Text('RECOMMENDED NEXT MOVE')
          .fontSize(10)
          .fontWeight(FontWeight.Bold)
          .fontColor('#0A5CFF')
          .width('100%')
        Text('Write the requirement before the screen.')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#0A1324')
          .width('100%')
          .margin({ top: 6 })
        Text('Capture the first workflow in docs/product/prd/PRD.md, record the boundary decision, then add API, SDK, and package work.')
          .fontSize(12)
          .fontColor('#5A6B85')
          .lineHeight(19)
          .width('100%')
          .margin({ top: 6 })
      }
      .padding(18)
      .backgroundColor('#E7EFFF')
      .borderRadius(14)
      .width('100%')
      .margin({ top: 12 })

      Text('sdkwork-__APP_CODE__ · HarmonyOS')
        .fontSize(10)
        .fontColor('#5A6B85')
        .width('100%')
        .margin({ top: 18, bottom: 20 })
    }
    .padding({ left: 16, right: 16 })
    .width('100%')
    .height('100%')
    .backgroundColor('#F2F5FA')
  }

  @Builder
  StatTile(label: string, value: string) {
    Column({ space: 4 }) {
      Text(label.toUpperCase())
        .fontSize(10)
        .fontWeight(FontWeight.Medium)
        .fontColor('#5A6B85')
        .width('100%')
      Text(value)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor('#0A1324')
        .width('100%')
    }
    .layoutWeight(1)
    .padding(12)
    .backgroundColor('#E6EDF8')
    .borderRadius(10)
  }

  @Builder
  StatusRow(title: string, subtitle: string, status: string, ready: boolean) {
    Row({ space: 8 }) {
      Column({ space: 2 }) {
        Text(title)
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#0A1324')
          .width('100%')
        Text(subtitle)
          .fontSize(11)
          .fontColor('#5A6B85')
          .width('100%')
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      Text(status)
        .fontSize(10)
        .fontWeight(FontWeight.Medium)
        .fontColor(ready ? '#0E9F6E' : '#B26A00')
        .padding({ left: 8, right: 8, top: 3, bottom: 3 })
        .backgroundColor(ready ? '#E3F7EF' : '#FFF4E0')
        .borderRadius(999)
    }
    .padding(12)
    .backgroundColor('#E6EDF8')
    .borderRadius(10)
    .width('100%')
    .margin({ bottom: 8 })
  }
}
