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
import { labelConstraintMap } from './locales/zh-CN/displayMap.js'
import { useConstraints as useConstraintsGeometryManager } from './hooks/geometry-manager'
import { usePlanes as usePlanesGeometryQuery } from "./hooks/geometry-query"

let constraintsGeometryManager = useConstraintsGeometryManager()
let planesGeometryQuery = usePlanesGeometryQuery()
ConstraintResolver.setContext('constraintsGeometryManager',constraintsGeometryManager)
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
