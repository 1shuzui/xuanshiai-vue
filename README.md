# 宣誓爱小程序 - 开发指南

## 快速启动

### 在 HBuilderX 中运行

1. 打开 HBuilderX
2. 打开 `xuanshiai-vue` 项目
3. 点击菜单：运行 → 运行到浏览器 → Chrome（或其他浏览器）
4. 项目会自动在浏览器中打开

### 使用命令行运行

```bash
# 进入项目目录
cd xuanshiai-vue

# 安装依赖（首次运行）
npm install

# 启动 H5 开发服务器（浏览器模式）
npm run dev:h5

# 启动微信小程序开发（需要微信开发者工具）
npm run dev:mp-weixin
```

## 项目结构

```
xuanshiai-vue/
├── pages/                  # 页面目录
│   ├── index/             # 首页（推荐/广场）
│   ├── community/         # 社区
│   ├── matchmaker/        # 牵线
│   ├── message/           # 消息
│   └── profile/           # 我的
├── static/                # 静态资源
├── uni_modules/           # uni-app 插件
├── App.uvue              # 应用配置
├── main.uts              # 入口文件
├── pages.json            # 页面路由配置
├── manifest.json         # 应用配置清单
└── uni.scss             # 全局样式变量
```

## 设计规范

已配置的全局样式变量（在 `uni.scss` 中）：

### 色彩
- 主色：`$uni-color-primary: #C4612F`（蜜桃暖橙）
- 背景色：`$uni-bg-color: #F7F4EF`（奶油米）
- 文字色：`$uni-text-color: #1F2421`（深暖棕）

### 圆角
- 小圆角：`$uni-border-radius-sm: 8px`
- 标准圆角：`$uni-border-radius-base: 16px`
- 大圆角：`$uni-border-radius-lg: 24px`
- 胶囊圆角：`$uni-border-radius-pill: 999px`

### 阴影
- 小阴影：`$uni-shadow-sm`
- 标准阴影：`$uni-shadow-base`
- 大阴影：`$uni-shadow-lg`

## 底部导航栏

已配置 5 个 Tab：
1. 首页（推荐/广场模式）
2. 社区（动态/话题/纸飞机）
3. 牵线（红娘服务）
4. 消息（聊天/通知）
5. 我的（个人中心）

## 开发建议

1. **先在浏览器开发**：使用 Chrome DevTools 调试，速度快
2. **组件化开发**：把可复用的 UI 抽成组件
3. **定期测试小程序**：关键功能在微信开发者工具中验证
4. **注意跨端差异**：部分 CSS 和 API 在不同平台有差异

## 下一步

- [ ] 完善首页推荐卡片样式
- [ ] 实现左右滑动切换用户
- [ ] 添加筛选面板
- [ ] 实现社区页面
- [ ] 搭建牵线模块
- [ ] 开发消息和聊天功能
- [ ] 完善个人中心
