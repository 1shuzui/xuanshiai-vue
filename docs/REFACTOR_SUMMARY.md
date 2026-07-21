# Mock 数据重构总结报告

**项目：** 宣誓爱婚恋小程序  
**任务：** 将所有页面的 mock 数据提取到 API 层  
**完成时间：** 2026-07-21  

---

## ✅ 已完成的重构

### **1. 首页 (pages/index/index.uvue)**

**重构内容：**
- ✅ 提取推荐用户数据 (`currentUser`)
- ✅ 提取广场用户列表数据 (`squareUsers`)

**改动说明：**
- 硬编码的推荐用户对象 → 改为 `ref(null)`，通过 `getRecommendUser()` 获取
- 硬编码的广场用户数组 → 改为 `ref([])`，通过 `getSquareUsers()` 获取
- 所有交互方法（跳过、喜欢、申请认识）改为调用真实 API
- 添加了 `onMounted()` 钩子自动加载数据

**API 调用：**
```typescript
import { getRecommendUser, getSquareUsers, likeUser, applyToMeet } from '@/api'
```

---

### **2. 消息页 (pages/message/message.uvue)**

**重构内容：**
- ✅ 提取聊天列表数据 (`messageList`)

**改动说明：**
- 硬编码的 4 条消息记录 → 改为 `ref([])`，通过 `getMessageList()` 获取
- 添加了加载状态处理
- 添加了 `onMounted()` 钩子自动加载数据

**API 调用：**
```typescript
import { getMessageList } from '@/api'
```

---

### **3. 社区页 (pages/community/community.uvue)**

**重构内容：**
- ✅ 提取动态列表数据 (`dynamicList`)

**改动说明：**
- 硬编码的 4 条动态记录 → 改为 `ref([])`，通过 `getDynamicList()` 获取
- 点赞功能改为调用真实 API (`likeDynamic`)
- Tab 切换时重新加载对应数据
- 添加了本地状态更新逻辑（点赞后立即更新点赞数）

**API 调用：**
```typescript
import { getDynamicList, likeDynamic } from '@/api'
```

---

### **4. 牵线页 (pages/matchmaker/matchmaker.uvue)**

**重构内容：**
- ✅ 提取红娘数据 (`myMatchmaker`)
- ✅ 提取推荐列表数据 (`recommendList`)
- ✅ 提取线下活动数据 (`activityList`)

**改动说明：**
- 硬编码的红娘对象 → 改为 `ref(null)`，通过 `getServiceMatchmakers()` 获取
- 硬编码的推荐列表 → 改为 `ref([])`，通过 `getAiRecommendations()` 获取
- 硬编码的活动列表 → 改为 `ref([])`，通过 `getActivities()` 获取
- 添加了数据格式转换逻辑（API 返回格式 → 页面展示格式）

**API 调用：**
```typescript
import { getServiceMatchmakers, getAiRecommendations, getActivities } from '@/api'
```

---

### **5. 聊天详情页 (pages/chat/detail.uvue)**

**重构内容：**
- ✅ 提取聊天消息数据 (`messages`)

**改动说明：**
- 硬编码的 2 条消息记录 → 改为 `ref([])`，通过 `getChatMessages()` 获取
- 发送消息功能改为调用真实 API (`sendMessage`)
- 添加了从 URL 参数获取 `userId` 的逻辑
- 添加了时间格式化函数

**API 调用：**
```typescript
import { getChatMessages, sendMessage as sendMessageApi } from '@/api'
```

---

## 📊 重构统计

| 页面 | Mock 数据项 | API 方法 | 状态 |
|------|------------|---------|------|
| **首页** | 2 项（推荐用户、广场用户） | 4 个方法 | ✅ 完成 |
| **消息页** | 1 项（消息列表） | 1 个方法 | ✅ 完成 |
| **社区页** | 1 项（动态列表） | 2 个方法 | ✅ 完成 |
| **牵线页** | 3 项（红娘、推荐、活动） | 3 个方法 | ✅ 完成 |
| **聊天详情页** | 1 项（聊天消息） | 2 个方法 | ✅ 完成 |

**总计：**
- ✅ 重构页面：**5 个**
- ✅ 提取 Mock 数据项：**8 项**
- ✅ 调用 API 方法：**12 个**

---

## 📝 未重构的页面

以下页面**不需要重构**或**暂不处理**：

### **个人中心页 (pages/profile/profile.uvue)**
- **原因：** 显示的是当前登录用户的信息
- **建议：** 后续应从用户状态管理（如 Pinia/Vuex）或本地存储获取
- **不适合从 API 层获取：** 用户信息应该在登录时获取并缓存

### **登录/注册页 (pages/auth/*.uvue)**
- **原因：** 无 Mock 数据，仅包含表单输入

### **用户编辑页 (pages/user/edit.uvue)**
- **原因：** 编辑当前用户资料，数据来自 profile 页面传递

### **其他功能页面**
- `pages/profile/settings.uvue` - 设置页，无列表数据
- `pages/profile/certification.uvue` - 认证页，无列表数据
- `pages/profile/vip.uvue` - 会员页，无列表数据
- `pages/community/publish.uvue` - 发布页，无列表数据
- `pages/user/detail.uvue` - 用户详情页，数据从 URL 参数获取

---

## 🎯 重构前后对比

### **重构前（硬编码）**

```vue
<script setup lang="uts">
const currentUser = ref({
  name: '苏晚晴',
  age: 26,
  city: '杭州',
  // ... 硬编码数据
})

const squareUsers = ref([
  { id: 1, name: '林雨桐', age: 28, /* ... */ },
  { id: 2, name: '陈知夏', age: 27, /* ... */ },
  // ... 更多硬编码
])
</script>
```

