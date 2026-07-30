# 宣誓爱业务组件库文档

> **版本：** 1.0.0  
> **更新日期：** 2026-07-21  
> **组件总数：** 5 个

---

## 组件列表

### 1. XsaUserCard — 用户卡片

**使用场景**：首页推荐列表、搜索结果、访客记录

#### 使用示例

```vue
<template>
  <!-- 标准模式 -->
  <XsaUserCard
    :user="userData"
    :show-actions="true"
    @click="handleUserClick"
    @like="handleLike"
    @chat="handleChat"
  />

  <!-- 紧凑模式 -->
  <XsaUserCard
    :user="userData"
    :compact="true"
    :max-tags="2"
    @click="handleUserClick"
  />
</template>

<script setup>
const userData = {
  id: 1,
  avatar: '/static/avatar.jpg',
  name: '张小美',
  age: 26,
  gender: 2,
  online: true,
  certifications: ['实名认证', '学历认证'],
  tags: ['爱好旅行', '喜欢美食', '温柔体贴'],
  location: '北京·朝阳区',
  introduction: '热爱生活，喜欢旅行和美食。'
};
</script>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `user` | `User` | — | 用户数据对象（必填） |
| `compact` | `boolean` | `false` | 紧凑模式（不显示标签和介绍） |
| `showActions` | `boolean` | `true` | 是否显示操作按钮 |
| `maxTags` | `number` | `3` | 最多显示多少个标签 |

**User 类型定义**：
```typescript
interface User {
  id: number;
  avatar: string;
  name: string;
  age: number;
  gender: number; // 1-男 2-女
  online?: boolean;
  certifications?: string[];
  tags?: string[];
  location?: string;
  introduction?: string;
}
```

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `user: User` | 点击卡片时触发 |
| `like` | `userId: number` | 点击喜欢按钮时触发 |
| `chat` | `userId: number` | 点击打招呼按钮时触发 |

---

### 2. XsaPhotoGrid — 相册网格

**使用场景**：用户详情、编辑资料、发布动态

#### 使用示例

```vue
<template>
  <!-- 只读模式（用户详情） -->
  <XsaPhotoGrid
    :photos="photoList"
    @preview="handlePreview"
  />

  <!-- 编辑模式（编辑资料） -->
  <XsaPhotoGrid
    :photos="photoList"
    :editable="true"
    :max-count="9"
    @add="handleAddPhoto"
    @delete="handleDeletePhoto"
  />

  <!-- 自定义列数 -->
  <XsaPhotoGrid
    :photos="photoList"
    :columns="4"
  />
</template>

<script setup>
const photoList = ref([
  '/static/photo1.jpg',
  '/static/photo2.jpg',
  '/static/photo3.jpg',
]);

const handleAddPhoto = () => {
  uni.chooseImage({
    count: 9 - photoList.value.length,
    success: (res) => {
      photoList.value.push(...res.tempFilePaths);
    }
  });
};

const handleDeletePhoto = (index) => {
  photoList.value.splice(index, 1);
};
</script>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `photos` | `string[]` | — | 图片URL数组（必填） |
| `editable` | `boolean` | `false` | 是否可编辑 |
| `maxCount` | `number` | `9` | 最多可上传数量 |
| `columns` | `number` | `3` | 每行显示列数 |
| `addText` | `string` | `'添加图片'` | 添加按钮文字 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `add` | — | 点击添加按钮时触发 |
| `delete` | `index: number` | 点击删除按钮时触发 |
| `preview` | `index: number` | 点击图片时触发 |

---

### 3. XsaEmpty — 空状态

**使用场景**：所有列表页面的空状态展示

#### 使用示例

```vue
<template>
  <!-- 默认空状态 -->
  <XsaEmpty />

  <!-- 自定义文字 -->
  <XsaEmpty
    text="暂无消息"
    description="还没有人给你发消息哦"
  />

  <!-- 带操作按钮 -->
  <XsaEmpty
    type="noData"
    :show-action="true"
    action-text="刷新"
    @action="handleRefresh"
  />

  <!-- 预设类型 -->
  <XsaEmpty type="noNetwork" size="large" />
  <XsaEmpty type="noPermission" />

  <!-- 自定义图标 -->
  <XsaEmpty
    icon="💔"
    text="还没有人喜欢你"
    description="完善资料可以获得更多曝光"
    :show-action="true"
    action-text="完善资料"
  />
</template>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | — | 空状态图标（emoji） |
| `text` | `string` | — | 提示文字 |
| `description` | `string` | — | 描述文字 |
| `showAction` | `boolean` | `false` | 是否显示操作按钮 |
| `actionText` | `string` | `'刷新'` | 操作按钮文字 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸 |
| `type` | `'default' \| 'noData' \| 'noNetwork' \| 'noPermission'` | `'default'` | 预设类型 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `action` | — | 点击操作按钮时触发 |

---

### 4. XsaMessageItem — 消息列表项

**使用场景**：消息列表页面

#### 使用示例

```vue
<template>
  <view class="message-list">
    <XsaMessageItem
      v-for="msg in messageList"
      :key="msg.id"
      :message="msg"
      @click="handleMessageClick"
    />
  </view>
