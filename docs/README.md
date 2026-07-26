# xuanshiai-vue 文档索引

本文档目录只描述当前 UniApp 工程。需求、设计和协作约束均随工程保存，不依赖工作区外的临时文件。

## 必读顺序

1. [`../AGENTS.md`](../AGENTS.md) — 强约束、允许修改范围与验收纪律。
2. [`../PRODUCT.md`](../PRODUCT.md) — 产品定位、功能边界与核心流程。
3. [`../DESIGN.md`](../DESIGN.md) — 设计 Token、组件与视觉规范。
4. [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) — 当前实现状态、已知差异和待确认项。
5. [`DEV_PLAN_HBUILDERX.md`](./DEV_PLAN_HBUILDERX.md) — 下一阶段完整开发计划（HBuilderX / 小程序约束、分阶段与验收）。
6. [`前端开发注意事项.md`](./前端开发注意事项.md) — 日常开发约定。

## 运行与排错

| 文档 | 说明 |
|---|---|
| [`HOW_TO_RUN.md`](./HOW_TO_RUN.md) | npm、HBuilderX、H5 与微信小程序运行方式 |
| [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) | 编译、Mock、uniCloud 提示与缓存问题 |
| [`配置说明.md`](./配置说明.md) | `manifest.json`、`pages.json` 与平台配置现状 |

## 开发专题

| 文档 | 说明 |
|---|---|
| [`DEV_PLAN_HBUILDERX.md`](./DEV_PLAN_HBUILDERX.md) | 下一阶段完整开发文档：P0 壳层/首页 → 主路径 → 会员付费；立刻开工 8 项 |
| [`小程序UI样式注意事项.md`](./小程序UI样式注意事项.md) | 小程序优先的标签、布局、样式与交互规则 |
| [`MOCK_API_GUIDE.md`](./MOCK_API_GUIDE.md) | 当前 Mock/API 结构与真实接口切换前提（含社区话题/活动/纸飞机/通知） |
| [`COMMUNITY_HTTP_CHANGELOG.md`](./COMMUNITY_HTTP_CHANGELOG.md) | 社区 FE↔BE 联调修改记录（双路径 + 审查修复） |
| [`COMMUNITY_ADVERSARIAL_REVIEW.md`](./COMMUNITY_ADVERSARIAL_REVIEW.md) | 社区对抗审查台账与 P0/P1 修复状态 |
| [`Mock使用与退役约定.md`](./Mock使用与退役约定.md) | Mock 分模块退役规则 |
| [`图片上传与包体注意事项.md`](./图片上传与包体注意事项.md) | 图片、上传、静态资源与包体规则 |
| [`开发自检清单.md`](./开发自检清单.md) | 合并或提测前检查清单 |

## 组件文档

- [`../components/README.md`](../components/README.md) — 基础组件。
- [`../components/BUSINESS_COMPONENTS.md`](../components/BUSINESS_COMPONENTS.md) — 业务组件。

## 已退出开发链路的内容

- 历史 XMind 不再是需求源。
- HTML Demo 只作外部视觉参考，不继续迁移或维护。
- 定版 PRD 到位后优先级高于临时功能说明，并应同步更新本目录文档。
