<template>
  <Arc v-for="(arc, index) in arcs" :arc="arc" :index="index" :key="arc.id" />
</template>
<script setup>
import Arc from './arc.vue'
import { useArcs as useArcsGeometryDerived } from './hooks/geometry-derived'
let arcs = useArcsGeometryDerived()
</script>