</template>

<script setup>
const messageList = ref([
  {
    id: 1,
    avatar: '/static/avatar1.jpg',
    name: '张小美',
    lastMessage: '你好，很高兴认识你',
    time: Date.now() - 5 * 60 * 1000, // 5分钟前
    unreadCount: 3,
    online: true,
    messageType: 'text'
  },
  {
    id: 2,
    avatar: '/static/avatar2.jpg',
    name: '李明',
    lastMessage: '[图片]',
    time: '昨天',
    unreadCount: 0,
    online: false,
    messageType: 'image'
  }
]);

const handleMessageClick = (message) => {
  uni.navigateTo({
    url: `/pagesSub/chat/detail?userId=${message.id}`
  });
};
</script>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `Message` | — | 消息数据对象（必填） |

**Message 类型定义**：
```typescript
interface Message {
  id: number;
  avatar: string;
  name: string;
  lastMessage: string;
  time: string | number; // 时间戳或字符串
  unreadCount?: number;
  online?: boolean;
  messageType?: 'text' | 'image' | 'voice';
}
```

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `message: Message` | 点击消息项时触发 |

---

### 5. XsaDynamicCard — 动态卡片

**使用场景**：社区动态列表

#### 使用示例

```vue
<template>
  <view class="dynamic-list">
    <XsaDynamicCard
      v-for="item in dynamicList"
      :key="item.id"
      :dynamic="item"
      @user-click="handleUserClick"
      @like="handleLike"
      @comment="handleComment"
      @share="handleShare"
      @more="handleMore"
    />
  </view>
</template>

<script setup>
const dynamicList = ref([
  {
    id: 1,
    user: {
      id: 1,
      avatar: '/static/avatar.jpg',
      name: '张小美'
    },
    content: '今天天气真好，出门逛街啦～',
    photos: [
      '/static/photo1.jpg',
      '/static/photo2.jpg',
      '/static/photo3.jpg'
    ],
    location: '北京·朝阳区',
    time: '2小时前',
    likeCount: 25,
    commentCount: 8,
    liked: false
  }
]);

const handleLike = (dynamicId) => {
  // 调用点赞接口
};

const handleComment = (dynamicId) => {
  // 跳转到评论页
};
</script>
```

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dynamic` | `Dynamic` | — | 动态数据对象（必填） |

**Dynamic 类型定义**：
```typescript
interface Dynamic {
  id: number;
  user: {
    id: number;
    avatar: string;
    name: string;
  };
  content?: string;
  photos?: string[];
  location?: string;
  time: string;
  likeCount: number;
  commentCount: number;
  liked?: boolean;
}
```

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `userClick` | `userId: number` | 点击用户信息时触发 |
| `photoClick` | `index: number` | 点击图片时触发 |
| `like` | `dynamicId: number` | 点击点赞时触发 |
| `comment` | `dynamicId: number` | 点击评论时触发 |
| `share` | `dynamicId: number` | 点击分享时触发 |
| `more` | `dynamicId: number` | 点击更多操作时触发 |

---

## 组件总览

| 组件 | 说明 | 使用场景 | 状态 |
|------|------|----------|------|
| **XsaUserCard** | 用户卡片 | 首页推荐、搜索结果 | ✅ |
| **XsaPhotoGrid** | 相册网格 | 用户详情、编辑资料 | ✅ |
| **XsaEmpty** | 空状态 | 所有列表页面 | ✅ |
| **XsaMessageItem** | 消息列表项 | 消息列表 | ✅ |
| **XsaDynamicCard** | 动态卡片 | 社区动态列表 | ✅ |

---

## 设计规范

所有业务组件严格遵循基础组件库的设计规范：

- 使用 CSS 变量（`var(--accent)`, `var(--surface)` 等）
- 统一的圆角、间距、字体
- 流畅的过渡动画（0.18s ~ 0.22s）
- 移动端触摸优化

---

**文档维护者：** 宣誓爱前端团队  
**最后更新：** 2026-07-21 00:34  
**组件总数：** 5 个
