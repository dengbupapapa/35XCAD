<template>
  <div style="display: flex; flex-direction: column; margin-left: -16px; margin-right: -16px">
    <a-button
      type="text"
      style="text-align: left"
      v-for="constraint in constraintsUsable"
      @click="onClick(constraint)"
    >
      <template #icon>
        <DownloadOutlined />
      </template>
      {{ labelConstraintMap[constraint] }}
    </a-button>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { useSelectGeometrysStrict } from './hooks/interaction-derived'
import { labelConstraintMap } from './locales/zh-CN/displayMap.js'
import { useConstraints as useConstraintsDispatch} from "./hooks/constraint-dispatch"

let constraintsDispatch = useConstraintsDispatch();
/*
 * 获取可用的约束
 */
let selectGeometrysStrict = useSelectGeometrysStrict()
let constraintsUsable = computed(() => {
  return constraintsDispatch.usable(selectGeometrysStrict.value)
})

/*
 * 添加约束
 */
function onClick(name) {
  constraintsDispatch.add(name, selectGeometrysStrict.value)
}
</script>
<style scoped lang="less">
.select {
  width: 100%;
  outline-color: #0e76e1;
}
</style>
