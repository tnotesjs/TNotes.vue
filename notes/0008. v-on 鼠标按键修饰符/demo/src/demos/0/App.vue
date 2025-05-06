<template>
  <div class="box" @click.left="_ => console.log('点击了鼠标左键')">1</div>
  <div class="box" @click.middle="_ => console.log('点击了鼠标中键')">2</div>
  <div class="box" @click.right="_ => console.log('点击了鼠标中键')">3</div>

  <!-- 阻止右键菜单的默认行为 -->
  <div class="box" @click.right.prevent="_ => console.log('点击了鼠标右键，阻止弹出默认的右键菜单')">4</div>
  <div class="box" @contextmenu.prevent="_ => console.log('点击了鼠标右键，阻止弹出默认的右键菜单')">5</div>
  <!--
  @contextmenu.prevent 这么写将阻止右键菜单弹出的默认行为
    contextmenu 表示右键菜单事件
    .prenvent 表示阻止默认事件

    这种写法跟上述的 @click.right.prevent 效果是类似的。
    相同点：
    1. 都不会弹出右键菜单
    2. 都会触发点右键点击事件
  -->
</template>

<style scoped>
.box {
  display: inline-block;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  color: white;
  background-color: red;
  margin: 10px;
}
</style>