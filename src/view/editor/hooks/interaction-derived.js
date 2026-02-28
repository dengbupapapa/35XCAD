import { computed } from 'vue'
import {
  useSelectPointsStrict as useSelectPointsStrictInteraction,
  useSelectPoints as useSelectPointsInteraction,
  useSelectLines as useSelectLinesInteraction,
} from './interaction-provide-context'

export function useSelectPointsStrict() {
  let selectPointsStrictInteraction = useSelectPointsStrictInteraction()
  return computed(() => {
    return selectPointsStrictInteraction.value
  })
}
export function useSelectPoints() {
  let selectsPointsInteraction = useSelectPointsInteraction()
  return computed(() => {
    return selectsPointsInteraction.value
  })
}
export function useSelectLines() {
  let selectLinesInteraction = useSelectLinesInteraction()
  return computed(() => {
    return selectLinesInteraction.value
  })
}

export function useHasSelect() {
  let selectsPoints = useSelectPointsInteraction()
  let selectLines = useSelectLinesInteraction()
  return computed(() => {
    return selectsPoints.value.length > 0 || selectLines.value.length > 0
  })
}
