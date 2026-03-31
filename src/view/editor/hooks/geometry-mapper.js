import {
  useArcs as useArcsGeometryQuery,
  useLines as useLinesGeometryQuery,
  usePoints as usePointsGeometryQuery,
  usePolylines as usePolylinesGeometryQuery,
  useDimensionDistances as useDimensionDistancesGeometryQuery,
} from './geometry-query.js'

export function useGeometry() {
  let arcsGeometryQuery = useArcsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let polylinesGeometryQuery = usePolylinesGeometryQuery()
  return {
    typeById(id) {
      if (arcsGeometryQuery.hasById(id)) {
        return 'arc'
      }
      if (linesGeometryQuery.hasById(id)) {
        return 'line'
      }
      if (pointsGeometryQuery.hasById(id)) {
        return 'point'
      }
      if (polylinesGeometryQuery.hasById(id)) {
        return 'polyline'
      }
    },
  }
}

export function usePoints() {
  let linesGeometryQuery = useLinesGeometryQuery()
  let arcsGeometryQuery = useArcsGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let dimensionDistancesGeometryQuery = useDimensionDistancesGeometryQuery()
  return {
    superior(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      return batch.reduce(
        (prev, id) => {
          let point = pointsGeometryQuery.get(id)
          if (arcsGeometryQuery.hasFormPoint(point)) {
            let arc = arcsGeometryQuery.getFormPoint(point)
            prev.arcs.push(arc.id)
          }
          if (linesGeometryQuery.hasFormPoint(point)) {
            let line = linesGeometryQuery.getFormPoint(point)
            prev.lines.push(line.id)
          }

          return prev
        },
        {
          arcs: [],
          lines: [],
        },
      )
    },
    subordinate(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      return batch.reduce(
        (prev, id) => {
          if (dimensionDistancesGeometryQuery.hasByCreator(id)) {
            let dimensionDistance = dimensionDistancesGeometryQuery.getByCreator(id)
            prev.dimensionDistances.push(dimensionDistance.id)
            return prev
          }
          return prev
        },
        {
          dimensionDistances: [],
        },
      )
    },
  }
}
export function useLines() {
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let polylinesGeometryQuery = usePolylinesGeometryQuery()
  let dimensionDistancesGeometryQuery = useDimensionDistancesGeometryQuery()
  return {
    getFormPointIndex(index) {
      let point = pointsGeometryQuery.getByIndex(index)
      let line = linesGeometryQuery.getFormPoint(point)
      return line
    },
    subordinate(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      return batch.reduce(
        (prev, id) => {
          let line = linesGeometryQuery.get(id)
          prev.points.push(line.start, line.end)

          if (dimensionDistancesGeometryQuery.hasByCreator(id)) {
            let dimensionDistance = dimensionDistancesGeometryQuery.getByCreator(id)
            prev.dimensionDistances.push(dimensionDistance.id)
            return prev
          }

          return prev
        },
        { points: [], dimensionDistances: [] },
      )
    },
    superior(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      return batch.reduce(
        (prev, id) => {
          let line = linesGeometryQuery.get(id)
          if (polylinesGeometryQuery.hasById(line.creator)) {
            prev.polylines.push(line.creator)
          }
          if (dimensionDistancesGeometryQuery.hasById(line.creator)) {
            prev.dimensionDistances.push(line.creator)
          }
          return prev
        },
        { polylines: [], dimensionDistances: [] },
      )
    },
  }
}
export function usePolylines() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  let polylinesGeometryQuery = usePolylinesGeometryQuery()
  return {
    subordinate(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      return batch.reduce(
        (prev, id) => {
          let polyline = polylinesGeometryQuery.get(id)
          polyline.lines.forEach((id) => {
            let line = linesGeometryQuery.get(id)
            prev.points.push(line.start, line.end)
          })
          prev.lines.push(...polyline.lines)
          return prev
        },
        { points: [], lines: [] },
      )
    },
    getFormPoint(point) {
      let line = linesGeometryQuery.get(point?.creator)
      let polyline = polylinesGeometryQuery.get(line?.creator)
      return polyline
    },
    hasFormPoint(point) {
      return !!this.getFormPoint(point)
    },
    getFormPointId(id) {
      let point = pointsGeometryQuery.get(id)
      return this.getFormPoint(point)
    },
    hasFormPointId(id) {
      return !!this.getFormPointId(id)
    },
    getFormLine(line) {
      let polyline = polylinesGeometryQuery.get(line?.creator)
      return polyline
    },
    hasFormLine(line) {
      return !!this.getFormLine(line)
    },
    getFormLineId(id) {
      let line = linesGeometryQuery.get(id)
      return this.getFormLine(line)
    },
    hasFormLineId(id) {
      return !!this.getFormLineId(id)
    },
  }
}
export function useArcs() {
  let arcsGeometryQuery = useArcsGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    getFormPointIndex(index) {
      let point = pointsGeometryQuery.getByIndex(index)
      let arc = arcsGeometryQuery.getFormPoint(point)
      return arc
    },
    subordinate(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      return batch.reduce(
        (prev, id) => {
          let arc = arcsGeometryQuery.get(id)
          prev.points.push(arc.center, arc.start, arc.end)
          return prev
        },
        { points: [] },
      )
    },
  }
}

