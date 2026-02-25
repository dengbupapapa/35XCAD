<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { usePlanes } from './hooks/viewport-provide-context'
let props = defineProps({
  plane: { required: true, type: Object },
  index: { required: true, type: Number },
})
/*
 * 实体对象
 */
const planes = usePlanes()
/*
 * 操作
 */
//新增
onMounted(() => {
  let { normal, constant } = props.plane
  planes.add(normal, constant)
})
//更新实体
watch(
  () => props.plane.visible,
  (visible) => {
    if (visible) {
      planes.visible(props.index)
      return
    }
    planes.hidden(props.index)
  },
)
watch(
  () => props.plane.active,
  (active) => {
    if (active) {
      planes.active = props.index
    }
  },
)
//删除
onUnmounted(() => {
  planes.remove(props.index)
})
</script>
<template></template>
