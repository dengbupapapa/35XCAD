import { provide, inject, ref } from 'vue'

export default function useRegistry() {
  const constraints = ref([])
  const constraintsHash = ref({})
  const constraintsPlaneHash = ref({})
  const constraintsIncrement = ref(0)
  provide(constraintsSymbol, constraints)
  provide(constraintsHashSymbol, constraintsHash)
  provide(constraintsPlaneHashSymbol, constraintsPlaneHash)
  provide(constraintsIncrementSymbol, constraintsIncrement)
  const constraintsRelation = ref([])
  const constraintsRelationHash = ref({})
  // const constraintsRelationByTypeHash = ref({})
  provide(constraintsRelationSymbol, constraintsRelation)
  provide(constraintsRelationHashSymbol, constraintsRelationHash)
  const effectDdebouncePromise = {}
  provide(effectDdebouncePromiseSymbol, effectDdebouncePromise)
}

const constraintsSymbol = Symbol('constraints')
const constraintsHashSymbol = Symbol('constraintsHash')
const constraintsPlaneHashSymbol = Symbol('constraintsPlaneHash')
const constraintsIncrementSymbol = Symbol('constraintsIncrement')
const constraintsRelationSymbol = Symbol('constraintsRelation')
const constraintsRelationHashSymbol = Symbol('constraintsRelationHash')
const effectDdebouncePromiseSymbol = Symbol('effectDdebouncePromise')
export function useConstraints() {
  return inject(constraintsSymbol)
}
export function useConstraintsHash() {
  return inject(constraintsHashSymbol)
}
export function useConstraintsPlaneHash() {
  return inject(constraintsPlaneHashSymbol)
}
export function useConstraintsIncrement() {
  return inject(constraintsIncrementSymbol)
}
export function useConstraintsRelation() {
  return inject(constraintsRelationSymbol)
}
export function useConstraintsRelationHash() {
  return inject(constraintsRelationHashSymbol)
}
export function useEffectDdebouncePromise() {
  return inject(effectDdebouncePromiseSymbol)
}
