import { computed } from 'vue'
import {
  useSelectPoints as useSelectPointsInteraction,
  useSelectLines as useSelectLinesInteraction,
} from './interaction-provide-context'

export function useSelectPoints() {
  let selectsPoints = useSelectPointsInteraction()
  return computed(() => {
    return selectsPoints.value
  })
}
export function useSelectLines() {
  let selectLines = useSelectLinesInteraction()
  return computed(() => {
    return selectLines.value
  })
}

export function useHasSelect() {
  let selectsPoints = useSelectPointsInteraction()
  let selectLines = useSelectLinesInteraction()
  return computed(() => {
    return selectsPoints.value.length > 0 || selectLines.value.length > 0
  })
}
