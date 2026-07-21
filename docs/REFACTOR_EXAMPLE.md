# 页面重构示例：从硬编码到 API 层

本文档展示如何将现有页面的硬编码 mock 数据迁移到新的 API 架构。

---

## 示例 1：首页（index.uvue）重构

### **重构前（硬编码 Mock）**

```vue
<script setup lang="uts">
// ❌ 旧写法：数据直接硬编码在页面中
const currentUser = ref({
  name: '苏晚晴',
  age: 26,
  city: '杭州',
  height: '165cm',
  job: '插画师',
  school: '浙江大学 · 本科',
  mbti: 'INFP',
  match: 92,
  avatar: '/static/logo.png',
  online: '当前在线',
  intro: '喜欢画画、猫和下雨天...'
})

const squareUsers = ref([
  {
    id: 1,
    name: '林雨桐',
    age: 28,
    city: '南京',
    // ... 更多硬编码数据
  }
])
</script>
```

**问题：**
- 数据分散在各个页面，难以统一管理
- 后期接入真实 API 需要逐个页面修改
- Mock 数据难以复用

---

### **重构后（使用 API 层）**

```vue
<script setup lang="uts">
// ✅ 新写法：从 API 层获取数据
import { getRecommendUser, getSquareUsers } from '@/api'

const currentUser = ref(null)
const squareUsers = ref([])
const loading = ref(true)

// 页面加载时获取推荐用户
onMounted(async () => {
  await loadRecommendUser()
  await loadSquareUsers()
})

// 加载推荐用户
const loadRecommendUser = async () => {
  try {
    loading.value = true
    const res = await getRecommendUser()
    currentUser.value = res.data
  } catch (error) {
    console.error('获取推荐用户失败', error)
    showToast('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载广场用户列表
const loadSquareUsers = async () => {
  try {
    const res = await getSquareUsers({ page: 1, limit: 10 })
    squareUsers.value = res.data
  } catch (error) {
    console.error('获取广场用户失败', error)
  }
}

// 跳过当前用户
const handleSkip = async () => {
  showToast('已跳过 · 为你换一位认真嘉宾')
  liked.value = false
  await loadRecommendUser() // 重新加载下一个推荐用户
}

// 喜欢用户
const handleLike = async () => {
  if (!currentUser.value) return
  
  try {
    const res = await likeUser(currentUser.value.id)
    if (res.success) {
      liked.value = !liked.value
      showToast(liked.value ? '已收藏，仅你自己可见' : '已取消收藏')
    }
  } catch (error) {
    showToast('操作失败，请重试')
  }
}

// 申请认识
const handleApply = async () => {
  if (!currentUser.value) return
  
  try {
    const res = await applyToMeet(currentUser.value.id, '你好，很高兴认识你')
    if (res.success) {
      showToast('申请已发送，等待对方回应')
      uni.navigateTo({
        url: `/pages/chat/detail?userId=${currentUser.value.id}`
      })
    }
  } catch (error) {
    showToast('发送失败，请重试')
  }
}
</script>
```

**优势：**
- ✅ 数据来源统一，易于管理
- ✅ 自动适配 Mock/真实 API，无需修改页面代码
- ✅ 错误处理更规范
- ✅ 支持真实的异步加载状态

---

## 示例 2：消息页（message.uvue）重构

### **重构前**

```vue
<script setup lang="uts">
// ❌ 旧写法
const messageList = ref([
  {
    id: 1,
    avatar: '/static/logo.png',
    name: '张小美',
    lastMessage: '你好，很高兴认识你',
    time: Date.now() - 5 * 60 * 1000,
    unreadCount: 3,
    // ...
  }
])
</script>
```

### **重构后**

```vue
<script setup lang="uts">
import { getMessageList } from '@/api'

const messageList = ref([])
const loading = ref(true)

onMounted(async () => {
  await loadMessages()
})

const loadMessages = async () => {
  try {
    loading.value = true
    const res = await getMessageList()
    messageList.value = res.data
  } catch (error) {
    console.error('获取消息列表失败', error)
  } finally {
    loading.value = false
  }
}

// 点击消息项
const handleMessageClick = (message: any) => {
  uni.navigateTo({
    url: `/pages/chat/detail?userId=${message.userId}&userName=${message.name}`
  })
}
</script>
```

---

## 示例 3：社区页（community.uvue）重构

### **重构前**

