<template>
  <div style="display: flex; flex-direction: column; margin-left: -16px; margin-right: -16px">
    <a-button
      type="text"
      style="text-align: left"
      v-for="constraint in constraintsUsable"
      @click="onClick(constraint)"
    >
      <template #icon>
        <DownloadOutlined />
      </template>
      {{ labelConstraintMap[constraint] }}
    </a-button>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { ConstraintResolver } from './core/solver-gcs.js'
import { useSelectGeometrysStrict } from './hooks/select-derived'
// import {
//   useConstraints as useConstraintsManager,
//   useConstraintsRelation as useConstraintsRelationManager,
// } from './hooks/constraint-manager'
// import { usePlanes as usePlanesGeometryQuery } from './hooks/geometry-query'
import { labelConstraintMap } from './locales/zh-CN/displayMap.js'

// let constraintsManager = useConstraintsManager()
// let constraintsRelationManager = useConstraintsRelationManager()
// let planesGeometryQuery = usePlanesGeometryQuery()
// ConstraintResolver.setContext('constraintsManager', constraintsManager)
// ConstraintResolver.setContext('constraintsRelationManager', constraintsRelationManager)
// ConstraintResolver.setContext('planesGeometryQuery', planesGeometryQuery)
let constraintResolver = new ConstraintResolver()
/*
 * 获取可用的约束
 */
let selectGeometrysStrict = useSelectGeometrysStrict()
let constraintsUsable = computed(() => {
  return constraintResolver.solverUsable(selectGeometrysStrict.value)
})

/*
 * 添加约束
 */
function onClick(name) {
  constraintResolver.solverAttach(name, selectGeometrysStrict.value)
}
</script>
<style scoped lang="less">
.select {
  width: 100%;
  outline-color: #0e76e1;
}
</style>
