<script setup>
import { watch, computed } from 'vue'
import { useTexts as useTextsViewportManager } from './hooks/viewport-manager'
import {
  useTextPoint as useTextPointGeometryDerived,
  useTextPlane as useTextPlaneGeometryDerived,
  useTextLinePoints as useTextLinePointsGeometryDerived,
} from './hooks/geometry-derived'
import { worldCoords2planeCoords } from './utils/simple'
import { Vector2 } from './core/gl-math'
let props = defineProps({
  text: { required: true, type: Object },
})
/*
 * 全局hooks
 */
//数据对象
const textPoint = useTextPointGeometryDerived(props.text.id)
const textPlane = useTextPlaneGeometryDerived(props.text.id)
const textLinePoints = useTextLinePointsGeometryDerived(props.text.id)
const textsViewportManager = useTextsViewportManager()

//更新实体
watch(
  textPoint,
  (textPoint) => {
    if (!textPoint) return
    textsViewportManager.translation(
      props.text.indexs,
      [textPoint.x, textPoint.y, textPoint.z],
      textPlane.value,
    )
  },
  { deep: true, immediate: true },
)
let textLineAngle = computed(() => {
  let [start, end] = textLinePoints.value
  if (!start || !end) return
  let [startU, startV] = worldCoords2planeCoords([start.x, start.y, start.z], textPlane.value)
  let [endU, endV] = worldCoords2planeCoords([end.x, end.y, end.z], textPlane.value)
  let angle = new Vector2(startU, startV).angleTo(new Vector2(endU, endV))
  return angle
})
watch(
  textLineAngle,
  (textLineAngle) => {
    // textsViewportManager.rotation(
    //   props.text.indexs,
    //   textLineAngle,
    //   [textPoint.value.x, textPoint.value.y, textPoint.value.z],
    //   textPlane.value,
    // )
  },
  { immediate: true },
)
</script>
<template></template>
