import {
  useArcs as useArcsGeometryQuery,
  useLines as useLinesGeometryQuery,
  usePoints as usePointsGeometryQuery,
  usePolylines as usePolylinesGeometryQuery,
  useDimensionDistances as useDimensionDistancesGeometryQuery,
  useTexts as useTextsGeometryQuery,
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
  let textsGeometryMapper = useTexts()
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
          if (textsGeometryMapper.hasFormPoint(point)) {
            let text = textsGeometryMapper.getFormPoint(point)
            prev.texts.push(text.id)
          }

          return prev
        },
        {
          arcs: [],
          lines: [],
          texts: [],
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
  let textsGeometryQuery = useTextsGeometryQuery()
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
          dimensionDistance.points.forEach((id) => {
            prev.points.push(id)
          })
          prev.lines.push(...dimensionDistance.lines)
          prev.texts.push(dimensionDistance.text)
          let textGeometry = textsGeometryQuery.get(dimensionDistance.text)
          prev.points.push(textGeometry.point)
          return prev
        },
        { points: [], lines: [], texts: [] },
      )
    },
    getFormPoint(point) {
      let line = linesGeometryQuery.get(point?.creator)
      let text = textsGeometryQuery.get(point?.creator)

      return (
        dimensionDistancesGeometryQuery.get(line?.creator) ||
        dimensionDistancesGeometryQuery.get(point?.creator) ||
        dimensionDistancesGeometryQuery.get(text?.creator)
      )
      // if (textsGeometryMapper.hasFormPoint(point)) {
      //   let text = textsGeometryMapper.getFormPoint(point)
      //   if (this.hasFormText(text)) {
      //     return dimensionDistancesGeometryQuery.get(text?.creator)
      //   }
      // }
      // let dimensionDistance = dimensionDistancesGeometryQuery.get(line?.creator)
      // return dimensionDistance
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

    getFormText(text) {
      let dimensionDistance = dimensionDistancesGeometryQuery.get(text?.creator)
      return dimensionDistance
    },
    getFormTextId(id) {
      let text = textsGeometryQuery.get(id)
      return this.getFormText(text)
    },
    hasFormText(text) {
      return !!this.getFormText(text)
    },
    hasFormTextId(id) {
      return !!this.getFormTextId(id)
    },
  }
}

export function useTexts() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let textsGeometryQuery = useTextsGeometryQuery()
  return {
    getFormPoint(point) {
      let text = textsGeometryQuery.get(point?.creator)
      return text
    },
    getFormPointId(id) {
      let point = pointsGeometryQuery.get(id)
      return this.getFormPoint(point)
    },
    hasFormPoint(point) {
      return !!this.getFormPoint(point)
    },
    hasFormPointId(id) {
      return !!this.getFormPointId(id)
    },
  }
}

export function useHelpers() {
  let dimensionDistancesGeometryMapper = useDimensionDistances()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    hasFormPoint(point) {
      return dimensionDistancesGeometryMapper.hasFormPoint(point)
    },
    hasFormPointId(id) {
      let point = pointsGeometryQuery.get(id)
      return this.hasFormPoint(point)
    },
    hasFormLine(line) {
      return dimensionDistancesGeometryMapper.hasFormLine(line)
    },
    hasFormLineId(id) {
      return dimensionDistancesGeometryMapper.hasFormLineId(id)
    },
  }
}
