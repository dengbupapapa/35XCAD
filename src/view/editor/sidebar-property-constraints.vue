<template>
  <select :size="constraints.length > 1 ? constraints.length : 2" class="select">
    <option :key="constraint.id" :value="constraint.id" v-for="constraint in constraints">
      {{ labelConstraintMap[constraint.type] }}
    </option>
  </select>
</template>
<script setup>
import { computed } from 'vue'
import { useConstraints as useConstraintsDerived } from './hooks/constraint-derived'
import { useSelectGeometrysStrict as useSelectGeometrysStrictInteractionDerived } from './hooks/interaction-derived'
import { labelConstraintMap } from './locales/zh-CN/displayMap.js'
let constraintsDerived = useConstraintsDerived()
let selectGeometrysStrictInteractionDerived = useSelectGeometrysStrictInteractionDerived()
let constraints = computed(() => {
  return constraintsDerived.value.filter((constraint) => {
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
