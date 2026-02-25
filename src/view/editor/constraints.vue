<template>
  <Constraint
    v-for="(constraint, index) in constraints"
    :constraint="constraint"
    :index="index"
    :key="constraint.id"
  />
</template>
<script setup>
import Constraint from './constraint.vue'
import { useConstraints } from './hooks/geometry-derived'
let constraints = useConstraints()
</script>
