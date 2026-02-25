<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { usePoints as usePointsEntitie } from './hooks/viewport-provide-context'
let props = defineProps({
  point: { required: true, type: Object },
  index: { required: true, type: Number },
})
/*
 * 实体对象
 */
const points = usePointsEntitie()
/*
 * 操作
 */
//新增
onMounted(() => {
  let { x, y, z } = props.point
  points.add([x, y, z])
})
//更新实体
watch(
  () => props.point,
  (point) => {
    let { x, y, z } = point
    points.translation(props.index, [x, y, z])
  },
  { deep: true },
)
//删除
onUnmounted(() => {
  points.remove(props.index)
})
</script>
<template></template>
