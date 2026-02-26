export class ConstraintAvailabilityResolver {
  constructor() {}
  static rules = new Map()
  static registryRule(name, fn) {
    rules.set(fn, name)
  }
  solver(selects) {
    return ConstraintAvailabilityResolver.rules
      .keys()
      .filter((fn) => {
        return fn(selects)
      })
      .map((fn) => ConstraintAvailabilityResolver.rules.get(fn))
  }
}

ConstraintAvailabilityResolver.registryRule('addConstraintP2PDistance', (selects) => {
  return selects.length === 2 && selects.every((type) => type === 'point')
})

ConstraintAvailabilityResolver.registryRule('addConstraintCoordinateX', (selects) => {
  return selects.length !== 0 && selects.every((type) => type === 'point')
})

ConstraintAvailabilityResolver.registryRule('addConstraintCoordinateY', (selects) => {
  return selects.length !== 0 && selects.every((type) => type === 'point')
})

ConstraintAvailabilityResolver.registryRule('addConstraintP2PCoincident', (selects) => {
  return selects.length !== 0 && selects.every((type) => type === 'point')
})


