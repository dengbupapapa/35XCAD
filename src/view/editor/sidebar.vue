<template>
  <!-- 当辅助几何和几何都存在的时候应该怎么展示 -->
  <SidebaProperty
    v-if="notHelpersGeometryDerived && modesManagerInteractions.enable.entitieSelect"
  />
  <SidebarDimensionDistance v-else-if="isAllDimensionDistancesGeometryDerived" />
  <SidebarFeature v-else />
</template>
<script setup>
import SidebarFeature from './sidebar-feature.vue'
import SidebaProperty from './sidebar-property.vue'
import SidebarDimensionDistance from './sidebar-dimension-distance.vue'
import { useSelectGeometrysStrict as useSelectGeometrysStrictInteractionDerived } from './hooks/interaction-derived'
import {
  useIsAllDimensionDistances as useIsAllDimensionDistancesGeometryDerived,
  useNotHelpers as useNotHelpersGeometryDerived,
} from './hooks/geometry-derived'
import useModesManagerInteractions from './hooks/modes-manager-interactions.js'
let modesManagerInteractions = useModesManagerInteractions()
let selectGeometrysStrictInteractionDerived = useSelectGeometrysStrictInteractionDerived()
let notHelpersGeometryDerived = useNotHelpersGeometryDerived(
  selectGeometrysStrictInteractionDerived,
)
let isAllDimensionDistancesGeometryDerived = useIsAllDimensionDistancesGeometryDerived(
  selectGeometrysStrictInteractionDerived,
)
</script>
