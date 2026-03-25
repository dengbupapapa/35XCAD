import { computed } from 'vue'
import {
  useSelectPointsStrict as useSelectPointsStrictInteraction,
  useSelectPoints as useSelectPointsInteraction,
  useSelectLines as useSelectLinesInteraction,
  useActiveElement as useActiveElementInteraction,
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

export function useActiveElement() {
  let activeElementInteraction = useActiveElementInteraction()
  return computed(() => {
    return activeElementInteraction.value
  })
}

import { useHelpers as useHelpersGeometryMapper } from './geometry-mapper'
export function useSelectGeometrysExcludingHelpers() {
  let selectGeometrysInteractionDerived = useSelectGeometrys()
  let helpersGeometryMapper = useHelpersGeometryMapper()
  return computed(() => {
    return selectGeometrysInteractionDerived.value.filter((id) => {
      return !helpersGeometryMapper.hasFormLineId(id) && !helpersGeometryMapper.hasFormPointId(id)
    })
  })
}

export function useSelectGeometrysStrictExcludingHelpers() {
  let selectGeometrysStrictInteractionDerived = useSelectGeometrysStrict()
  let helpersGeometryMapper = useHelpersGeometryMapper()
  return computed(() => {
    return selectGeometrysStrictInteractionDerived.value.filter((id) => {
      return !helpersGeometryMapper.hasFormLineId(id) && !helpersGeometryMapper.hasFormPointId(id)
    })
  })
}

export function useHasSelectExcludingHelpers() {
  let selectGeometrysStrictExcludingHelpersInteractionDerived =
    useSelectGeometrysStrictExcludingHelpers()
  return computed(() => {
    return selectGeometrysStrictExcludingHelpersInteractionDerived.value.length > 0
  })
}
