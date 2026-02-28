export class ConstraintAvailabilityResolver {
  constructor() {}
  static rules = new Map()
  static registryRule(name, fn) {
    ConstraintAvailabilityResolver.rules.set(fn, name)
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

// ConstraintAvailabilityResolver.registryRule('addConstraintP2PDistance', (selects) => {
//   return selects.length === 2 && selects.every(({type}) => type === 'point')
// })

ConstraintAvailabilityResolver.registryRule('addConstraintCoordinateX', (selects) => {
  return selects.length !== 0 && selects.every(({ type }) => type === 'point')
})

ConstraintAvailabilityResolver.registryRule('addConstraintCoordinateY', (selects) => {
  return selects.length !== 0 && selects.every(({ type }) => type === 'point')
})

ConstraintAvailabilityResolver.registryRule('addConstraintP2PCoincident', (selects) => {
  return selects.length !== 0 && selects.every(({ type }) => type === 'point')
})

import { planeCoords2worldCoords, worldCoords2planeCoords } from '../utils/simple'
export class ConstraintResolver {
  static names = []
  static rulers = []
  static registryRuler(name) {
    let ruler = new ConstraintResolverRuler()
    ruler.setContext(ConstraintResolver.context)
    ConstraintResolver.names.push(name)
    ConstraintResolver.rulers.push(ruler)
    return ruler
  }
  constructor() {}
  static context = new Map()
  static setContext(key, object) {
    ConstraintResolver.context.set(key, object)
  }
  solverAvailability(selects) {
    return ConstraintResolver.rulers
      .filter((ruler, index) => {
        return ruler.applyAvailability(selects)
      })
      .map((ruler) => ConstraintResolver.names[ConstraintResolver.rulers.indexOf(ruler)])
  }
  solverExecutor(name, selects) {
    let index = ConstraintResolver.names.indexOf(name)
    let ruler = ConstraintResolver.rulers[index]
    ruler.applyExecutor(name, selects)
  }
}

class ConstraintResolverRuler {
  constructor() {}
  #context = new Map()
  setContext(context) {
    this.#context = context
  }
  getContext() {
    return this.#context
  }
  #availability = () => {}
  availability(fn) {
    this.#availability = fn
    return this
  }
  applyAvailability(...args) {
    return this.#availability.apply(this, args)
  }
  #executor = () => {}
  executor(fn) {
    this.#executor = fn
    return this
  }
  applyExecutor(...args) {
    return this.#executor.apply(this, args)
  }
}

ConstraintResolver.registryRuler('addConstraintP2PCoincident')
  .availability((selects) => {
    return selects.length > 1 && selects.every(({ type }) => type === 'point')
  })
  .executor(function(name, selects){
    let context = this.getContext()
    let constraintsGeometryManager = context.get('constraintsGeometryManager')
    for (let i = 0; i < selects.length - 1; i++) {
      let current = selects[i]
      let next = selects[i + 1]
      constraintsGeometryManager[name].apply(constraintsGeometryManager, [current.id, next.id])
    }
  })
ConstraintResolver.registryRuler('addConstraintCoordinateX')
  .availability((selects) => {
    return selects.length !== 0 && selects.every(({ type }) => type === 'point')
  })
  .executor(function (name, selects) {
    let context = this.getContext()
    let constraintsGeometryManager = context.get('constraintsGeometryManager')
    let planesGeometryQuery = context.get('planesGeometryQuery')
    for (let i = 0; i < selects.length; i++) {
      let point = selects[i]
      let plane = planesGeometryQuery.get(point.plane)
      let [u, v] = worldCoords2planeCoords([point.x, point.y, point.z], plane)
      constraintsGeometryManager[name].apply(constraintsGeometryManager, [point.id, u])
    }
  })
ConstraintResolver.registryRuler('addConstraintCoordinateY')
  .availability((selects) => {
    return selects.length !== 0 && selects.every(({ type }) => type === 'point')
  })
  .executor(function (name, selects) {
    let context = this.getContext()
    let constraintsGeometryManager = context.get('constraintsGeometryManager')
    let planesGeometryQuery = context.get('planesGeometryQuery')
    for (let i = 0; i < selects.length; i++) {
      let point = selects[i]
      let plane = planesGeometryQuery.get(point.plane)
      let [u, v] = worldCoords2planeCoords([point.x, point.y, point.z], plane)
      constraintsGeometryManager[name].apply(constraintsGeometryManager, [point.id, v])
    }
  })
