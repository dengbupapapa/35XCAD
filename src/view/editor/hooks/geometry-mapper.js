import {
  useArcs as useArcsGeometryQuery,
  useLines as useLinesGeometryQuery,
  usePoints as usePointsGeometryQuery,
  usePolylines as usePolylinesGeometryQuery,
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
  }
}
export function useLines() {
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
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
          return prev
        },
        { points: [] },
      )
    },
    superior(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      return batch.reduce(
        (prev, id) => {
          let line = linesGeometryQuery.get(id)
          prev.polylines.push(line.creator)
          return prev
        },
        { polylines: [] },
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
