# Mock 数据管理完整方案

## 📦 已创建的文件结构

```
xuanshiai-vue/
├── mock/                           # Mock 数据仓库（开发阶段）
│   ├── index.uts                  # ✅ 统一导出入口
│   ├── user.uts                   # ✅ 用户相关 mock（推荐、广场、详情）
│   ├── message.uts                # ✅ 消息相关 mock（聊天、申请）
│   ├── community.uts              # ✅ 社区相关 mock（动态、话题、活动）
│   └── matchmaker.uts             # ✅ 红娘相关 mock（服务、热心、AI）
│
├── api/                            # API 统一接口层
│   ├── config.uts                 # ✅ 配置文件（USE_MOCK 开关）
│   ├── request.uts                # ✅ 请求封装（自动切换 mock/真实）
│   ├── index.uts                  # ✅ 统一导出
│   ├── user.uts                   # ✅ 用户 API
│   ├── message.uts                # ✅ 消息 API
│   ├── community.uts              # ✅ 社区 API
│   └── matchmaker.uts             # ✅ 红娘 API
│
└── docs/                           # 文档
    ├── MOCK_API_GUIDE.md          # ✅ Mock 数据使用指南
    └── REFACTOR_EXAMPLE.md        # ✅ 页面重构示例
```

---

## 🎯 核心优势

### 1. **一键切换环境**

只需修改 `api/config.uts` 中的一个开关：

```typescript
// 开发阶段：使用 Mock 数据
export const USE_MOCK = true

// 生产阶段：使用真实 API
export const USE_MOCK = false
```

### 2. **零改动迁移**

页面代码无需修改，自动适配：

```vue
<script setup lang="uts">
// 这行代码在 Mock 和真实 API 下都能正常工作
import { getRecommendUser } from '@/api'

const user = ref(null)
onMounted(async () => {
  const res = await getRecommendUser()
  user.value = res.data  // 自动返回 Mock 或真实数据
})
</script>
```

### 3. **集中管理 Mock 数据**

所有 Mock 数据在 `mock/` 目录统一管理：

- **便于查看** - 一目了然所有测试数据
- **便于修改** - 修改一处，所有引用处生效
- **便于删除** - 上线时直接删除 `mock/` 文件夹

### 4. **类型安全**

UTS 语言提供类型检查，减少运行时错误：

```typescript
// 如果 API 返回的数据结构不匹配，会在开发阶段就发现
const user = ref<User>(null)
```

---

## 🚀 快速开始

### **步骤 1：在页面中使用**

```vue
<template>
  <view class="page">
    <!-- 加载状态 -->
    <view v-if="loading">加载中...</view>
    
    <!-- 数据展示 -->
    <view v-else>
      <text>{{ user.name }}</text>
      <text>{{ user.age }} 岁</text>
    </view>
  </view>
</template>

<script setup lang="uts">
// 从 API 层导入（不直接导入 mock）
import { getRecommendUser } from '@/api'

const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  const res = await getRecommendUser()
  user.value = res.data
  loading.value = false
})
</script>
```

### **步骤 2：开发阶段调整 Mock 数据**

编辑 `mock/user.uts`：

```typescript
export const mockRecommendUsers = [
  {
    id: 1,
    name: '新名字',  // 直接修改
    age: 26,
    // ...
  }
]
```

保存后刷新页面，数据立即生效。

### **步骤 3：生产阶段切换到真实 API**

1. 修改 `api/config.uts`：
   ```typescript
   export const USE_MOCK = false  // 关闭 Mock
   ```

2. 配置 uniCloud：
   ```typescript
   export const API_CONFIG = {
     cloudFunction: {
       spaceId: 'your-real-space-id'  // 填入真实的 spaceId
     }
   }
   ```

3. （可选）删除 Mock 目录：
   ```bash
   rm -rf xuanshiai-vue/mock/
   ```

完成！所有页面自动切换到真实 API，无需修改任何页面代码。

