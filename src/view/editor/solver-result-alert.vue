<template>
  <div class="solver-result-alert">
    <a-tag :bordered="false" color="warning" v-if="solverResult.status === 1">
      <ExclamationCircleOutlined /> {{ tipSolverResultStatus[solverResult.status] }}
    </a-tag>
    <a-tag :bordered="false" color="error" v-if="solverResult.status === 2">
      <template #icon>
        <CloseCircleOutlined />
      </template>
      {{ tipSolverResultStatus[solverResult.status] }}
    </a-tag>
    <a-tag :bordered="false" color="error" v-if="solverResult.status === 3">
      <template #icon> <CloseCircleOutlined /> </template>
      {{ tipSolverResultStatus[solverResult.status] }}
    </a-tag>

    <a-tag :bordered="false" color="warning" v-if="solverResult.hasRedundant">
      <ExclamationCircleOutlined /> {{ tipSolverResultDiagnose['hasRedundant'] }}
    </a-tag>
    <a-tag :bordered="false" color="error" v-if="solverResult.hasConflicting">
      <template #icon> <CloseCircleOutlined /> </template>
      {{ tipSolverResultDiagnose['hasConflicting'] }}
    </a-tag>
    <!-- {{ solverResult }} -->
  </div>
</template>
<script setup>
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { useSolverResult } from './hooks/solver-gcs-derived'
import { tipSolverResultStatus, tipSolverResultDiagnose } from './locales/zh-CN/displayMap.js'
let solverResult = useSolverResult()
</script>
<style lang="less" scoped>
.solver-result-alert {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  > * {
    margin: 2px 0;
  }
}
</style>