**问题：**
- ❌ 数据分散在各个页面
- ❌ 后期接入真实 API 需要逐个页面修改
- ❌ Mock 数据难以统一管理和复用

---

### **重构后（API 层）**

```vue
<script setup lang="uts">
import { getRecommendUser, getSquareUsers } from '@/api'

const currentUser = ref(null)
const squareUsers = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  const res = await getRecommendUser()
  currentUser.value = res.data
  
  const res2 = await getSquareUsers({ page: 1, limit: 10 })
  squareUsers.value = res2.data
  loading.value = false
})
</script>
```

**优势：**
- ✅ 数据来源统一，易于管理
- ✅ 自动适配 Mock/真实 API（通过 `USE_MOCK` 开关）
- ✅ 错误处理更规范
- ✅ 支持真实的异步加载状态

---

## 🚀 如何使用

### **开发阶段（使用 Mock 数据）**

1. 确保 `api/config.uts` 中设置：
```typescript
export const USE_MOCK = true
```

2. 运行项目：
```bash
npm run dev:h5
# 或
npm run dev:mp-weixin
```

3. 页面会自动从 `mock/` 目录加载数据

4. 需要调整 Mock 数据？直接编辑对应文件：
   - `mock/user.uts` - 用户数据
   - `mock/message.uts` - 消息数据
   - `mock/community.uts` - 社区数据
   - `mock/matchmaker.uts` - 红娘数据

---

### **生产阶段（切换到真实 API）**

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

4. 重新运行项目：
```bash
npm run build:h5
# 或
npm run build:mp-weixin
```

**完成！所有页面自动切换到真实 API，无需修改任何页面代码。**

---

## 📁 文件结构

```
xuanshiai-vue/
├── mock/                          # Mock 数据仓库
│   ├── index.uts                 ✅ 统一导出
│   ├── user.uts                  ✅ 用户 Mock
│   ├── message.uts               ✅ 消息 Mock
│   ├── community.uts             ✅ 社区 Mock
│   └── matchmaker.uts            ✅ 红娘 Mock
│
├── api/                           # API 层
│   ├── config.uts                ✅ 配置（USE_MOCK 开关）
│   ├── request.uts               ✅ 请求封装
│   ├── index.uts                 ✅ 统一导出
│   ├── user.uts                  ✅ 用户 API
│   ├── message.uts               ✅ 消息 API
│   ├── community.uts             ✅ 社区 API
│   └── matchmaker.uts            ✅ 红娘 API
│
├── pages/                         # 页面（已重构）
│   ├── index/index.uvue          ✅ 首页
│   ├── message/message.uvue      ✅ 消息页
│   ├── community/community.uvue  ✅ 社区页
│   ├── matchmaker/matchmaker.uvue ✅ 牵线页
│   └── chat/detail.uvue          ✅ 聊天详情页
│
└── docs/                          # 文档
    ├── MOCK_API_GUIDE.md         ✅ Mock 数据使用指南
    ├── REFACTOR_EXAMPLE.md       ✅ 重构示例
    └── REFACTOR_SUMMARY.md       ✅ 本文档
```

---

## ⚠️ 注意事项

### **1. 数据结构一致性**

Mock 数据的字段必须与真实 API 返回的数据结构一致。如果字段名不一致，需要在 API 层做映射：

```typescript
// api/user.uts
export async function getRecommendUser() {
  const res = await request({...})
  
  // 字段映射
  return {
    ...res,
    data: {
      id: res.data.user_id,           // user_id → id
      name: res.data.nickname,        // nickname → name
      avatar: res.data.avatar_url,    // avatar_url → avatar
      match: res.data.match_score     // match_score → match
    }
  }
}
```

### **2. 图片路径问题**

Mock 数据中的图片路径需要是有效的：
- 开发阶段：使用 `/static/` 下的占位图
- 生产阶段：使用真实的 CDN 地址

临时方案：
```typescript
avatar: 'https://via.placeholder.com/150'  // 使用占位图服务
```

### **3. 时间格式转换**

Mock 数据中使用 `Date.now()` 生成时间戳，页面需要格式化显示：

```typescript
// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
```

---

## 🎉 总结

### **已完成的工作**

✅ **搭建完整的 Mock 数据管理系统**
- Mock 数据仓库（4 个文件）
- API 统一接口层（7 个文件）
- 完整文档（3 个文档）

✅ **重构 5 个核心页面**
- 首页、消息页、社区页、牵线页、聊天详情页
- 提取 8 项 Mock 数据
- 调用 12 个 API 方法

✅ **实现一键切换**
- 开发阶段使用 Mock 数据
- 生产阶段切换到真实 API
- 页面代码零改动

### **现在你可以**

1. ✅ **专注前端开发** - 使用 Mock 数据快速迭代
2. ✅ **随时调整数据** - 编辑 `mock/*.uts` 文件即可
3. ✅ **无缝切换 API** - 改一行配置就完成切换
4. ✅ **直接删除 Mock** - 上线时删除 `mock/` 文件夹

---

**任务完成！🎊**

所有核心页面的 mock 数据已成功提取到 API 层，现在可以通过修改 `api/config.uts` 中的 `USE_MOCK` 开关，一键切换 Mock 数据和真实 API。

---

**维护者：** 宣誓爱前端团队  
**文档版本：** v1.0  
**最后更新：** 2026-07-21
