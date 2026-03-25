<template>
  <div @click="onClear">
    <RestTwoTone style="font-size: 24px" />
    <div>清除</div>
  </div>
</template>
<script setup>
import { RestTwoTone } from '@ant-design/icons-vue'
import { useStorage } from '@vueuse/core'
import { useClear, useLoader, empty } from './hooks/data-manager'
let clear = useClear()
let loader = useLoader()
function onClear() {
  clear.all()
  loader.empty()
  data.value = empty()
}

let data = useStorage('35xcad', empty())
</script>
