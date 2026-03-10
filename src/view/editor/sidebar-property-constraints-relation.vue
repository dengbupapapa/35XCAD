<template>
  <select
    :size="constraints.length > 1 ? constraints.length : 2"
    class="select"
    v-model="selected"
    @keydown="onKeydown"
  >
    <a-dropdown :trigger="['contextmenu']" :key="constraint.id" v-for="constraint in constraints">
      <option :value="constraint.id" @contextmenu="onContextmenuOption(constraint)">
        {{ labelConstraintMap[constraint.type] }}{{ constraint.tag }}
      </option>
      <template #overlay>
        <a-menu @click="onMenuClick">
          <a-menu-item key="delete">删除</a-menu-item>
          <!-- <a-menu-divider /> -->
        </a-menu>
      </template>
    </a-dropdown>
  </select>
</template>
<script setup>
import { computed, watch, ref } from 'vue'
import { useConstraintsRelation as useConstraintsRelationDerived } from './hooks/constraint-derived'
import { useSelectGeometrysStrict as useSelectGeometrysStrictInteractionDerived } from './hooks/interaction-derived'
import { useConstraints as useConstraintsDispatch } from './hooks/constraint-dispatch'
import { labelConstraintMap } from './locales/zh-CN/displayMap.js'
/*
 * 列表逻辑
 */
let constraintsRelationDerived = useConstraintsRelationDerived()
let selectGeometrysStrictInteractionDerived = useSelectGeometrysStrictInteractionDerived()
let constraints = computed(() => {
  return constraintsRelationDerived.value.filter(({ geometrys, type }) => {
    return selectGeometrysStrictInteractionDerived.value.every((geometry) => {
      return geometrys.flat().includes(geometry)
    })
  })
})
let selected = ref()
watch(
  () => constraints.value,
  (constraints) => {
    if (constraints.length > 0) {
      if (constraints.some(({ id }) => id === selected.value)) return
      selected.value = constraints[0].id
    }
  },
  { immediate: true },
)
/*
 * 右键菜单
 */
function onMenuClick({ key }) {
  if (key === 'delete') {
    onDelete()
  }
}
//兼容右键选中
function onContextmenuOption(constraint) {
  selected.value = constraint.id
}
//删除
let constraintsDispatch = useConstraintsDispatch()
function onDelete() {
  constraintsDispatch.removeById(selected.value)
}
function onKeydown(event) {
  if (event.key === 'Delete' || event.keyCode === 46) {
    onDelete()
  }
}
</script>
<style scoped lang="less">
.select {
  width: 100%;
  outline-color: #0e76e1;
}
</style>
