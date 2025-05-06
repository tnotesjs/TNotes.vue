<template>
  <div>
    <Card>
      <!-- 中间的内容就会被放入到插槽里面 -->
      <template v-slot:header>我的卡片标题</template>
      这是卡片的内容
    </Card>

    <Card>
      <!-- <template v-slot:header>我的卡片标题</template> -->
      这是卡片的内容
    </Card>

    <Card>
      <template v-slot:header>探险摄影</template>
      <div class="card-content">
        <img :src="imgSrc" class="card-image" />
        <p>探索未知的自然风光，记录下每一个令人惊叹的瞬间。加入我们的旅程，一起见证世界的壮丽。</p>
      </div>
    </Card>
  </div>

</template>

<script setup>
import Card from './Card.vue'
import imgSrc from '../../assets/landscape.jpeg'
</script>

<style scoped>
.card-image {
  width: 100%; /* 让图片宽度充满卡片 */
  height: auto; /* 保持图片的原始宽高比 */
  border-bottom: 1px solid #ececec; /* 在图片和文本之间添加一条分隔线 */
}
</style>