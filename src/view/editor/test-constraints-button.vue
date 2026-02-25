<template>
  <div style="background-color: beige; white-space: nowrap; padding-right: 10px">
    <div>
      <button @click="addConstraintCoordinate">固定点</button>
      <input style="width: 50px" v-model="p" />
      <input style="width: 50px" v-model="x" />
      <input style="width: 50px" v-model="y" />
    </div>
    <div>
      <button @click="addConstraintP2PDistance">点到点距离</button>
      <input style="width: 50px" v-model="distance" />
      <input style="width: 50px" v-model="p1" />
      <input style="width: 50px" v-model="p2" />
    </div>
    <div>
      <button>线水平</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useConstraints } from './hooks/geometry-manager'
let constraints = useConstraints()

let distance = ref(0.5)
let p1 = ref()
let p2 = ref()
function addConstraintP2PDistance() {
  // constraints.addConstraintP2PDistance(selectPoints.value[0],selectPoints.value[1],Number(distance.value))
  constraints.addConstraintP2PDistance(p1.value, p2.value, Number(distance.value))
}
let p = ref()
let x = ref(0)
let y = ref(0)
function addConstraintCoordinate() {
  // constraints.addConstraintCoordinateX(selectPoints.value[0], Number(x.value))
  // constraints.addConstraintCoordinateY(selectPoints.value[0], Number(y.value))
  // constraints.addConstraintCoordinateX(p.value,Number(x.value))
  // constraints.addConstraintCoordinateY(p.value,Number(y.value))
  constraints.addConstraintCoordinate(p.value, { x: Number(x.value), y: Number(y.value) })
}
</script>
