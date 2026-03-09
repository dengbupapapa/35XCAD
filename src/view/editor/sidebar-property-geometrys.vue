<template>
  <select :size="selectGeometrysStrict.length" class="select">
    <option v-for="(point, index) in selectPointsStrict" :value="point.id" :key="point.id">
      {{ labelGeometryMap[geometryMapper.typeById(point.id)] }}{{ index + 1 }}
    </option>
    <option v-for="(line, index) in selectLines" :value="line.id" :key="line.id">
      {{ labelGeometryMap[geometryMapper.typeById(line.id)] }}{{ index + 1 }}
    </option>
  </select>
</template>
<script setup>
import {
  useSelectGeometrysStrict,
  useSelectPointsStrict,
  useSelectLines,
} from './hooks/select-derived'
import {useGeometry as useGeometryMapper} from './hooks/geometry-mapper'
import { labelGeometryMap } from './locales/zh-CN/displayMap.js'
let geometryMapper = useGeometryMapper()
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
