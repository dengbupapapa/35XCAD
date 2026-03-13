<template>
  <!-- <a-alert message="Success Tips" type="success" show-icon /> -->
  <!-- <a-alert message="Informational Notes" type="info" show-icon /> -->
  <!-- <a-alert
    message="约束求解找到使误差函数最小化的解,但解不是0"
    type="warning"
    show-icon
    v-if="statusSolver === 1"
  />
  <a-alert message="约束求解未能找到任何解" type="error" show-icon v-if="statusSolver === 2" />
  <a-alert message="约束求解成功但解无效 " type="error" show-icon v-if="statusSolver === 3" /> -->
  <a-tag :bordered="false" color="warning" v-if="statusSolver === 1">
    <ExclamationCircleOutlined /> 约束求解找到使误差函数最小化的解
  </a-tag>
  <a-tag :bordered="false" color="error" v-if="statusSolver === 2">
    <template #icon>
      <CloseCircleOutlined />
    </template>
    约束求解未能找到任何解
  </a-tag>
  <a-tag :bordered="false" color="error" v-if="statusSolver === 3">
    <template #icon> <CloseCircleOutlined /> </template>约束求解成功但解无效</a-tag
  >
</template>
<script setup>
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { useStatusSolver } from './hooks/solver-gcs-derived'
let statusSolver = useStatusSolver()
</script>
