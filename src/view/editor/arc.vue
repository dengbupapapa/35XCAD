<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useArcs as useArcsEntitie } from './hooks/viewport-provide-context'
import {
  usePlane as usePlaneGeometryDerived,
  useArcPoints as useArcPointsGeometryDerived,
  useArc as useArcGeometryDerived,
} from './hooks/geometry-derived'
// import { Vector3 } from './core/gl-math'
let props = defineProps({
  arc: { required: true, type: Object },
  index: { required: true, type: Number },
})
/*
 * 全局hooks
 */
//数据对象
const arcPoints = useArcPointsGeometryDerived(props.arc.id)
const arc = useArcGeometryDerived(props.arc.id)
const plane = usePlaneGeometryDerived(arc.value.plane)
//实体对象
const arcsEntitie = useArcsEntitie()
/*
 * 操作
 */
// function centerAndStart2Radius(center, start) {
//   return new Vector3(center.x, center.y, center.z).length(new Vector3(start.x, start.y, start.z))
// }
// function points2angle(a, b) {
//   let dir = new Vector3(b.x, b.y, b.z).sub(new Vector3(a.x, a.y, a.z))
//   return Math.atan2(dir.y, dir.x)
// }
//新增
onMounted(() => {
  let [center, start, end] = arcPoints.value
  // let radius = centerAndStart2Radius(center, start)
  // let angleStart = points2angle(center, start)
  // let angleEnd = points2angle(center, end)
  arcsEntitie.add(
    [center.x, center.y, center.z],
    [start.x, start.y, start.z],
    [end.x, end.y, end.z],
    plane.value.normal,
    arc.value.ccw,
  )
})
//更新实体
watch(
  arcPoints,
  (arcPoints) => {
    let [center, start, end] = arcPoints
    arcsEntitie.translation(
      props.index,
      [center.x, center.y, center.z],
      [start.x, start.y, start.z],
      [end.x, end.y, end.z],
      plane.value.normal,
      arc.value.ccw,
    )
  },
  { deep: true },
)
//删除
onUnmounted(() => {
  arcsEntitie.remove(props.index)
})
</script>
<template></template>
