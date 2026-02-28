import { computed } from 'vue'
import {
  usePlanes as usePlanesGeometry,
  usePoints as usePointsGeometry,
  useLines as useLinesGeometry,
  usePolylines as usePolylinesGeometry,
  useArcs as useArcsGeometry,
  useConstraints as useConstraintsGeometry,
  usePlanesHash as usePlanesHashGeometry,
  usePointsHash as usePointsHashGeometry,
  useLinesHash as useLinesHashGeometry,
  usePolylinesHash as usePolylinesHashGeometry,
  useArcsHash as useArcsHashGeometry,
  useConstraintsHash as useConstraintsHashGeometry,
  useConstraintsPlaneHash as useConstraintsPlaneHashGeometry,
  useConstraintsIncrement as useConstraintsIncrementGeometry,
  useIncrement as useIncrementGeometry
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
    has(point){
      return points.value.includes(point)
    },
    hasById(id){
      return !!this.get(id)
    },
    all() {
      return points.value
    }
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
    has(line){
      return lines.value.includes(line)
    },
    hasById(id){
      return !!this.get(id)
    },
    all() {
      return lines.value
    },
    getFormPoint(line) {
      let arc = this.get(line.creator)
      return arc
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
    indexOf(point) {
      return polylines.value.indexOf(point)
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
  }
}
export function useConstraints() {
  let constraintsGeometry = useConstraintsGeometry()
  let constraintsHashGeometry = useConstraintsHashGeometry()
  let constraintsPlaneHashGeometry = useConstraintsPlaneHashGeometry()
  return {
    get(id) {
      return constraintsHashGeometry.value[id]
    },
    getByIndex(index) {
      return constraintsGeometry.value[index]
    },
    getByPlane(plane) {
      return constraintsPlaneHashGeometry.value[plane]
    },
    indexOf(constraint) {
      return constraintsGeometry.value.indexOf(constraint)
    },
    all() {
      return constraintsGeometry.value
    },
  }
}
export function useConstraintsIncrement() {
  let constraintsIncrementGeometry = useConstraintsIncrementGeometry()
  return {
    get() {
      return ++constraintsIncrementGeometry.value
    },
  }
}

export function useIncrement(){
  let incrementGeometry = useIncrementGeometry()
  return {
    get() {
      return ++incrementGeometry.value
    },
  }  
}