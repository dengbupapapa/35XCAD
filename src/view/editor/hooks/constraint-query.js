import {
  useConstraints as useConstraintsProvideContext,
  useConstraintsHash as useConstraintsHashProvideContext,
  useConstraintsPlaneHash as useConstraintsPlaneHashProvideContext,
  useConstraintsIncrement as useConstraintsIncrementProvideContext,
  useConstraintsRelation as useConstraintsRelationProvideContext,
  useConstraintsRelationHash as useConstraintsRelationHashProvideContext,
} from './constraint-provide-context.js'

export function useConstraints() {
  let constraintsProvideContext = useConstraintsProvideContext()
  let constraintsHashProvideContext = useConstraintsHashProvideContext()
  let constraintsPlaneHashProvideContext = useConstraintsPlaneHashProvideContext()
  return {
    get(id) {
      return constraintsHashProvideContext.value[id]
    },
    getByIndex(index) {
      return constraintsProvideContext.value[index]
    },
    getByPlane(plane) {
      return constraintsPlaneHashProvideContext.value[plane]
    },
    indexOf(constraint) {
      return constraintsProvideContext.value.indexOf(constraint)
    },
    all() {
      return constraintsProvideContext.value
    },
  }
}
export function useConstraintsIncrement() {
  let constraintsIncrementProvideContext = useConstraintsIncrementProvideContext()
  return {
    get() {
      return ++constraintsIncrementProvideContext.value
    },
  }
}

export function useConstraintsRelation() {
  let constraintsRelationProvideContext = useConstraintsRelationProvideContext()
  let constraintsRelationHashProvideContext = useConstraintsRelationHashProvideContext()
  return {
    get(id) {
      return constraintsRelationHashProvideContext.value[id]
    },
    getByIndex(index) {
      return constraintsRelationProvideContext.value[index]
    },
    indexOf(constraint) {
      return constraintsRelationProvideContext.value.indexOf(constraint)
    },
    all() {
      return constraintsRelationProvideContext.value
    },
  }
}
