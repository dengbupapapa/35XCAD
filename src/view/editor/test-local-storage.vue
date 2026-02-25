<template>
  <div style="text-align: right">
    <button @click="onSave">保存{{ saving ? '中...' : '' }}</button>
    <button @click="onClear">清除</button>
  </div>
</template>
<script setup>
import { toRaw, ref } from 'vue'
import { useStorage } from '@vueuse/core'

function empty() {
  return {
    planes: [],
    points: [],
    lines: [],
    polylines: [],
    arcs: [],
    constraints: [],
    constraintsIncrement: 0,
  }
}
let data = useStorage('35xcad', empty())

import {
  usePlanes as usePlanesQuery,
  usePoints as usePointsQuery,
  useLines as useLinesQuery,
  usePolylines as usePolylinesQuery,
  useArcs as useArcsQuery,
  useConstraints as useConstraintsQuery,
  //   useConstraintsIncrement as useConstraintsIncrementQuery,
} from './hooks/geometry-query'
// storage
let planesQuery = usePlanesQuery()
let pointsQuery = usePointsQuery()
let linesQuery = useLinesQuery()
let polylinesQuery = usePolylinesQuery()
let arcsQuery = useArcsQuery()
let constraintsQuery = useConstraintsQuery()
// let constraintsIncrementQuery = useConstraintsIncrementQuery()

function onSave() {
  data.value.planes = toRaw(planesQuery.all())
  data.value.points = toRaw(pointsQuery.all())
  data.value.lines = toRaw(linesQuery.all())
  data.value.polylines = toRaw(polylinesQuery.all())
  data.value.arcs = toRaw(arcsQuery.all())
  data.value.constraints = toRaw(constraintsQuery.all())
  //   data.value.constraintsIncrement = toRaw(constraintsIncrementQuery.get())
}

let saving = ref(false)
// setInterval(() => {
//   saving.value = true
//   setTimeout(() => {
//     onSave()
//     saving.value = false
//   }, 1000)
// }, 60 * 1000)

import { useClear } from './hooks/data-manager'
let clear = useClear()
function onClear() {
  clear.all()
  loader.empty()
  onSave()
}

//load
import { useLoader } from './hooks/data-manager'
import { onMounted } from 'vue'

let loader = useLoader()

onMounted(function load() {
  let { planes } = data.value
  if (planes.length === 0) {
    loader.empty()
  } else {
    loader.json(data.value)
  }
})
/*
 * 1、清理数据
 * 2、加载数据整理到hooks ko
 * 3、arc的约束
 */
</script>
