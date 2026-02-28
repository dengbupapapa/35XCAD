import { computed } from 'vue'
import {
  useSelectPoints as useSelectPointsInteractionDerived,
  useSelectLines as useSelectLinesInteractionDerived,
  useSelectPointsStrict as useSelectPointsStrictInteractionDerived,
} from './interaction-derived'
import {
  usePointsHash as usePointsHashGeometryDerived,
  useLinesHash as useLinesHashGeometryDerived,
} from './geometry-derived'

export function useSelectPointsStrict() {
  let selectPointsStrictInteractionDerived = useSelectPointsStrictInteractionDerived()
  let pointsHashGeometryDerived = usePointsHashGeometryDerived()
  return computed(() => {
    return selectPointsStrictInteractionDerived.value.map((id) => {
      return pointsHashGeometryDerived.value[id]
    })
  })
}
export function useSelectPoints() {
  let selectPointsInteractionDerived = useSelectPointsInteractionDerived()
  let pointsHashGeometryDerived = usePointsHashGeometryDerived()
  return computed(() => {
    return selectPointsInteractionDerived.value.map((id) => {
      return pointsHashGeometryDerived.value[id]
    })
  })
}

export function useSelectLines() {
  let selectLinesInteractionDerived = useSelectLinesInteractionDerived()
  let linesHashGeometryDerived = useLinesHashGeometryDerived()
  return computed(() => {
    return selectLinesInteractionDerived.value.map((id) => {
      return linesHashGeometryDerived.value[id]
    })
  })
}

/* [优化]
 * 需要一个不分类型收集id的集合，这样才会有一个严格的顺序
 */
export function useSelectGeometrysStrict() {
  let selectPointsStrict = useSelectPointsStrict()
  let selectLines = useSelectLines()
  return computed(() => {
    return [...selectPointsStrict.value, ...selectLines.value]
  })
}
export function useSelectGeometrys() {
  let selectPoints = useSelectPoints()
  let selectLines = useSelectLines()
  return computed(() => {
    return [...selectPoints.value, ...selectLines.value]
  })
}
