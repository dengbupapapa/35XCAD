<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useLines as useLinesEntitie } from './hooks/viewport-provide-context'
import { useLinePoints as useLinePointsGeometryDerived } from './hooks/geometry-derived'
let props = defineProps({
  line: { required: true, type: Object },
  index: { required: true, type: Number },
})
/*
 * 全局hooks
 */
//数据对象
const linePoints = useLinePointsGeometryDerived(props.line.id)
//实体对象
const linesEntitie = useLinesEntitie()
/*
 * 操作
 */
//新增
onMounted(() => {
  let [start, end] = linePoints.value
  linesEntitie.add([start.x, start.y, start.z], [end.x, end.y, end.z])
})
//更新实体
watch(
  linePoints,
  (linePoints) => {
    let [start, end] = linePoints
    // if (!start || !end) return
    linesEntitie.translation(props.index, [start.x, start.y, start.z], [end.x, end.y, end.z])
  },
  { deep: true },
)
//删除
onUnmounted(() => {
  linesEntitie.remove(props.index)
})
</script>
<template></template>
