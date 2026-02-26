<template>
  <SidebaProperty v-if="hasSelect" />
  <SidebarFeature v-else/>
</template>
<script setup>
import SidebarFeature from './sidebar-feature.vue'
import SidebaProperty from './sidebar-property.vue'
import { useHasSelect } from './hooks/interaction-derived'
let hasSelect = useHasSelect()
</script>
