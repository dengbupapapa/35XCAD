import { computed } from 'vue'
import { useSelectPoints as useSelectPointsGeometry } from './interaction-provide-context'

export function useSelectPoints() {
  let selectsPoints = useSelectPointsGeometry()
  return computed(() => {
    return selectsPoints.value
  })
}
