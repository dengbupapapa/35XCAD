<template>
  <Cursor
    class="icon"
    :class="{
      actived:
        interactionsManager.enable.entitieSelect && interactionsManager.enable.entitieTranslation,
    }"
  />
  <Line
    class="icon"
    :class="{
      actived: interactionsManager.enable.linesAdd,
    }"
  />
  <Polyline
    class="icon"
    :class="{
      actived: interactionsManager.enable.polylinesAdd,
    }"
  />
  <Arc
    class="icon"
    :class="{
      actived: interactionsManager.enable.arcsAdd,
    }"
  />
  <Point
    class="icon"
    :class="{
      actived: interactionsManager.enable.pointsAdd,
    }"
  />
</template>
<script setup>
import Cursor from './graphbar-cursor.vue'
import Line from './graphbar-line.vue'
import Polyline from './graphbar-polyline.vue'
import Arc from './graphbar-arc.vue'
import Point from './graphbar-point.vue'
import { useRenderer } from './hooks/viewport-provide-context.js'
import useInteractions from './hooks/modes-manager-interactions.js'
import { onMounted, watchEffect } from 'vue'
const interactionsManager = useInteractions()
//鼠标样式控制
let renderer = useRenderer()
let canvas = renderer.element()
watchEffect(() => {
  if (
    interactionsManager.enable.pointsAdd ||
    interactionsManager.enable.linesAdd ||
    interactionsManager.enable.arcsAdd ||
    interactionsManager.enable.polylinesAdd
  ) {
    canvas.style.cursor = 'copy'
  } else if (
    interactionsManager.enable.entitieSelect ||
    interactionsManager.enable.entitieTranslation
  ) {
    canvas.style.cursor = 'default'
  }
})
onMounted(()=>{
  /* [问题]
   * 控制器按中键旋转 加 ctrl 才平移
   */
  interactionsManager.activator.controls()
  interactionsManager.activator.entitieSelect();
  interactionsManager.activator.entitieTranslation();
})
</script>
<style scoped lang="less">
.actived {
  background-color: #e6fffb;
}
.icon {
  outline: none;
}
</style>
