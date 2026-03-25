import {
  useSelectPoints as useSelectPointsInteraction,
  useSelectPointsStrict as useSelectPointsStrictInteraction,
  useSelectLines as useSelectLinesInteraction,
  useActiveElement as useActiveElementInteraction,
} from './interaction-provide-context'

export function useSelectPoints() {
  let selectsPoints = useSelectPointsInteraction()
  return {
    get() {
      return selectsPoints.value
    },
    includes(id) {
      return selectsPoints.value.includes(id)
    },
    check(id) {
      return typeof id === 'string'
    },
  }
}
export function useSelectPointsStrict() {
  let selectsPointsStrict = useSelectPointsStrictInteraction()
  return {
    get() {
      return selectsPointsStrict.value
    },
    includes(id) {
      return selectsPointsStrict.value.includes(id)
    },
    check(id) {
      return typeof id === 'string'
    },
  }
}
export function useSelectLines() {
  let selectsLines = useSelectLinesInteraction()
  return {
    get() {
      return selectsLines.value
    },
    includes(id) {
      return selectsLines.value.includes(id)
    },
    check(id) {
      return typeof id === 'string'
    },
  }
}

export function useSelectGeometrysStrict() {
  let selectPointsStrict = useSelectPointsStrictInteraction()
  let selectLines = useSelectLinesInteraction()
  return {
    get() {
      return [...selectPointsStrict.value, ...selectLines.value]
    },
    includes(id) {
      return [...selectPointsStrict.value, ...selectLines.value].includes(id)
    },
    check(id) {
      return typeof id === 'string'
    },
  }
}
export function useSelectGeometrys() {
  let selectPoints = useSelectPointsInteraction()
  let selectLines = useSelectLinesInteraction()
  return {
    get() {
      return [...selectPoints.value, ...selectLines.value]
    },
    includes(id) {
      return [...selectPoints.value, ...selectLines.value].includes(id)
    },
    check(id) {
      return typeof id === 'string'
    },
  }
}

export function useActiveElement() {
  let activeElementInteraction = useActiveElementInteraction()
  return {
    get() {
      return activeElementInteraction.value
    },
  }
}
