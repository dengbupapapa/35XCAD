<template>
  <!-- 当辅助几何和几何都存在的时候应该怎么展示 -->
  <SidebaProperty
    v-if="
      hasSelectExcludingHelpersInteractionDerived && !modesManagerInteractions.enable.dimensionAdd
    "
  />
  <SidebarFeature v-else />
</template>
<script setup>
import SidebarFeature from './sidebar-feature.vue'
import SidebaProperty from './sidebar-property.vue'
import { useHasSelectExcludingHelpers as useHasSelectExcludingHelpersInteractionDerived } from './hooks/interaction-derived'
import useModesManagerInteractions from './hooks/modes-manager-interactions.js'
let hasSelectExcludingHelpersInteractionDerived = useHasSelectExcludingHelpersInteractionDerived()
let modesManagerInteractions = useModesManagerInteractions()
</script>
