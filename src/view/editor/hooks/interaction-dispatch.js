import {
  useSelectPoints as useSelectPointsInteractionManager,
  useSelectLines as useSelectLinesInteractionManager,
  useSelectPointsStrict as useSelectPointsStrictInteractionManager,
  useSelectLinesStrict as useSelectLinesStrictInteractionManager,
} from './interaction-manager'
// import {
//   useSelectPoints as useSelectPointsInteractionQuery,
//   useSelectLines as useSelectLinesInteractionQuery,
// } from './interaction-query'
import {
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
} from './geometry-query'

export function useSelectGeometrys() {
  let selectsPointsInteractionManager = useSelectPointsInteractionManager()
  let selectLinesInteractionManager = useSelectLinesInteractionManager()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  return {
    push(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids.forEach((id) => {
        if (pointsGeometryQuery.hasById(id)) {
          selectsPointsInteractionManager.push(id)
        }
        if (linesGeometryQuery.hasById(id)) {
          selectLinesInteractionManager.push(id)
        }
      })
    },
    remove(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids.forEach((id) => {
        if (pointsGeometryQuery.hasById(id)) {
          selectsPointsInteractionManager.remove(id)
        }
        if (linesGeometryQuery.hasById(id)) {
          selectLinesInteractionManager.remove(id)
        }
      })
    },
    clear() {
      selectsPointsInteractionManager.clear()
      selectLinesInteractionManager.clear()
    },
    set(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      this.clear()
      this.push(ids)
    },
  }
}

export function useSelectGeometrysStrict() {
  let selectPointsStrictInteractionManager = useSelectPointsStrictInteractionManager()
  let selectLinesStrictInteractionManager = useSelectLinesStrictInteractionManager()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  return {
    push(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids.forEach((id) => {
        if (pointsGeometryQuery.hasById(id)) {
          selectPointsStrictInteractionManager.add(id)
        }
        if (linesGeometryQuery.hasById(id)) {
          selectLinesStrictInteractionManager.add(id)
        }
      })
    },
    remove(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids.forEach((id) => {
        if (pointsGeometryQuery.hasById(id)) {
          selectPointsStrictInteractionManager.remove(id)
        }
        if (linesGeometryQuery.hasById(id)) {
          selectLinesStrictInteractionManager.remove(id)
        }
      })
    },
    clear() {
      selectPointsStrictInteractionManager.clear()
      selectLinesStrictInteractionManager.clear()
    },
    set(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      this.clear()
      this.push(ids)
    },
  }
}
