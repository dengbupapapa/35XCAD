<template>
  <plane v-for="(plane, index) in planes" :plane="plane" :index="index" :key="plane.id" />
</template>
<script setup>
import plane from './plane.vue'
import { usePlanes } from './hooks/geometry-derived'

let planes = usePlanes()
</script>
