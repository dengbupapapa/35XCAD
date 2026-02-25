<template>
  <div ref="viewport" style="width: 100%; height: 100%">
    <points />
    <!-- <planes /> -->
    <lines />
    <arcs />
  </div>
</template>
<script setup>
import { useTemplateRef, watch } from 'vue'
import ResizeObserver from 'resize-observer-polyfill'
// import Planes from './planes.vue'
import Points from './points.vue'
import Lines from './lines.vue'
import Arcs from './arcs.vue'
import {
  useCamera,
  useScene,
  useRenderer,
  useRaycaster,
  usePlanes as usePlanesEntitie,
  usePoints as usePointsEntitie,
  useLines as useLinesEntitie,
  useArcs as useArcsEntitie,
} from './hooks/viewport-provide-context.js'
import {
  // useSelectPointClick,
  useAddPointClick,
  // useRemovePointClick,
  useAddLineClick,
  useAddPolylineClick,
  useAddArcClick,
  // useMovePointClick,
  // useMoveLineClick,
  useSelect,
  useMove,
  useControls,
} from './hooks/viewport-behavior'
import {
  usePointsHash,
  useLinesHash,
  usePoints as usePointsGeometry,
  useLines as useLinesGeometry,
} from './hooks/geometry-derived'

const elViewport = useTemplateRef('viewport')

/*
 * 初始化gl
 */
const camera = useCamera()
const scene = useScene()
const renderer = useRenderer()
const planesEntitie = usePlanesEntitie()
const pointsEntitie = usePointsEntitie()
const linesEntitie = useLinesEntitie()
const arcsEntitie = useArcsEntitie()

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 0.0)
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera)
})
scene.add(planesEntitie)
scene.add(pointsEntitie)
scene.add(linesEntitie)
scene.add(arcsEntitie)

//元素变化
watch(elViewport, (element) => {
  if (element) {
    renderer.appendTo(element)
    ro.observe(element)
  }
})
//元素大小变化
const ro = new ResizeObserver((entries, observer) => {
  for (const entry of entries) {
    let { width, height } = entry.contentRect
    renderer.setSize(width, height)
    camera.setSize(width, height)
    pointsEntitie.resolution = [width, height]
    linesEntitie.resolution = [width, height]
    arcsEntitie.resolution = [width, height]
  }
})

// //默认平面
// let planesManager = usePlanesManager()
// onMounted(() => {
//   planesManager.add([0, 0, 1], 0)
//   setTimeout(() => {
//     planesManager.active(0)
//     planesManager.visible(0)
//   })
// })

/*
 * 全局射线添加数据
 */
let raycaster = useRaycaster()
let pointsHash = usePointsHash()
let linesHash = useLinesHash()
let pointsGeometry = usePointsGeometry()
let linesGeometry = useLinesGeometry()
raycaster.setPointsHash(pointsHash.value)
raycaster.setLinesHash(linesHash.value)
raycaster.setPointsGeometry(pointsGeometry.value)
raycaster.setLinesGeometry(linesGeometry.value)

// //测试arc
// import { Arc } from './core/gl-entitie'
// scene.add(
//   new Arc({
//     ccw: 1,
//     center: [0.2632720470315659, 0.8756992799450405, 0],
//     start: [-0.5966536051471865, -0.3473664154486844, 0],
//     end: [-0.5966536051471865, -0.3473664154486844, 0],
//     normal: [0, 0, 1],
//   }),
// )
/*
 * 行为
 */
// useSelectPointClick()
useAddPointClick()
// useRemovePointClick()
// useMovePointClick()

useAddLineClick()
// useMoveLineClick()

useAddPolylineClick()
useAddArcClick()
useSelect();
useMove();

useControls()
</script>
<style lang="less" scoped></style>
