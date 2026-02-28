<template>
  <select :size="selectGeometrysStrict.length" class="select">
    <option v-for="(point, index) in selectPointsStrict" :value="point.id">
      {{ labelGeometryMap[point.type] }}{{ index + 1 }}
    </option>
    <option v-for="(line, index) in selectLines" :value="line.id">
      {{ labelGeometryMap[line.type] }}{{ index + 1 }}
    </option>
  </select>
</template>
<script setup>
import {
  useSelectGeometrysStrict,
  useSelectPointsStrict,
  useSelectLines,
} from './hooks/select-derived'
import { labelGeometryMap } from './locales/zh-CN/displayMap.js'
let selectGeometrysStrict = useSelectGeometrysStrict()
let selectPointsStrict = useSelectPointsStrict()
let selectLines = useSelectLines()
</script>
<style scoped lang="less">
.select {
  width: 100%;
  outline-color: #0e76e1;
}
</style>
