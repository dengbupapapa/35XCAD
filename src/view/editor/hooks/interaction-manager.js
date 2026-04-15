import {
  useSelectPoints as useSelectPointsInteraction,
  useSelectPointsStrict as useSelectPointsStrictInteraction,
  useSelectLines as useSelectLinesInteraction,
  useSelectLinesStrict as useSelectLinesStrictInteraction,
} from './interaction-provide-context'
import {
  usePoints as usePointsEntitie,
  useLines as useLinesEntitie,
} from './viewport-provide-context'
import {
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
} from './geometry-query'
import {
  useSelectPoints as useSelectPointsInteractionQuery,
  useSelectPointsStrict as useSelectPointsStrictInteractionQuery,
  useSelectLines as useSelectLinesInteractionQuery,
  useSelectLinesStrict as useSelectLinesStrictInteractionQuery,
} from './interaction-query'
import {
  usePoints as usePointsViewportManager,
  useLines as useLinesViewportManager,
} from './viewport-manager'

export function useSelectPoints() {
  let selectsPoints = useSelectPointsInteraction()
  let selectPointsInteractionQuery = useSelectPointsInteractionQuery()
  let pointsEntitie = usePointsEntitie()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let selectPointsStrictInteractionManager = useSelectPointsStrict()
  let pointsViewportManager = usePointsViewportManager()
  function active(id, enabled) {
    // let pointsGeometry = pointsGeometryQuery.get(id)
    // let index = pointsGeometryQuery.indexOf(pointsGeometry)
    // pointsEntitie.active(index, enabled)
    if (enabled) {
      pointsViewportManager.activate(id)
    } else {
      pointsViewportManager.deactivate(id)
    }
  }
  return {
    set(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectPointsInteractionQuery.check(id)
      })
      this.clear()
      this.push(ids)
    },
    push(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }

      ids = ids.filter((id) => {
        return selectPointsInteractionQuery.check(id)
      })
      ids.forEach((id) => {
        if (!selectPointsInteractionQuery.includes(id)) {
          selectsPoints.value.push(id)
          active(id, true)
        }
      })
    },
    remove(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectPointsInteractionQuery.check(id)
      })
      ids.forEach((id) => {
        if (selectPointsInteractionQuery.includes(id)) {
          let index = selectsPoints.value.indexOf(id)
          selectsPoints.value.splice(index, 1)
          active(id, false)
          selectPointsStrictInteractionManager.remove(id)
        }
      })
    },
    clear() {
      selectsPoints.value.forEach((id) => {
        active(id, false)
        selectPointsStrictInteractionManager.remove(id)
      })
      selectsPoints.value.length = 0
    },
  }
}

export function useSelectPointsStrict() {
  let selectsPointsStrict = useSelectPointsStrictInteraction()
  let selectPointsStrictInteractionQuery = useSelectPointsStrictInteractionQuery()
  // }
  return {
    add(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectPointsStrictInteractionQuery.check(id)
      })
      ids.forEach((id) => {
        if (!selectPointsStrictInteractionQuery.includes(id)) {
          selectsPointsStrict.value.push(id)
        }
      })
    },
    remove(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectPointsStrictInteractionQuery.check(id)
      })
      ids.forEach((id) => {
        if (selectPointsStrictInteractionQuery.includes(id)) {
          let index = selectsPointsStrict.value.indexOf(id)
          selectsPointsStrict.value.splice(index, 1)
        }
      })
    },
    clear() {
      selectsPointsStrict.value.length = 0
    },
  }
}

export function useSelectLines() {
  let selectsLines = useSelectLinesInteraction()
  let selectLinesInteractionQuery = useSelectLinesInteractionQuery()
  let linesEntitie = useLinesEntitie()
  let linesGeometryQuery = useLinesGeometryQuery()
  let selectLinesStrictInteractionManager = useSelectLinesStrict()
  let linesViewportManager = useLinesViewportManager()
  function active(id, enabled) {
    // let pointsGeometry = linesGeometryQuery.get(id)
    // let index = linesGeometryQuery.indexOf(pointsGeometry)
    // linesEntitie.active(index, enabled)
    if (enabled) {
      linesViewportManager.activate(id)
    } else {
      linesViewportManager.deactivate(id)
    }
  }
  return {
    set(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectLinesInteractionQuery.check(id)
      })
      this.clear()
      this.push()
    },
    push(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }

      ids = ids.filter((id) => {
        return selectLinesInteractionQuery.check(id)
      })
      ids.forEach((id) => {
        if (!selectLinesInteractionQuery.includes(id)) {
          active(id, true)
          selectsLines.value.push(id)
        }
      })
    },
    remove(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectLinesInteractionQuery.check(id)
      })
      ids.forEach((id) => {
        if (selectLinesInteractionQuery.includes(id)) {
          let index = selectsLines.value.indexOf(id)
          selectsLines.value.splice(index, 1)
          active(id, false)
          selectLinesStrictInteractionManager.remove(id)
        }
      })
    },
    clear() {
      selectsLines.value.forEach((id) => {
        active(id, false)
        selectLinesStrictInteractionManager.remove(id)
      })
      selectsLines.value.length = 0
    },
  }
}

export function useSelectLinesStrict() {
  let selectsLinesStrict = useSelectLinesStrictInteraction()
  let selectLinesStrictInteractionQuery = useSelectLinesStrictInteractionQuery()
  return {
    add(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectLinesStrictInteractionQuery.check(id)
      })
      ids.forEach((id) => {
        if (!selectLinesStrictInteractionQuery.includes(id)) {
          selectsLinesStrict.value.push(id)
        }
      })
    },
    remove(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectLinesStrictInteractionQuery.check(id)
      })
      ids.forEach((id) => {
        if (selectLinesStrictInteractionQuery.includes(id)) {
          let index = selectsLinesStrict.value.indexOf(id)
          selectsLinesStrict.value.splice(index, 1)
        }
      })
    },
    clear() {
      selectsLinesStrict.value.length = 0
    },
  }
}
