<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useModule, useSystem } from './hooks/solver-gcs-provide-context'
import { useConstraint } from './hooks/geometry-derived'
// import { Vector3 } from './core/gl-math'
let props = defineProps({
  constraint: { required: true, type: Object },
  index: { required: true, type: Number },
})
/*
 * 全局hooks
 */
//数据对象
const constraint = useConstraint(props.constraint.id)
//实体对象
const Module = useModule()
const system = useSystem()
/*
 * 操作
 */
//新增
onMounted(() => {
  let { type, args } = constraint
  let [p1, p2, distance, tag, driving] = args
  system[type](...args)
  //这里只负责设置constraint fn
  /*
   * 1、如何获取点的值
   * 2、如何将求解的值返回给ref
   */
})
// //更新实体
// watch(
//   arcPoints,
//   (arcPoints) => {
//     let [center, start, end] = arcPoints
//     arcsEntitie.update(
//       props.index,
//       [center.x, center.y, center.z],
//       [start.x, start.y, start.z],
//       [end.x, end.y, end.z],
//       plane.value.normal,
//       arc.value.ccw,
//     )
//   },
//   { deep: true },
// )
// //删除
// onUnmounted(() => {
//   arcsEntitie.remove(props.index)
// })
</script>
<template></template>
