<template>
    <div @click="onSave">
        <SaveTwoTone  style="font-size: 24px; " />
        <div>保存</div>
    </div>
</template>
<script setup>
import { SaveTwoTone } from '@ant-design/icons-vue'

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
  data.value.planes = [...toRaw(planesQuery.all())]
  data.value.points = [...toRaw(pointsQuery.all())]
  data.value.lines = [...toRaw(linesQuery.all())]
  data.value.polylines = [...toRaw(polylinesQuery.all())]
  data.value.arcs = [...toRaw(arcsQuery.all())]
  data.value.constraints = [...toRaw(constraintsQuery.all())]
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
</script>
