<template>
  <select
    :size="selectGeometrysStrictExcludingHelpers.length"
    class="select"
    v-model="selected"
    @keydown="onKeydown"
  >
    <a-dropdown
      :trigger="['contextmenu']"
      :key="point.id"
      v-for="(point, index) in selectPointsStrictExcludingHelpers"
    >
      <option :value="point.id" @contextmenu="onContextmenuOption(point)">
        {{ labelGeometryMap[geometryMapper.typeById(point.id)] }}{{ index + 1 }}
      </option>
      <template #overlay>
        <a-menu @click="onMenuClick">
          <a-menu-item key="delete">删除</a-menu-item>
          <!-- <a-menu-divider /> -->
        </a-menu>
      </template>
    </a-dropdown>

    <a-dropdown
      :trigger="['contextmenu']"
      :key="line.id"
      v-for="(line, index) in selectLinesExcludingHelpers"
    >
      <option :value="line.id" @contextmenu="onContextmenuOption(line)">
        {{ labelGeometryMap[geometryMapper.typeById(line.id)] }}{{ index + 1 }}
      </option>
      <template #overlay>
        <a-menu @click="onMenuClick">
          <a-menu-item key="delete">删除</a-menu-item>
          <!-- <a-menu-divider /> -->
        </a-menu>
      </template>
    </a-dropdown>

    <!-- <option v-for="(point, index) in selectPointsStrict" :value="point.id" :key="point.id">
      {{ labelGeometryMap[geometryMapper.typeById(point.id)] }}{{ index + 1 }}
    </option>
    <option v-for="(line, index) in selectLines" :value="line.id" :key="line.id">
      {{ labelGeometryMap[geometryMapper.typeById(line.id)] }}{{ index + 1 }}
    </option> -->
  </select>
</template>
<script setup>
import { computed, watch, ref } from 'vue'
import {
  useSelectGeometrysStrictExcludingHelpers,
  useSelectPointsStrictExcludingHelpers,
  useSelectLinesExcludingHelpers,
} from './hooks/select-derived'
import { useGeometry as useGeometryMapper } from './hooks/geometry-mapper'
import { useSelectGeometrys as useSelectGeometrysInteractionDispatch } from './hooks/interaction-dispatch'
import { labelGeometryMap } from './locales/zh-CN/displayMap.js'
let geometryMapper = useGeometryMapper()
let selectGeometrysStrictExcludingHelpers = useSelectGeometrysStrictExcludingHelpers()
let selectPointsStrictExcludingHelpers = useSelectPointsStrictExcludingHelpers()
let selectLinesExcludingHelpers = useSelectLinesExcludingHelpers()
let selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()

/*
 * 右键菜单
 */
function onMenuClick({ key }) {
  if (key === 'delete') {
    onDelete()
  }
}
//删除
function onDelete() {
  selectGeometrysInteractionDispatch.remove(selected.value)
}
function onKeydown(event) {
  if (event.key === 'Delete' || event.keyCode === 46) {
    onDelete()
  }
}
//兼容右键选中
let selected = ref()
function onContextmenuOption(geometry) {
  selected.value = geometry.id
}
</script>
<style scoped lang="less">
.select {
  width: 100%;
  outline-color: #0e76e1;
}
</style>
