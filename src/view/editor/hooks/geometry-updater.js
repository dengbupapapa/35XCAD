import {
  usePoints as usePointsGeometryManager,
  useArcs as useArcsGeometryManager,
  useLines as useLinesGeometryManager,
  useDimensionDistances as useDimensionDistancesGeometryManager,
} from './geometry-manager'
import {
  useArcs as useArcsGeometryMapper,
  useDimensionDistances as useDimensionDistancesGeometryMapper,
} from './geometry-mapper'
import {
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
} from './geometry-query'
import {
  useArcs as useArcsGeometryDispatch,
  useDimensionDistances as useDimensionDistancesGeometryDispatch,
} from './geometry-dispatch'
import { throttle } from 'lodash-es'
export default function useGeometrys() {
  let pointsGeometryUpdater = usePoints()
  let linesGeometryUpdater = useLines()
  return {
    updateBefore(ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids.forEach((id) => {
        pointsGeometryUpdater.updateBefore(id)
      })
    },
    updateAfter: function (ids) {
      if (!(ids instanceof Array)) {
        ids = [ids]
      }
      ids.forEach((id) => {
        pointsGeometryUpdater.updateAfter(id)
      })
    },
    //throttle(
    update: function (batch) {
      if (arguments.length === 2) {
        let index = arguments[0]
        let position = arguments[1]
        batch = [{ index, position }]
      }

      let numerals = batch.reduce((prev, { index, position }) => {
        if (position instanceof Array) {
          prev.push(...pointsGeometryUpdater.updateCommit(index, position))
          return prev
        }
        //从事件机制来看不会走这条路了
        // if (
        //   Object.keys(position).length === 2 &&
        //   position.start instanceof Array &&
        //   position.end instanceof Array
        // ) {
        //   prev.push(...linesGeometryUpdater.updateCommit(index, position))
        //   return prev
        // }
        return prev
      }, [])
      numerals = [...new Set(numerals)]
      pointsGeometryUpdater.updateApply(numerals)
      // batch.forEach(({ index, position }) => {
      //   pointsGeometryUpdater.updateReset(index, position)
      // })
    },
  }
}

let updatedOnce = new Set()
export function usePoints() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryManager = usePointsGeometryManager()
  let arcsGeometryMapper = useArcsGeometryMapper()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  let arcsGeometryDispatch = useArcsGeometryDispatch()
  let dimensionDistancesGeometryDispatch = useDimensionDistancesGeometryDispatch()

  return {
    updateBefore(id) {
      let dimensionDistance = dimensionDistancesGeometryMapper.getFormPointId(id)
      if (dimensionDistance) {
        if (updatedOnce.has(dimensionDistance.id)) return
        updatedOnce.add(dimensionDistance.id)
        dimensionDistancesGeometryDispatch.updateBefore(dimensionDistance.id)
      }
    },
    updateAfter(id) {
      let dimensionDistance = dimensionDistancesGeometryMapper.getFormPointId(id)
      if (dimensionDistance) {
        if (!updatedOnce.has(dimensionDistance.id)) return
        dimensionDistancesGeometryDispatch.updateAfter(dimensionDistance.id)
        updatedOnce.delete(dimensionDistance.id)
      }
    },
    updateCommit(index, position) {
      if (arcsGeometryMapper.getFormPointIndex(index)) {
        arcsGeometryDispatch.updateCommit(index, position)
      }
      if (dimensionDistancesGeometryMapper.getFormPointIndex(index)) {
        dimensionDistancesGeometryDispatch.updateCommit(index, position)
      }
      return pointsGeometryManager.updateCommit(index, position)
    },
    updateApply(numerals) {
      pointsGeometryManager.updateApply(numerals)
    },
    updateImmediate(index, position) {
      let numerals = this.updateCommit(index, position)
      this.updateApply(numerals)
    },
    update: throttle(function (index, position) {
      return this.updateImmediate(index, position)
    }, 16),
  }
}

export function useLines() {
  let linesGeometryManager = useLinesGeometryManager()
  let pointsGeometryUpdater = usePoints()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  return {
    updateCommit(index, position) {
      // if (dimensionDistancesGeometryMapper.getFormLineIndex(index)) {
      //   console.log('is dimensionDistance line')
      // }
      return linesGeometryManager.updateCommit(index, position)
    },
    updateImmediate(index, position) {
      let numerals = this.updateCommit(index, position)
      pointsGeometryUpdater.updateApply(numerals)
    },
    update: throttle(function (index, position) {
      return this.updateImmediate(index, position)
    }, 16),
  }
}