export function useDimensionDistances() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  let dimensionDistancesGeometryQuery = useDimensionDistancesGeometryQuery()
  return {
    getFormPointIndex(index) {
      let point = pointsGeometryQuery.getByIndex(index)
      let dimensionDistance = this.getFormPoint(point)
      return dimensionDistance
    },
    hasFormPointIndex(index) {
      return !!this.getFormPointIndex(index)
    },
    getFormLineIndex(index) {
      let line = linesGeometryQuery.getByIndex(index)
      let dimensionDistance = this.getFormLine(line)
      return dimensionDistance
    },
    hasFormLineIndex(index) {
      return !!this.getFormLineIndex(index)
    },
    subordinate(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      return batch.reduce(
        (prev, id) => {
          let dimensionDistance = dimensionDistancesGeometryQuery.get(id)
          dimensionDistance.lines.forEach((id) => {
            let line = linesGeometryQuery.get(id)
            prev.points.push(line.start, line.end)
          })
          prev.lines.push(...dimensionDistance.lines)
          return prev
        },
        { points: [], lines: [] },
      )
    },
    getFormPoint(point) {
      let line = linesGeometryQuery.get(point?.creator)
      let dimensionDistance = dimensionDistancesGeometryQuery.get(line?.creator)
      return dimensionDistance
    },
    hasFormPoint(point) {
      return !!this.getFormPoint(point)
    },
    getFormPointId(id) {
      let point = pointsGeometryQuery.get(id)
      return this.getFormPoint(point)
    },
    hasFormPointId(id) {
      return !!this.getFormPointId(id)
    },
    getFormLine(line) {
      let dimensionDistance = dimensionDistancesGeometryQuery.get(line?.creator)
      return dimensionDistance
    },
    hasFormLine(line) {
      return !!this.getFormLine(line)
    },
    getFormLineId(id) {
      let line = linesGeometryQuery.get(id)
      return this.getFormLine(line)
    },
    hasFormLineId(id) {
      return !!this.getFormLineId(id)
    },
  }
}

export function useHelpers() {
  let dimensionDistancesGeometryMapper = useDimensionDistances()
  return {
    hasFormPoint(point) {
      return dimensionDistancesGeometryMapper.hasFormPoint(point)
    },
    hasFormPointId(id) {
      return dimensionDistancesGeometryMapper.hasFormPointId(id)
    },
    hasFormLine(line) {
      return dimensionDistancesGeometryMapper.hasFormLine(line)
    },
    hasFormLineId(id) {
      return dimensionDistancesGeometryMapper.hasFormLineId(id)
    },
  }
}
