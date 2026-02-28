<template>
  <div style="display: flex; flex-direction: column; margin-left: -16px; margin-right: -16px">
    <a-button
      type="text"
      style="text-align: left"
      v-for="constraint in constraintsAvailability"
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
import {  ConstraintResolver } from './core/solver-gcs.js'
import { useSelectGeometrysStrict } from './hooks/select-derived'
import { useConstraints as useConstraintsManager } from './hooks/constraint-manager'
import { usePlanes as usePlanesGeometryQuery } from "./hooks/geometry-query"
import { labelConstraintMap } from './locales/zh-CN/displayMap.js'

let constraintsManager = useConstraintsManager()
let planesGeometryQuery = usePlanesGeometryQuery()
ConstraintResolver.setContext('constraintsGeometryManager',constraintsManager)
ConstraintResolver.setContext('planesGeometryQuery',planesGeometryQuery)
let constraintResolver = new ConstraintResolver()
/*
 * 获取可用的约束
 */
let selectGeometrysStrict = useSelectGeometrysStrict()
let constraintsAvailability = computed(() => {
  return constraintResolver.solverAvailability(selectGeometrysStrict.value)
})

/*
 * 添加约束
 */
function onClick(name) {
  constraintResolver.solverExecutor(name, selectGeometrysStrict.value)
}
</script>
<style scoped lang="less">
.select {
  width: 100%;
  outline-color: #0e76e1;
}
</style>