---

## 📚 详细文档

### **1. Mock 数据使用指南**

文件：`docs/MOCK_API_GUIDE.md`

内容包括：
- 目录结构说明
- 使用方式
- 环境切换方法
- Mock 数据管理
- 添加新 API
- 常见问题

### **2. 页面重构示例**

文件：`docs/REFACTOR_EXAMPLE.md`

内容包括：
- 重构前后对比
- 首页重构示例
- 消息页重构示例
- 社区页重构示例
- 重构清单
- 数据结构对照表

---

## 🔧 下一步行动

### **选项 A：立即重构现有页面**

我可以帮你重构以下页面：
- `pages/index/index.uvue` - 首页
- `pages/message/message.uvue` - 消息页
- `pages/community/community.uvue` - 社区页

### **选项 B：继续开发新功能**

保持现有页面不动，新功能直接使用 API 层。

### **选项 C：先测试 Mock 系统**

创建一个简单的测试页面，验证 Mock 系统是否正常工作。

---

## ⚡ Mock 数据内容概览

### **用户相关（mock/user.uts）**

- `mockRecommendUsers` - 3 个推荐用户（含详细资料）
- `mockSquareUsers` - 4 个广场用户（简化信息）
- `mockUserDetail` - 1 个用户详情（完整档案）

### **消息相关（mock/message.uts）**

- `mockMessageList` - 4 条聊天记录
- `mockChatMessages` - 4 条聊天详情
- `mockApplications` - 3 条申请消息

### **社区相关（mock/community.uts）**

- `mockDynamicList` - 3 条动态
- `mockTopics` - 3 个话题
- `mockPaperPlanes` - 3 条纸飞机
- `mockActivities` - 3 个线下活动

### **红娘相关（mock/matchmaker.uts）**

- `mockServiceMatchmakers` - 3 位服务红娘
- `mockVolunteerMatchmakers` - 3 位热心红娘
- `mockAiRecommendations` - 2 条 AI 推荐
- `mockCustomPackages` - 3 个套餐

---

## ✅ 优势总结

| 特性 | 说明 |
|------|------|
| **开发友好** | Mock 数据集中管理，随时调整 |
| **一键切换** | 只需修改一个开关即可切换环境 |
| **零改动迁移** | 页面代码无需修改 |
| **类型安全** | UTS 类型检查，减少错误 |
| **便于协作** | 前端独立开发，无需等待后端 |
| **易于维护** | 数据结构清晰，便于理解 |

---

## 💡 最佳实践

### ✅ 推荐做法

```vue
<!-- ✅ 正确：通过 API 层获取数据 -->
<script setup lang="uts">
import { getRecommendUser } from '@/api'

const user = ref(null)
onMounted(async () => {
  const res = await getRecommendUser()
  user.value = res.data
})
</script>
```

### ❌ 不推荐做法

```vue
<!-- ❌ 错误：直接导入 mock 数据 -->
<script setup lang="uts">
import { mockRecommendUsers } from '@/mock/user.uts'

const user = ref(mockRecommendUsers[0])  // 硬编码，后期难以切换
</script>
```

---

## 🎉 总结

现在你有了一套**完整的 Mock 数据管理系统**：

1. ✅ **Mock 数据仓库** - 所有测试数据集中在 `mock/` 目录
2. ✅ **API 统一接口** - 所有数据请求通过 `api/` 层
3. ✅ **一键切换** - 通过 `USE_MOCK` 开关控制
4. ✅ **完整文档** - 使用指南和重构示例
5. ✅ **零改动迁移** - 后期切换无需修改页面代码

**现在你可以：**
- 专注于前端页面开发，使用 Mock 数据快速迭代
- 随时调整 Mock 数据查看效果
- 后期一键切换到真实 API，无需逐个页面修改

---

**需要我帮你重构现有页面吗？或者继续开发其他功能？** 😊
