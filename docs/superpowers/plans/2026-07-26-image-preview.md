# 社区动态图片全屏预览 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让社区动态图片点击后进入全屏预览，并支持多图左右滑动切换和关闭。

**Architecture:** 在现有 `XsaDynamicCard` 中维护预览显示状态和当前索引，使用 `swiper` 全屏承载当前动态的 `photos`。点击图片只打开组件内预览层，不再依赖 `uni.previewImage`，从而保持 H5 与小程序的交互一致。

**Tech Stack:** UniApp、Vue 3 `<script setup lang="uts">`、`.uvue`、Node.js 静态回归测试。

---

### Task 1: 添加图片预览回归测试

**Files:**
- Modify: `tests/test-community-flow.js`
- Test: `components/XsaDynamicCard.uvue`

- [ ] **Step 1: 写出失败测试**

在现有 `cardClick` 检查附近增加断言，要求动态卡片包含预览状态、全屏预览层、`swiper` 切换和关闭处理：

```js
if (
  cardClick.includes('previewVisible') &&
  cardClick.includes('<swiper') &&
  cardClick.includes('handlePreviewChange') &&
  cardClick.includes('closePreview') &&
  cardClick.includes('position: fixed')
) {
  ok('动态卡支持全屏图片预览和滑动切换')
} else {
  fail('动态卡缺少全屏图片预览或滑动切换')
}
```

- [ ] **Step 2: 运行测试确认它因功能缺失失败**

Run: `node tests/test-community-flow.js`

Expected: 原有检查通过，新增检查输出 `FAIL: 动态卡缺少全屏图片预览或滑动切换`。

### Task 2: 实现组件内全屏预览

**Files:**
- Modify: `components/XsaDynamicCard.uvue`

- [ ] **Step 1: 增加预览层模板**

在卡片根节点内部、正文模板后增加固定预览层：

```vue
<view v-if="previewVisible" class="image-preview" @click="closePreview">
  <view class="preview-toolbar" @click.stop>
    <text class="preview-count" v-if="previewPhotos.length > 1">
      {{ previewIndex + 1 }}/{{ previewPhotos.length }}
    </text>
    <view class="preview-close" @click="closePreview">
      <text>×</text>
    </view>
  </view>
  <swiper
    class="preview-swiper"
    :current="previewIndex"
    :circular="previewPhotos.length > 1"
    @change="handlePreviewChange"
    @click.stop
  >
    <swiper-item v-for="(photo, index) in previewPhotos" :key="index">
      <image class="preview-image" :src="photo" mode="aspectFit"></image>
    </swiper-item>
  </swiper>
</view>
```

- [ ] **Step 2: 增加最小预览状态和处理函数**

在现有 `handlePhotoClick` 附近维护：

```ts
const previewVisible = ref(false)
const previewIndex = ref(0)
const previewPhotos = computed((): string[] => {
  return props.dynamic.photos != null ? (props.dynamic.photos as string[]) : []
})

const handlePhotoClick = (index: number) => {
  if (previewPhotos.value.length == 0) return
  previewIndex.value = Math.max(0, Math.min(index, previewPhotos.value.length - 1))
  previewVisible.value = true
  emit('photoClick', previewIndex.value)
}

const handlePreviewChange = (event: any) => {
  const current = event != null && event.detail != null ? Number(event.detail.current) : 0
  previewIndex.value = Math.max(0, Math.min(current, previewPhotos.value.length - 1))
}

const closePreview = () => {
  previewVisible.value = false
}
```

删除 `handlePhotoClick` 中的 `uni.previewImage` 调用，避免同一次点击同时触发两个预览实现。

- [ ] **Step 3: 增加全屏预览样式**

新增固定定位、黑色背景、居中图片和可点击关闭按钮样式；预览层使用足够高的 `z-index`，不改变卡片原有尺寸。

- [ ] **Step 4: 运行回归测试确认通过**

Run: `node tests/test-community-flow.js`

Expected: 新增检查输出 `动态卡支持全屏图片预览和滑动切换`，进程退出码为 0。

### Task 3: 完成项目级验证

**Files:**
- Verify: `components/XsaDynamicCard.uvue`
- Verify: `tests/test-community-flow.js`

- [ ] **Step 1: 运行相关现有测试**

Run: `node tests/test-community-flow.js`

Expected: 进程退出码为 0，所有社区流程检查通过。

- [ ] **Step 2: 运行 Mock 回归测试**

Run: `node tests/test-mock-system.js`

Expected: 进程退出码为 0。

- [ ] **Step 3: 检查补丁格式**

Run: `git diff --check`

Expected: 无输出且退出码为 0。

- [ ] **Step 4: 尝试 H5 构建**

Run: `npm run build:h5`

Expected: 构建命令退出码为 0；若当前环境缺少 UniApp/HBuilderX 构建依赖，则记录具体错误，不将其误报为通过。
