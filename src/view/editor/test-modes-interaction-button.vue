<template>
  <div style="display: flex">
    <button
      @click="interactionsManager.activator.controls(!interactionsManager.enable.controls)"
      :style="interactionsManager.enable.controls ? { backgroundColor: '#000', color: '#fff' } : {}"
    >
      启用控制器工具
    </button>
    <button
      @click="onEnableToolSelect"
      :style="
        interactionsManager.enable.entitieSelect && interactionsManager.enable.entitieTranslation
          ? { backgroundColor: '#000', color: '#fff' }
          : {}
      "
    >
      启用选择工具
    </button>
    <button
      @click="interactionsManager.activator.pointsAdd()"
      :style="
        interactionsManager.enable.pointsAdd ? { backgroundColor: '#000', color: '#fff' } : {}
      "
    >
      启用添加点工具
    </button>
    <button
      @click="interactionsManager.activator.linesAdd()"
      :style="interactionsManager.enable.linesAdd ? { backgroundColor: '#000', color: '#fff' } : {}"
    >
      启用添加线工具
    </button>
    <button
      @click="interactionsManager.activator.polylinesAdd()"
      :style="
        interactionsManager.enable.polylinesAdd ? { backgroundColor: '#000', color: '#fff' } : {}
      "
    >
      启用添加折线工具
    </button>
    <button
      @click="interactionsManager.activator.arcsAdd()"
      :style="interactionsManager.enable.arcsAdd ? { backgroundColor: '#000', color: '#fff' } : {}"
    >
      启用添加圆弧工具
    </button>
  </div>
</template>
<script setup>
import { watchEffect } from 'vue'
import { useRenderer } from './hooks/viewport-provide-context.js'
import useInteractions from './hooks/modes-manager-interactions.js'
const interactionsManager = useInteractions()
function onEnableToolSelect() {
  interactionsManager.activator.entitieSelect()
  interactionsManager.activator.entitieTranslation()
}
//默认启用
// interactionsManager.activator.entitieSelect()
// interactionsManager.activator.entitieTranslation()
interactionsManager.activator.controls()

//鼠标样式控制
let renderer = useRenderer()
let canvas = renderer.element()
watchEffect(() => {
  if (interactionsManager.enable.pointsAdd || interactionsManager.enable.linesAdd) {
    canvas.style.cursor = 'copy'
  } else if (
    interactionsManager.enable.entitieSelect ||
    interactionsManager.enable.entitieTranslation
  ) {
    canvas.style.cursor = 'default'
  }
})
</script>
<style></style>
