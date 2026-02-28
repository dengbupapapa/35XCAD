import {
  useConstraints as useConstraintsGeometry,
  useConstraintsHash as useConstraintsHashGeometry,
  useConstraintsPlaneHash as useConstraintsPlaneHashGeometry,
  useConstraintsIncrement as useConstraintsIncrementGeometry,
} from './constraint-provide-context.js'

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
