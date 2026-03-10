import { worldCoords2planeCoords } from '../utils/simple'
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
  static getContext(key) {
    return ConstraintResolver.context.get(key)
  }
  solverUsable(selectGeometrys) {
    return ConstraintResolver.rulers
      .filter((ruler, index) => {
        return ruler.applyUsable(selectGeometrys)
      })
      .map((ruler) => ConstraintResolver.names[ConstraintResolver.rulers.indexOf(ruler)])
  }
  solverAttach(name, selectGeometrys) {
    let index = ConstraintResolver.names.indexOf(name)
    let ruler = ConstraintResolver.rulers[index]
    return ruler.applyAttach(name, selectGeometrys)
  }
  solverUnattach(id) {
    let constraintsRelationQuery = ConstraintResolver.getContext('constraintsRelationQuery')
    let constraintsRelationManager = ConstraintResolver.getContext('constraintsRelationManager')
    let constraintsManager = ConstraintResolver.getContext('constraintsManager')

    let constraintRelation = constraintsRelationQuery.get(id)
    let { constraints, type } = constraintRelation
    constraintsRelationManager.removeById(id)
    constraints.forEach((constraint) => {
      constraintsManager.removeById(constraint)
    })

    let index = ConstraintResolver.names.indexOf(type)
    let ruler = ConstraintResolver.rulers[index]
    return ruler.applyUnattach(constraintRelation)
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
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      selectGeometrys.length > 1 && selectGeometrys.every((id) => pointsGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selectGeometrys.length - 1; i++) {
      let current = selectGeometrys[i]
      let next = selectGeometrys[i + 1]
      let constraint = constraintsManager[name].apply(constraintsManager, [current, next])
      geometrys.push([current, next])
      constraints.push(constraint.id)
    }
    constraintsRelationManager.add(name, geometrys, constraints)
  })
  .unattach(function (constraintRelation) {
    let context = this.getContext()
    let polylinesGeometryMapper = context.get('polylinesGeometryMapper')
    let polylinesGeometryManager = context.get('polylinesGeometryManager')
    let { geometrys } = constraintRelation
    geometrys.forEach((items) => {
      items.forEach((id) => {
        //polyline
        if (polylinesGeometryMapper.hasFormPointId(id)) {
          polylinesGeometryManager.splitByPointId(id)
        }
      })
    })
  })
ConstraintResolver.registryRuler('addConstraintCoordinateX')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      selectGeometrys.length !== 0 && selectGeometrys.every((id) => pointsGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let planesGeometryQuery = context.get('planesGeometryQuery')
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selectGeometrys.length; i++) {
      let point = pointsGeometryQuery.get(selectGeometrys[i])
      let plane = planesGeometryQuery.get(point.plane)
      let [u, v] = worldCoords2planeCoords([point.x, point.y, point.z], plane)
      let constraint = constraintsManager[name].apply(constraintsManager, [point.id, u])
      geometrys.push([point.id])
      constraints.push(constraint.id)
    }
    constraintsRelationManager.add(name, geometrys, constraints)
  })
ConstraintResolver.registryRuler('addConstraintCoordinateY')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      selectGeometrys.length !== 0 && selectGeometrys.every((id) => pointsGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let planesGeometryQuery = context.get('planesGeometryQuery')
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selectGeometrys.length; i++) {
      let point = pointsGeometryQuery.get(selectGeometrys[i])
      let plane = planesGeometryQuery.get(point.plane)
      let [u, v] = worldCoords2planeCoords([point.x, point.y, point.z], plane)
      let constraint = constraintsManager[name].apply(constraintsManager, [point.id, v])
      geometrys.push([point.id])
      constraints.push(constraint.id)
    }
    constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintCoordinate')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      selectGeometrys.length !== 0 && selectGeometrys.every((id) => pointsGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let planesGeometryQuery = context.get('planesGeometryQuery')
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selectGeometrys.length; i++) {
      let point = pointsGeometryQuery.get(selectGeometrys[i])
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

ConstraintResolver.registryRuler('addConstraintArcRules').attach(function (name, selectGeometrys) {
  let context = this.getContext()
  let constraintsManager = context.get('constraintsManager')
  let constraintsRelationManager = context.get('constraintsRelationManager')
  let arcsGeometryQuery = context.get('arcsGeometryQuery')
  let arc = arcsGeometryQuery.get(selectGeometrys[0])
  let constraint = constraintsManager[name].apply(constraintsManager, [arc.id])
  let geometrys = [[arc.id]]
  let constraints = [constraint.id]
  constraintsRelationManager.add(name, geometrys, constraints)
})

/* [下周功能]
 * 删除约束需要在这里定义unattach来实现逻辑细节，并提供solverUnattach。比如：取消重合的地方可能需要处理polyline ko
 * 将调用方法放到constraint-dispatch去使用 ko
 * 文件名称改为data-constraint ko
 * usable优化 不需要type数据（有上下文功能了）ko
 * 基准面交互
 */
