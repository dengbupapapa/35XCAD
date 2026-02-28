import { computed } from 'vue'
import {
  useConstraints as useConstraintsProvideContext,
  useConstraintsHash as useConstraintsHashProvideContext,
  useConstraintsIncrement as useConstraintsIncrementProvideContext,
} from './constraint-provide-context.js'
export function useConstraint(id) {
  let constraintsProvideContext = useConstraintsHashProvideContext()
  return computed(() => {
    return constraintsProvideContext.value[id]
  })
}
export function useConstraints() {
  let constraintsProvideContext = useConstraintsProvideContext()
  return computed(() => {
    return constraintsProvideContext.value
  })
}
export function useConstraintsIncrement() {
  let constraintsIncrementProvideContext = useConstraintsIncrementProvideContext()
  return computed(() => {
    return constraintsIncrementProvideContext.value
  })
}
