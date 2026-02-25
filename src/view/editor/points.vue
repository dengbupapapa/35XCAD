<template>
  <point v-for="(point, index) in points" :point="point" :index="index" :key="point.id" />
</template>
<script setup>
import point from './point.vue'
import { usePoints as usePointsGeometryDerived } from './hooks/geometry-derived'

let points = usePointsGeometryDerived()
</script>
