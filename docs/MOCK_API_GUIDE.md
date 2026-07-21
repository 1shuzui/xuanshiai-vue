# Mock 数据与 API 管理说明

## 📁 目录结构

```
xuanshiai-vue/
├── mock/                      # Mock 数据仓库（开发阶段使用）
│   ├── index.uts             # 统一导出入口
│   ├── user.uts              # 用户相关 mock
│   ├── message.uts           # 消息相关 mock
│   ├── community.uts         # 社区相关 mock
│   └── matchmaker.uts        # 红娘相关 mock
│
├── api/                       # API 层（统一数据接口）
│   ├── config.uts            # 配置文件（USE_MOCK 开关）
│   ├── request.uts           # 请求封装（自动切换 mock/真实）
│   ├── index.uts             # 统一导出入口
│   ├── user.uts              # 用户相关 API
│   ├── message.uts           # 消息相关 API
│   ├── community.uts         # 社区相关 API
│   └── matchmaker.uts        # 红娘相关 API
```

---

## 🎯 使用方式

### **在页面中使用（推荐方式）**

```vue
<template>
  <view class="page">
    <view v-if="loading">加载中...</view>
    <view v-else>
      <text>{{ user.name }}</text>
      <text>{{ user.age }} 岁</text>
    </view>
  </view>
</template>

<script setup lang="uts">
// ✅ 从 API 层导入（不直接导入 mock 数据）
import { getRecommendUser } from '@/api'

const user = ref(null)
const loading = ref(true)

// 页面加载时获取数据
onMounted(async () => {
  try {
    const res = await getRecommendUser()
    user.value = res.data
  } catch (error) {
    console.error('获取用户失败', error)
  } finally {
    loading.value = false
  }
})
</script>
```

---

## ⚙️ 环境切换（核心）

### **开发阶段：使用 Mock 数据**

打开 `api/config.uts`，设置：

```typescript
export const USE_MOCK = true  // ✅ 启用 Mock
```

此时所有 API 请求会自动返回 `mock/` 目录下的数据，无需后端接口。

---

### **生产阶段：切换到真实 API**

#### **步骤 1：关闭 Mock**

打开 `api/config.uts`，修改为：

```typescript
export const USE_MOCK = false  // ❌ 禁用 Mock
```

#### **步骤 2：配置 uniCloud**

在同一文件中，填写你的 uniCloud 配置：

```typescript
export const API_CONFIG = {
  cloudFunction: {
    timeout: 60000,
    spaceId: 'your-actual-space-id'  // 替换为真实的 spaceId
  }
}
```

#### **步骤 3：删除 Mock 目录（可选）**

```bash
rm -rf xuanshiai-vue/mock/
```

**完成！所有页面无需修改代码，自动切换到真实 API。**

---

## 🧪 Mock 数据管理

### **修改 Mock 数据**

直接编辑 `mock/` 目录下的对应文件：

- **用户数据** → `mock/user.uts`
- **消息数据** → `mock/message.uts`
- **社区数据** → `mock/community.uts`
- **红娘数据** → `mock/matchmaker.uts`

示例：修改推荐用户的名字

```typescript
// mock/user.uts
export const mockRecommendUsers = [
  {
    id: 1,
    name: '新名字',  // 直接修改这里
    age: 26,
    // ...
  }
]
```

保存后刷新页面，数据立即生效。

---

## 🚀 添加新 API

### **示例：添加"访客记录"功能**

#### **1. 添加 Mock 数据**

在 `mock/user.uts` 中添加：

```typescript
// 访客记录 Mock 数据
export const mockVisitors = [
  {
    id: 1,
    userId: 701,
    name: '张三',
    avatar: '/static/avatars/user701.jpg',
    time: Date.now() - 60 * 60 * 1000
  },
  // ...
]
```

在 `mock/index.uts` 中导出：

```typescript
export { mockVisitors } from './user.uts'
```

#### **2. 添加 API 方法**

在 `api/user.uts` 中添加：

```typescript
import { mockVisitors } from '@/mock'

export async function getVisitors() {
  return request({
    url: '/user/visitors',
    cloudFunctionName: 'user',
    action: 'getVisitors',
    method: 'GET',
    mockData: mockVisitors  // Mock 数据
  })
}
```

在 `api/index.uts` 中导出：

```typescript
export { getVisitors } from './user.uts'
```

#### **3. 在页面中使用**

```vue
<script setup lang="uts">
import { getVisitors } from '@/api'

const visitors = ref([])

onMounted(async () => {
  const res = await getVisitors()
  visitors.value = res.data
})
</script>
```

---

## ⚠️ 注意事项

### **1. 页面中不要直接导入 mock 数据**

❌ **错误写法：**
```typescript
import { mockRecommendUsers } from '@/mock/user.uts'
const user = ref(mockRecommendUsers[0])  // 硬编码，后期难以切换
```

✅ **正确写法：**
```typescript
import { getRecommendUser } from '@/api'
const user = ref(null)
onMounted(async () => {
  const res = await getRecommendUser()
  user.value = res.data  // 通过 API 层获取
})
```

### **2. 静态资源路径**

Mock 数据中的图片路径（如 `/static/avatars/user1.jpg`）需要对应真实文件，否则会显示图片加载失败。

开发阶段可以使用占位图：
```typescript
avatar: 'https://via.placeholder.com/150'  // 临时占位图
```

### **3. 数据结构一致性**

Mock 数据的字段结构必须与真实 API 返回的数据结构一致，这样切换时页面才不会报错。

---

## 📊 数据流向图

```
页面组件
   ↓ (调用 API)
API 层 (api/user.uts)
   ↓
request.uts (判断 USE_MOCK)
   ├─→ USE_MOCK = true  → 返回 mock/ 中的数据
   └─→ USE_MOCK = false → 调用 uniCloud 云函数
```

---

## ✅ 优势总结

| 特性 | 说明 |
|------|------|
| **开发友好** | Mock 数据集中管理，易于调整和查看 |
| **一键切换** | 只需修改一个开关（`USE_MOCK`）即可切换环境 |
| **零改动迁移** | 页面代码无需修改，自动适配真实 API |
| **类型安全** | UTS 类型检查，减少运行时错误 |
| **便于协作** | 前端可独立开发，无需等待后端接口 |

---

## 🔧 常见问题

### **Q: 如何临时测试真实 API？**

修改 `api/config.uts` 中的 `USE_MOCK` 为 `false`，保存后刷新页面。

### **Q: 能否部分 API 用 Mock，部分用真实？**

可以！在 `api/request.uts` 中修改：

```typescript
export async function request(options: any) {
  // 根据 URL 判断是否使用 Mock
  const useMock = USE_MOCK || options.url.includes('/user/')
  
  if (useMock) {
    return mockRequest(options)
  }
  return realRequest(options)
}
```

### **Q: Mock 数据如何模拟加载延迟？**

在 `api/config.uts` 中修改 `MOCK_DELAY` 的值（单位：毫秒）：

```typescript
export const MOCK_DELAY = 1000  // 模拟 1 秒延迟
```

---

**文档版本：** v1.0  
**最后更新：** 2026-07-21  
**维护者：** 宣誓爱前端团队
