import {
  useSelectPoints as useSelectPointsInteraction,
  useSelectPointsStrict as useSelectPointsStrictInteraction,
  useSelectLines as useSelectLinesInteraction,
} from './interaction-provide-context'
import { usePoints as usePointsEntitie, useLines as useLinesEntitie } from './viewport-provide-context'
import { usePoints as usePointsGeometryQuery, useLines as useLinesGeometryQuery } from './geometry-query'
import {
  useSelectPoints as useSelectPointsInteractionQuery,
  useSelectPointsStrict as useSelectPointsStrictInteractionQuery,
  useSelectLines as useSelectLinesInteractionQuery,
} from './interaction-query'

export function useSelectPoints() {
  let selectsPoints = useSelectPointsInteraction()
  let selectPointsInteractionQuery = useSelectPointsInteractionQuery()
  let pointsEntitie = usePointsEntitie()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let selectPointsStrictInteractionManage = useSelectPointsStrict()
  function active(id, enabled) {
    let pointsGeometry = pointsGeometryQuery.get(id)
    let index = pointsGeometryQuery.indexOf(pointsGeometry)
    pointsEntitie.active(index, enabled)
  }
  return {
    set(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectPointsInteractionQuery.check(id)
      })
      selectsPoints.value.forEach((id) => {
        active(id, false)
        selectPointsStrictInteractionManage.remove(id)
      })
      ids.forEach((id) => {
        active(id, true)
      })
      selectsPoints.value = ids
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
    remove(ids){
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
          selectPointsStrictInteractionManage.remove(id)
        }
      })
    },
    clear() {
      selectsPoints.value.forEach((id) => {
        active(id, false)
        selectPointsStrictInteractionManage.remove(id)
      })
      selectsPoints.value = []
    },
  }
}

export function useSelectPointsStrict() {
  let selectsPointsStrict = useSelectPointsStrictInteraction()
  let selectPointsStrictInteractionQuery = useSelectPointsStrictInteractionQuery()
  // let pointsEntitie = usePointsEntitie()
  // let pointsGeometryQuery = usePointsGeometryQuery()
  // function active(id, enabled) {
  //   let pointsGeometry = pointsGeometryQuery.get(id)
  //   let index = pointsGeometryQuery.indexOf(pointsGeometry)
  //   pointsEntitie.active(index, enabled)
  // }
  return {
    // set(ids) {
    //   if (!(ids instanceof Array)) {
    //     ids = [ids]
    //   }
    //   ids = ids.filter((id) => {
    //     return selectPointsStrictInteractionQuery.check(id)
    //   })
    //   // selectsPointsStrict.value.forEach((id) => {
    //   //   active(id, false)
    //   // })
    //   // ids.forEach((id) => {
    //   //   active(id, true)
    //   // })
    //   selectsPointsStrict.value = ids
    // },
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
    remove(ids){
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
          // active(id, false)
        }
      })
    },
    clear() {
      // selectsPointsStrict.value.forEach((id) => {
      //   active(id, false)
      // })
      selectsPointsStrict.value = []
    },
  }
}

export function useSelectLines() {
  let selectsLines= useSelectLinesInteraction()
  let selectLinesInteractionQuery = useSelectLinesInteractionQuery()
  let linesEntitie = useLinesEntitie()
  let linesGeometryQuery = useLinesGeometryQuery()
  function active(id, enabled) {
    let pointsGeometry = linesGeometryQuery.get(id)
    let index = linesGeometryQuery.indexOf(pointsGeometry)
    linesEntitie.active(index, enabled)
  }
  return {
    set(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids = ids.filter((id) => {
        return selectLinesInteractionQuery.check(id)
      })
      selectsLines.value.forEach((id) => {
        active(id, false)
      })
      ids.forEach((id) => {
        active(id, true)
      })
      selectsLines.value = ids
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
    remove(ids){
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
        }
      })
    },
    clear() {
      selectsLines.value.forEach((id) => {
        active(id, false)
      })
      selectsLines.value = []
    },
  }
}
