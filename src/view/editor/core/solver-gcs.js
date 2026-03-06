export class ConstraintUsableResolver {
  constructor() {}
  static rules = new Map()
  static registryRule(name, fn) {
    ConstraintUsableResolver.rules.set(fn, name)
  }
  solver(selects) {
    return ConstraintUsableResolver.rules
      .keys()
      .filter((fn) => {
        return fn(selects)
      })
      .map((fn) => ConstraintUsableResolver.rules.get(fn))
  }
}

// ConstraintUsableResolver.registryRule('addConstraintP2PDistance', (selects) => {
//   return selects.length === 2 && selects.every(({type}) => type === 'point')
// })

ConstraintUsableResolver.registryRule('addConstraintCoordinateX', (selects) => {
  return selects.length !== 0 && selects.every(({ type }) => type === 'point')
})

ConstraintUsableResolver.registryRule('addConstraintCoordinateY', (selects) => {
  return selects.length !== 0 && selects.every(({ type }) => type === 'point')
})

ConstraintUsableResolver.registryRule('addConstraintP2PCoincident', (selects) => {
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
  solverUsable(selects) {
    return ConstraintResolver.rulers
      .filter((ruler, index) => {
        return ruler.applyUsable(selects)
      })
      .map((ruler) => ConstraintResolver.names[ConstraintResolver.rulers.indexOf(ruler)])
  }
  solverAttach(name, selects) {
    let index = ConstraintResolver.names.indexOf(name)
    let ruler = ConstraintResolver.rulers[index]
    return ruler.applyAttach(name, selects)
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
  #usable = () => {}
  usable(fn) {
    this.#usable = fn
    return this
  }
  applyUsable(...args) {
    return this.#usable.apply(this, args)
  }
  #attach = () => {}
  attach(fn) {
    this.#attach = fn
    return this
  }
  applyAttach(...args) {
    return this.#attach.apply(this, args)
  }
  #unattach = () => {}
  unattach(fn) {
    this.#unattach = fn
    return this
  }
  applyUnattach(...args) {
    return this.#unattach.apply(this, args)
  }
}

ConstraintResolver.registryRuler('addConstraintP2PCoincident')
  .usable((selects) => {
    return selects.length > 1 && selects.every(({ type }) => type === 'point')
  })
  .attach(function (name, selects) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selects.length - 1; i++) {
      let current = selects[i]
      let next = selects[i + 1]
      let constraint = constraintsManager[name].apply(constraintsManager, [current.id, next.id])
      geometrys.push([current.id, next.id])
      constraints.push(constraint.id)
    }
    constraintsRelationManager.add(name, geometrys, constraints)
  })
ConstraintResolver.registryRuler('addConstraintCoordinateX')
  .usable((selects) => {
    return selects.length !== 0 && selects.every(({ type }) => type === 'point')
  })
  .attach(function (name, selects) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let planesGeometryQuery = context.get('planesGeometryQuery')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selects.length; i++) {
      let point = selects[i]
      let plane = planesGeometryQuery.get(point.plane)
      let [u, v] = worldCoords2planeCoords([point.x, point.y, point.z], plane)
      let constraint = constraintsManager[name].apply(constraintsManager, [point.id, u])
      geometrys.push([point.id])
      constraints.push(constraint.id)
    }
    constraintsRelationManager.add(name, geometrys, constraints)
  })
ConstraintResolver.registryRuler('addConstraintCoordinateY')
  .usable((selects) => {
    return selects.length !== 0 && selects.every(({ type }) => type === 'point')
  })
  .attach(function (name, selects) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let planesGeometryQuery = context.get('planesGeometryQuery')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selects.length; i++) {
      let point = selects[i]
      let plane = planesGeometryQuery.get(point.plane)
      let [u, v] = worldCoords2planeCoords([point.x, point.y, point.z], plane)
      let constraint = constraintsManager[name].apply(constraintsManager, [point.id, v])
      geometrys.push([point.id])
      constraints.push(constraint.id)
    }
    constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintCoordinate')
  .usable((selects) => {
    return selects.length !== 0 && selects.every(({ type }) => type === 'point')
  })
  .attach(function (name, selects) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let planesGeometryQuery = context.get('planesGeometryQuery')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selects.length; i++) {
      let point = selects[i]
      let plane = planesGeometryQuery.get(point.plane)
      let [u, v] = worldCoords2planeCoords([point.x, point.y, point.z], plane)
      let constraintX = constraintsManager['addConstraintCoordinateX'].apply(constraintsManager, [
        point.id,
        u,
      ])
      geometrys.push([point.id])
      constraints.push(constraintX.id)
      let constraintY = constraintsManager['addConstraintCoordinateY'].apply(constraintsManager, [
        point.id,
        v,
      ])
      geometrys.push([point.id])
      constraints.push(constraintY.id)
    }
    constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintArcRules').attach(function (name, selects) {
  let context = this.getContext()
  let constraintsManager = context.get('constraintsManager')
  let constraintsRelationManager = context.get('constraintsRelationManager')
  let arc = selects[0]
  let constraint = constraintsManager[name].apply(constraintsManager, [arc.id])
  let geometrys = [[arc.id]]
  let constraints = [constraint.id]
  constraintsRelationManager.add(name, geometrys, constraints)
})



/* [问题]
 * 删除约束需要在这里定义unattach来实现逻辑细节，并提供solverUnattach。比如：取消重合的地方可能需要处理polyline
 * 将调用方法放到constraint-dispatch去使用
 * 文件名称改为data-onstraint
 */