```vue
<script setup lang="uts">
// ❌ 旧写法
const dynamicList = ref([
  {
    id: 1,
    user: { id: 1, avatar: '/static/logo.png', name: '张小美' },
    content: '今天天气真好...',
    // ...
  }
])
</script>
```

### **重构后**

```vue
<script setup lang="uts">
import { getDynamicList, likeDynamic } from '@/api'

const currentTab = ref(0)
const dynamicList = ref([])
const loading = ref(false)
const hasMore = ref(true)

// 切换 Tab
const switchTab = async (tab: number) => {
  currentTab.value = tab
  await loadDynamics()
}

// 加载动态列表
const loadDynamics = async () => {
  try {
    loading.value = true
    const res = await getDynamicList(currentTab.value, 1)
    dynamicList.value = res.data
  } catch (error) {
    console.error('获取动态列表失败', error)
  } finally {
    loading.value = false
  }
}

// 点赞动态
const handleLike = async (dynamicId: number) => {
  try {
    const res = await likeDynamic(dynamicId)
    if (res.success) {
      // 更新本地状态
      const item = dynamicList.value.find(d => d.id === dynamicId)
      if (item) {
        item.liked = !item.liked
        item.likeCount += item.liked ? 1 : -1
      }
    }
  } catch (error) {
    console.error('点赞失败', error)
  }
}

onMounted(() => {
  loadDynamics()
})
</script>
```

---

## 重构清单

### **需要修改的文件**

- [ ] `pages/index/index.uvue` - 首页
- [ ] `pages/message/message.uvue` - 消息页
- [ ] `pages/community/community.uvue` - 社区页
- [ ] `pages/matchmaker/matchmaker.uvue` - 牵线页
- [ ] `pages/user/detail.uvue` - 用户详情页
- [ ] `pages/chat/detail.uvue` - 聊天详情页

### **重构步骤**

1. **导入 API 方法**
   ```typescript
   import { getRecommendUser, getSquareUsers } from '@/api'
   ```

2. **修改数据初始化**
   ```typescript
   // 从硬编码改为 null 或空数组
   const currentUser = ref(null)
   const squareUsers = ref([])
   ```

3. **添加加载函数**
   ```typescript
   const loadData = async () => {
     const res = await getRecommendUser()
     currentUser.value = res.data
   }
   ```

4. **在 onMounted 中调用**
   ```typescript
   onMounted(() => {
     loadData()
   })
   ```

5. **修改事件处理函数**
   ```typescript
   const handleLike = async () => {
     const res = await likeUser(userId)
     // 处理响应
   }
   ```

---

## 数据结构对照表

### **用户数据**

| Mock 字段 | 类型 | 说明 | 真实 API 字段 |
|-----------|------|------|---------------|
| `id` | `number` | 用户 ID | `user_id` |
| `name` | `string` | 用户名 | `nickname` |
| `age` | `number` | 年龄 | `age` |
| `avatar` | `string` | 头像 URL | `avatar_url` |
| `city` | `string` | 城市 | `city` |
| `match` | `number` | 匹配度 | `match_score` |

如果字段名不一致，在 API 层做转换：

```typescript
// api/user.uts
export async function getRecommendUser() {
  const res = await request({...})
  
  // 字段映射
  return {
    ...res,
    data: {
      id: res.data.user_id,
      name: res.data.nickname,
      avatar: res.data.avatar_url,
      match: res.data.match_score
    }
  }
}
```

---

## 常见问题

### **Q: 重构后图片加载失败怎么办？**

Mock 数据中的图片路径需要替换为真实路径或占位图：

```typescript
// mock/user.uts
avatar: 'https://via.placeholder.com/150'  // 使用占位图
```

### **Q: 如何处理分页加载？**

```typescript
const page = ref(1)
const hasMore = ref(true)

const loadMore = async () => {
  if (!hasMore.value) return
  
  page.value++
  const res = await getSquareUsers({ page: page.value, limit: 10 })
  
  if (res.data.length === 0) {
    hasMore.value = false
  } else {
    squareUsers.value.push(...res.data)
  }
}
```

### **Q: 如何处理加载状态？**

在模板中添加骨架屏或加载提示：

```vue
<template>
  <view v-if="loading" class="loading">
    <text>加载中...</text>
  </view>
  <view v-else>
    <!-- 实际内容 -->
  </view>
</template>
```

---

**文档版本：** v1.0  
**最后更新：** 2026-07-21
