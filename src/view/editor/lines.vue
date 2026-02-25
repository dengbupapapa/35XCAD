<template>
  <Line v-for="(line, index) in lines" :line="line" :index="index" :key="line.id" />
</template>
<script setup>
import Line from './line.vue'
import { useLines as useLinesGeometryDerived } from './hooks/geometry-derived'
let lines = useLinesGeometryDerived()
</script>
