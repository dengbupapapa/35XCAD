<template>
  <select :size="constraints.length > 1 ? constraints.length : 2" class="select">
    <option :key="constraint.id" :value="constraint.id" v-for="constraint in constraints">
      {{ labelConstraintMap[constraint.type] }}
    </option>
  </select>
</template>
<script setup>
import { computed } from 'vue'
import { useConstraints as useConstraintsGeometryDerived } from './hooks/geometry-derived'
import { useSelectGeometrysStrict as useSelectGeometrysStrictInteractionDerived } from './hooks/interaction-derived'
import { labelConstraintMap } from './locales/zh-CN/displayMap.js'
let constraintsGeometryDerived = useConstraintsGeometryDerived()
let selectGeometrysStrictInteractionDerived = useSelectGeometrysStrictInteractionDerived()
let constraints = computed(() => {
  return constraintsGeometryDerived.value.filter((constraint) => {
    return selectGeometrysStrictInteractionDerived.value.every((geometry)=>{
      return constraint.args.includes(geometry)
    })
  })
})
</script>
<style scoped lang="less">
.select {
  width: 100%;
  outline-color: #0e76e1;
}
</style>
