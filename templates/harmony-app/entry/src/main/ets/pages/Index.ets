import { ArchitectureRegistry, ArchitectureRoot } from '../composition/ArchitectureRegistry';
import { ComponentRegistry, IntegratedComponent } from '../composition/ComponentRegistry';

@Entry
@Component
struct Index {
  private components: IntegratedComponent[] = ComponentRegistry.components;
  private roots: ArchitectureRoot[] = ArchitectureRegistry.roots;
  @State activeIndex: number = 0;

  build() {
    Tabs({ barPosition: BarPosition.End, index: this.activeIndex }) {
      TabContent() {
        this.Overview()
      }
      .tabBar('Overview')

      TabContent() {
        this.Surfaces()
      }
      .tabBar('Surfaces')

      TabContent() {
        this.Components()
      }
      .tabBar('Components')
    }
    .barMode(BarMode.Fixed)
    .barHeight(60)
    .barBackgroundColor('#FFFFFF')
    .backgroundColor('#F2F5FA')
    .width('100%')
    .height('100%')
    .onChange((index: number) => {
      this.activeIndex = index;
    })
  }

  @Builder
  Overview() {
    Scroll() {
      Column({ space: 12 }) {
        this.PageHeader('Overview', '__APP_NAME__', '__APP_DESCRIPTION__')

        Row({ space: 10 }) {
          this.StatTile('Architectures', `${this.roots.length}`)
          this.StatTile('Linked', `${this.components.filter((component: IntegratedComponent) => component.supported).length}`)
          this.StatTile('Plan', `${this.components.filter((component: IntegratedComponent) => !component.supported).length}`)
        }
        .width('100%')

        Column({ space: 4 }) {
          Text('Foundation status')
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#0A1324')
            .width('100%')
          Text('The initial delivery boundary is visible and explicit.')
            .fontSize(12)
            .fontColor('#5A6B85')
            .width('100%')
            .margin({ bottom: 8 })
          this.StatusRow('Repository baseline', 'Canon, identity, workspace metadata, and root layout', 'Ready', true)
          this.StatusRow('Architecture surface', 'ArkTS/ArkUI root with bottom tabs', 'Ready', true)
          this.StatusRow('First vertical workflow', 'Requirements, API contracts, and package modules', 'Next', false)
        }
        .padding(18)
        .backgroundColor('#FFFFFF')
        .borderRadius(14)
        .width('100%')
      }
      .padding(16)
      .width('100%')
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  Surfaces() {
    Scroll() {
      Column({ space: 8 }) {
        this.PageHeader('Surfaces', 'Application surfaces', 'Each architecture keeps its own root, manifest, and toolchain.')

        ForEach(this.roots, (root: ArchitectureRoot) => {
          Row({ space: 10 }) {
            Text(root.id.slice(0, 2).toUpperCase())
              .fontSize(10)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FFFFFF')
              .width(30)
              .height(30)
              .textAlign(TextAlign.Center)
              .backgroundColor('#0A5CFF')
              .borderRadius(9)

            Column({ space: 2 }) {
              Text(root.title)
                .fontSize(14)
                .fontWeight(FontWeight.Medium)
                .fontColor('#0A1324')
                .width('100%')
              Text(root.root)
                .fontSize(11)
                .fontColor('#5A6B85')
                .width('100%')
            }
            .layoutWeight(1)
            .alignItems(HorizontalAlign.Start)

            Text(root.kind)
              .fontSize(10)
              .fontColor('#5A6B85')
          }
          .padding(12)
          .backgroundColor('#E6EDF8')
          .borderRadius(10)
          .width('100%')
        }, (root: ArchitectureRoot) => root.id)
      }
      .padding(16)
      .width('100%')
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  Components() {
    Scroll() {
      Column({ space: 8 }) {
        this.PageHeader(
          'Components',
          'Component composition',
          `${this.components.filter((component: IntegratedComponent) => component.supported).length} linked · ${this.components.filter((component: IntegratedComponent) => !component.supported).length} planned`,
        )

        if (this.components.length === 0) {
          Text('No common component is enabled for this application.')
            .fontSize(12)
            .fontColor('#5A6B85')
            .width('100%')
        } else {
          ForEach(this.components, (component: IntegratedComponent) => {
            Row({ space: 10 }) {
              Text(component.id.slice(0, 2).toUpperCase())
                .fontSize(10)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(30)
                .height(30)
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
          }, (component: IntegratedComponent) => component.id)
        }

        Column({ space: 6 }) {
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
          Text('Capture the first workflow in docs/product/prd/PRD.md, record the boundary decision, then add API, SDK, and package work.')
            .fontSize(12)
            .fontColor('#5A6B85')
            .lineHeight(19)
            .width('100%')
        }
        .padding(18)
        .backgroundColor('#E7EFFF')
        .borderRadius(14)
        .width('100%')
        .margin({ top: 8 })
      }
      .padding(16)
      .width('100%')
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  PageHeader(eyebrow: string, title: string, subtitle: string) {
    Column({ space: 4 }) {
      Text('SDKWORK APPLICATION FOUNDATION')
        .fontSize(10)
        .fontWeight(FontWeight.Bold)
        .fontColor('#0A5CFF')
        .letterSpacing(1.2)
        .width('100%')
      Text(title)
        .fontSize(26)
        .fontWeight(FontWeight.Bold)
        .fontColor('#0A1324')
        .width('100%')
      Text(subtitle)
        .fontSize(13)
        .fontColor('#5A6B85')
        .lineHeight(20)
        .width('100%')
      Text(eyebrow)
        .fontSize(10)
        .fontColor('#5A6B85')
        .width('100%')
    }
    .width('100%')
    .margin({ bottom: 8 })
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
