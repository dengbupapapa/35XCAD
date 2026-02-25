import {
  usePoints as usePointsGeometryManager,
  useArcs as useArcsGeometryManager,
  useLines as useLinesGeometryManager,
} from './geometry-manager'
import { useArcs as useArcsGeometryMapper } from './geometry-mapper'
import { throttle } from 'lodash-es'
export default function useGeometry() {
  let pointsGeometryUpdater = usePoints()
  let linesGeometryUpdater = useLines()
  return {
    update(batch) {
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
        if (Object.keys(position).length === 2 && position.start instanceof Array && position.end instanceof Array) {
          prev.push(...linesGeometryUpdater.updateCommit(index, position))
          return prev
        }
      }, [])

      pointsGeometryUpdater.updateApply(numerals)
    },
  }
}

export function usePoints() {
  let pointsGeometryManager = usePointsGeometryManager()
  let arcsGeometryMapper = useArcsGeometryMapper()
  let arcsGeometryManager = useArcsGeometryManager()
  return {
    updateCommit(index, position) {
      if (arcsGeometryMapper.getFormPointIndex(index)) {
        return arcsGeometryManager.updateCommit(index, position)
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
  return {
    updateImmediate(index, position) {
      let numerals = this.updateCommit(index, position)
      pointsGeometryUpdater.updateApply(numerals)
    },
    update: throttle(function (index, position) {
      return this.updateImmediate(index, position)
    }, 16),
    updateCommit(index, position) {
      return linesGeometryManager.updateCommit(index, position)
    },
  }
}
