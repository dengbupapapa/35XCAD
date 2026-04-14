<template>
  <div class="sidebar-dimension-distance">
    <div class="title"><Icon type="icon-dimension" style="font-size: 18px" /><b>尺寸</b></div>
    <div class="content">
      <a-collapse :bordered="false" v-model:activeKey="activeKey">
        <a-collapse-panel key="1" header="主要值">
          <a-input-number
            style="width: 100%"
            :step="0.001"
            :max="max"
            :precision="configUI['dimension-distance-numerical-precision']"
            :disabled="dimensionDistancesLengthGeometryDerived > 1"
            v-model:value="input"
            @blur="onComplete"
            @pressEnter="onComplete"
            @change="onComplete"
          />
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { createFromIconfontCN } from '@ant-design/icons-vue'
import iconfont from '@/assets/iconfont/iconfont.js?url'
const Icon = createFromIconfontCN({
  scriptUrl: iconfont, // 在 iconfont.cn 上生成
})
import configUI from './config-ui.json'
/*
 * 选中数量
 */
import { useSelectGeometrysStrict as useSelectGeometrysStrictInteractionDerived } from './hooks/interaction-derived'
import {
  useDimensionDistancesLength as useDimensionDistancesLengthGeometryDerived,
  useDimensionDistances as useDimensionDistancesGeometryDerived,
} from './hooks/geometry-derived'

let selectGeometrysStrictInteractionDerived = useSelectGeometrysStrictInteractionDerived()
let dimensionDistancesLengthGeometryDerived = useDimensionDistancesLengthGeometryDerived(
  selectGeometrysStrictInteractionDerived,
)
/*
 * 折叠面板参数
 */
let activeKey = ref([1])
/*
 * 修改长度
 */
let dimensionDistancesGeometryDerived = useDimensionDistancesGeometryDerived(
  selectGeometrysStrictInteractionDerived,
)
import {
  useConstraintsRelation as useConstraintsRelationConstraintQuery,
  useConstraints as useConstraintsConstraintQuery,
} from './hooks/constraint-query'
import { useConstraints as useConstraintsConstraintManager } from './hooks/constraint-manager'
import { useTexts as useTextsGeometryManager } from './hooks/geometry-manager'
import { watch } from 'vue'
let constraintsRelationConstraintQuery = useConstraintsRelationConstraintQuery()
let constraintsConstraintManager = useConstraintsConstraintManager({ effectDdebounce: true })
let constraintsConstraintQuery = useConstraintsConstraintQuery()
let textsGeometryManager = useTextsGeometryManager()
let input = ref(0)
/*
 * [问题]
 * 数值不能太大了，求解器的矩阵梯度会出问题
 * 之后有单位系统了再去解决
 */
let max = 5
let numeral = computed({
  get() {
    let dimensionDistance = dimensionDistancesGeometryDerived.value[0]
    if (!dimensionDistance) return
    let constraintsRelation = constraintsRelationConstraintQuery.get(
      dimensionDistance.constraintDistance,
    )
    let constraintId = constraintsRelation.constraints[0]
    let constraint = constraintsConstraintQuery.get(constraintId)
    let { args, numerals } = constraint
    return args[numerals[0]]
  },
  set(value) {
    let dimensionDistance = dimensionDistancesGeometryDerived.value[0]
    if (!dimensionDistance) return
    let constraintsRelation = constraintsRelationConstraintQuery.get(
      dimensionDistance.constraintDistance,
    )
    let constraintId = constraintsRelation.constraints[0]
    let constraint = constraintsConstraintManager.copy(constraintId)
    let { args, numerals } = constraint
    args[numerals[0]] = value
    constraintsConstraintManager.removeById(constraintId)
    constraintsConstraintManager.attach(constraint)
    //修改text
    let numberPrecision = configUI['dimension-distance-numerical-precision']
    let content = value.toFixed(numberPrecision)
    textsGeometryManager.content(dimensionDistance.text, content)
  },
})
function onComplete() {
  numeral.value = input.value
}
watch(
  () => numeral.value,
  (numeral) => {
    input.value = numeral
  },
  { immediate: true },
)
</script>
<style scoped lang="less">
.sidebar-dimension-distance {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  .title {
    display: flex;
    align-items: center;
    padding-left: 10px;
    b {
      margin-left: 5px;
      color: #444;
    }
  }
  .content {
    flex: 1;
    overflow-y: auto;
    border-top: 1px solid #d9d9d9;
    margin-top: 15px;
  }
}
</style>
