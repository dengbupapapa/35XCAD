<template>
  <a-dropdown :trigger="['contextmenu']">
    <div
      @click="onClick"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
      ref="button"
      style="padding: 0 5px"
      :style="{
        backgroundColor: selected ? '#b8e0ff' : 'rgba(0, 0, 0, 0)',
      }"
    >
      <slot></slot>
    </div>
    <template #overlay>
      <div class="contextmenu top">
        <div class="display">
          <EyeInvisibleTwoTone v-if="visibled" @click="onHidden" :title="labelBasicMap['hidden']" />
          <EyeTwoTone v-else @click="onVisible" :title="labelBasicMap['visible']" />
        </div>
        <SidebarFeaturePlaneMakeFront :id="id" />
      </div>
      <!-- <a-menu @click="onMenuClick">
        <a-menu-item key="delete">删除</a-menu-item>
      </a-menu> -->
    </template>
  </a-dropdown>
</template>
<script setup>
import { onMounted, onUnmounted, useTemplateRef, ref, watch, computed } from 'vue'
import { EyeInvisibleTwoTone, EyeTwoTone } from '@ant-design/icons-vue'
import { usePlanes as usePlanesGeometryManager } from './hooks/geometry-manager'
import { usePlanes as usePlanesGeometryQuery } from './hooks/geometry-query'
import { usePlane as usePlaneGeometryDerived } from './hooks/geometry-derived'
import SidebarFeaturePlaneMakeFront from './sidebar-feature-plane-make-front.vue'
import { labelBasicMap } from './locales/zh-CN/displayMap.js'
let props = defineProps({ id: { type: String, required: true } })

let planesGeometryManager = usePlanesGeometryManager()
let planesGeometryQuery = usePlanesGeometryQuery()
let planeGeometryDerived = usePlaneGeometryDerived(props.id)
//hover
let hover = ref(false)
function onMouseenter() {
  hover.value = true
}
function onMouseleave() {
  hover.value = false
}
//selected
let selected = ref(false)
let buttonRef = useTemplateRef('button')
function onClick() {
  selected.value = true
}
function onClickOutside(event) {
  if (buttonRef.value && !buttonRef.value.contains(event.target)) {
    selected.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
//visibled
let visibled = ref(true)
function onVisible() {
  visibled.value = true
}
function onHidden() {
  visibled.value = false
}
watch(
  planeGeometryDerived,
  (plane) => {
    visibled.value = plane.visible
  },
  { immediate: true },
)
//handle
watch(
  () => [hover.value, selected.value, visibled.value],
  ([hover, selected, visibled]) => {
    if (hover || selected || visibled) {
      planesGeometryManager.visible(0)
    } else {
      planesGeometryManager.hidden(0)
    }
  },
  { immediate: true },
)
</script>
<style scoped lang="less">
.contextmenu {
  &.top {
    display: flex;
    align-items: center;
    background-color: #fff;
    box-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
    padding: 10px 10px;
    > * {
      padding: 0 10px;
    }
  }
}
</style>
