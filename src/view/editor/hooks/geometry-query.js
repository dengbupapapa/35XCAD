// import { computed } from 'vue'
import {
  usePlanes as usePlanesGeometry,
  usePoints as usePointsGeometry,
  useLines as useLinesGeometry,
  usePolylines as usePolylinesGeometry,
  useArcs as useArcsGeometry,
  useDimensionDistances as useDimensionDistancesGeometry,
  useDimensionAngles as useDimensionAnglesGeometry,
  usePlanesHash as usePlanesHashGeometry,
  usePointsHash as usePointsHashGeometry,
  useLinesHash as useLinesHashGeometry,
  usePolylinesHash as usePolylinesHashGeometry,
  useArcsHash as useArcsHashGeometry,
  useDimensionDistancesHash as useDimensionDistancesHashGeometry,
  useDimensionDistancesCreatorHash as useDimensionDistancesCreatorHashGeometry,
  useDimensionAnglesHash as useDimensionAnglesHashGeometry,
  useIncrement as useIncrementGeometry,
  useChars as useCharsGeometry,
  useCharsHash as useCharsHashGeometry,
} from './geometry-provide-context.js'

export function usePlanes() {
  let planes = usePlanesGeometry()
  let planesHash = usePlanesHashGeometry()
  return {
    get(id) {
      return planesHash.value[id]
    },
    getByIndex(index) {
      return planes.value[index]
    },
    indexOf(plane) {
      return planes.value.indexOf(plane)
    },
    get active() {
      return planes.value.find(({ active }) => active)
    },
    all() {
      return planes.value
    },
  }
}
export function usePoints() {
  let points = usePointsGeometry()
  let pointsHash = usePointsHashGeometry()
  return {
    get(id) {
      return pointsHash.value[id]
    },
    getByIndex(index) {
      return points.value[index]
    },
    indexOf(point) {
      return points.value.indexOf(point)
    },
    has(point) {
      return points.value.includes(point)
    },
    hasById(id) {
      return !!this.get(id)
    },
    all() {
      return points.value
    },
  }
}
export function useLines() {
  let lines = useLinesGeometry()
  let linesHash = useLinesHashGeometry()
  return {
    get(id) {
      return linesHash.value[id]
    },
    getByIndex(index) {
      return lines.value[index]
    },
    indexOf(point) {
      return lines.value.indexOf(point)
    },
    has(line) {
      return lines.value.includes(line)
    },
    hasById(id) {
      return !!this.get(id)
    },
    all() {
      return lines.value
    },
    getFormPoint(point) {
      let line = this.get(point.creator)
      return line
    },
    hasFormPoint(point) {
      return !!this.getFormPoint(point)
    },
  }
}
export function usePolylines() {
  let polylines = usePolylinesGeometry()
  let polylinesHash = usePolylinesHashGeometry()
  return {
    get(id) {
      return polylinesHash.value[id]
    },
    getByIndex(index) {
      return polylines.value[index]
    },
    indexOf(polyline) {
      return polylines.value.indexOf(polyline)
    },
    has(polyline) {
      return polylines.value.includes(polyline)
    },
    hasById(id) {
      return !!this.get(id)
    },
    all() {
      return polylines.value
    },
  }
}
export function useArcs() {
  let arcs = useArcsGeometry()
  let arcsHash = useArcsHashGeometry()
  return {
    get(id) {
      return arcsHash.value[id]
    },
    getByIndex(index) {
      return arcs.value[index]
    },
    indexOf(point) {
      return arcs.value.indexOf(point)
    },
    all() {
      return arcs.value
    },
    has(arc) {
      return arcs.value.includes(arc)
    },
    hasById(id) {
      return !!this.get(id)
    },
    getFormPoint(point) {
      let arc = this.get(point.creator)
      return arc
    },
    getFormCenter(point) {
      let arc = this.getFormPoint(point)
      if (arc.center === point.id) {
        return arc
      }
    },
    getFormStart(point) {
      let arc = this.getFormPoint(point)
      if (arc.start === point.id) {
        return arc
      }
    },
    getFormEnd(point) {
      let arc = this.getFormPoint(point)
      if (arc.end === point.id) {
        return arc
      }
    },
    hasFormPoint(point) {
      return !!this.getFormPoint(point)
    },
    hasFormCenter(point) {
      return !!this.getFormCenter(point)
    },
    hasFormStart(point) {
      return !!this.getFormStart(point)
    },
    hasFormEnd(point) {
      return !!this.getFormEnd(point)
    },
  }
}

export function useDimensionDistances() {
  let dimensionDistances = useDimensionDistancesGeometry()
  let dimensionDistancesHash = useDimensionDistancesHashGeometry()
  let dimensionDistancesCreatorHashGeometry = useDimensionDistancesCreatorHashGeometry()
  return {
    get(id) {
      return dimensionDistancesHash.value[id]
    },
    getByIndex(index) {
      return dimensionDistances.value[index]
    },
    getByCreator(id) {
      let dimensionDistanceId = dimensionDistancesCreatorHashGeometry.value[id]
      if (dimensionDistanceId) {
        return dimensionDistancesHash.value[dimensionDistanceId]
      }
    },
    indexOf(dimensionDistance) {
      return dimensionDistances.value.indexOf(dimensionDistance)
    },
    has(dimensionDistance) {
      return dimensionDistances.value.includes(dimensionDistance)
    },
    hasById(id) {
      return !!this.get(id)
    },
    hasByCreator(id) {
      return !!this.getByCreator(id)
    },
    all() {
      return dimensionDistances.value
    },
  }
}

export function useDimensionAngles() {
  let dimensionAngles = useDimensionAnglesGeometry()
  let dimensionAnglesHash = useDimensionAnglesHashGeometry()
  return {
    get(id) {
      return dimensionAnglesHash.value[id]
    },
    getByIndex(index) {
      return dimensionAngles.value[index]
    },
    indexOf(dimensionAngle) {
      return dimensionAngles.value.indexOf(dimensionAngle)
    },
    has(dimensionAngle) {
      return dimensionAngles.value.includes(dimensionAngle)
    },
    hasById(id) {
      return !!this.get(id)
    },
    all() {
      return dimensionAngles.value
    },
  }
}

export function useChars() {
  let chars = useCharsGeometry()
  let charsHash = useCharsHashGeometry()
  return {
    get(id) {
      return charsHash.value[id]
    },
    getByIndex(index) {
      return chars.value[index]
    },
    indexOf(char) {
      return chars.value.indexOf(char)
    },
    has(char) {
      return chars.value.includes(char)
    },
    hasById(id) {
      return !!this.get(id)
    },
    all() {
      return chars.value
    },
  }
}

export function useIncrement() {
  let incrementGeometry = useIncrementGeometry()
  return {
    get() {
      return ++incrementGeometry.value
    },
  }
}
