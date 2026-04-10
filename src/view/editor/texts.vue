<template>
  <Text v-for="(text, index) in texts" :text="text" :index="index" :key="text.id" />
</template>
<script setup>
import Text from './text.vue'
import { useTexts as useTextsGeometryDerived } from './hooks/geometry-derived'
let texts = useTextsGeometryDerived()
</script>
