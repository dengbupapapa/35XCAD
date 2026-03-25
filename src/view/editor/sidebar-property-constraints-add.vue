<template>
  <div style="display: flex; flex-direction: column; margin-left: -16px; margin-right: -16px">
    <a-button
      type="text"
      style="text-align: left"
      v-for="constraint in constraintsUsable"
      @click="onClick(constraint)"
    >
      <template #icon>
        <Icon :type="`icon-${constraint}`" style="font-size: 16px" />
      </template>
      {{ labelConstraintMap[constraint] }}
    </a-button>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { createFromIconfontCN } from '@ant-design/icons-vue'
import { useSelectGeometrysStrictExcludingHelpers } from './hooks/interaction-derived'
import { labelConstraintMap } from './locales/zh-CN/displayMap.js'
import { useConstraints as useConstraintsDispatch } from './hooks/constraint-dispatch'
import iconfont from '@/assets/iconfont/iconfont.js?url'
let Icon = createFromIconfontCN({
  scriptUrl: iconfont, // 在 iconfont.cn 上生成
})

let constraintsDispatch = useConstraintsDispatch()
/*
 * 获取可用的约束
 */
let selectGeometrysStrictExcludingHelpers = useSelectGeometrysStrictExcludingHelpers()
let constraintsUsable = computed(() => {
  return constraintsDispatch.usable(selectGeometrysStrictExcludingHelpers.value)
})

/*
 * 添加约束
 */
function onClick(name) {
  constraintsDispatch.add(name, selectGeometrysStrictExcludingHelpers.value)
}
</script>
<style scoped lang="less">
.select {
  width: 100%;
  outline-color: #0e76e1;
}
</style>
