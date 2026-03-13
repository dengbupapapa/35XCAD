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

ConstraintResolver.registryRuler('addConstraintPointOnLine')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let linesGeometryQuery = context.get('linesGeometryQuery')
    return (
      selectGeometrys.length > 1 &&
      selectGeometrys.filter((id) => pointsGeometryQuery.hasById(id)).length > 0 &&
      selectGeometrys.filter((id) => linesGeometryQuery.hasById(id)).length === 1
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let linesGeometryQuery = context.get('linesGeometryQuery')
    let pointsGeometry = selectGeometrys.filter((id) => pointsGeometryQuery.hasById(id))
    let linesGeometry = selectGeometrys.filter((id) => linesGeometryQuery.hasById(id))
    let line = linesGeometry[0]
    let geometrys = []
    let constraints = []
    pointsGeometry.forEach((point) => {
      let constraint = constraintsManager[name].apply(constraintsManager, [point, line])
      geometrys.push([point, line])
      constraints.push(constraint.id)
    })
    constraintsRelationManager.add(name, geometrys, constraints)
  })

// ConstraintResolver.registryRuler('addConstraintPointOnLine2')
//   .usable(function (selectGeometrys) {
//     let context = this.getContext()
//     let pointsGeometryQuery = context.get('pointsGeometryQuery')
//     let linesGeometryQuery = context.get('linesGeometryQuery')
//     return (
//       selectGeometrys.length > 1 &&
//       selectGeometrys.filter((id) => pointsGeometryQuery.hasById(id)).length > 0 &&
//       selectGeometrys.filter((id) => linesGeometryQuery.hasById(id)).length === 1
//     )
//   })
//   .attach(function (name, selectGeometrys) {
//     let context = this.getContext()
//     let constraintsManager = context.get('constraintsManager')
//     let constraintsRelationManager = context.get('constraintsRelationManager')
//     let pointsGeometryQuery = context.get('pointsGeometryQuery')
//     let linesGeometryQuery = context.get('linesGeometryQuery')
//     let pointsGeometry = selectGeometrys.filter((id) => pointsGeometryQuery.hasById(id))
//     let linesGeometry = selectGeometrys.filter((id) => linesGeometryQuery.hasById(id))
//     let line = linesGeometryQuery.get(linesGeometry[0])
//     let geometrys = []
//     let constraints = []
//     pointsGeometry.forEach((point) => {
//       let constraint = constraintsManager[name].apply(constraintsManager, [
//         point,
//         line.start,
//         line.end,
//       ])
//       geometrys.push([point, line])
//       constraints.push(constraint.id)
//     })
//     constraintsRelationManager.add(name, geometrys, constraints)
//   })

ConstraintResolver.registryRuler('addConstraintPointOnPerpBisector')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let linesGeometryQuery = context.get('linesGeometryQuery')
    return (
      selectGeometrys.length > 1 &&
      selectGeometrys.filter((id) => pointsGeometryQuery.hasById(id)).length > 0 &&
      selectGeometrys.filter((id) => linesGeometryQuery.hasById(id)).length === 1
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let linesGeometryQuery = context.get('linesGeometryQuery')
    let pointsGeometry = selectGeometrys.filter((id) => pointsGeometryQuery.hasById(id))
    let linesGeometry = selectGeometrys.filter((id) => linesGeometryQuery.hasById(id))
    let line = linesGeometry[0]
    let geometrys = []
    let constraints = []
    pointsGeometry.forEach((point) => {
      let constraint = constraintsManager[name].apply(constraintsManager, [point, line])
      geometrys.push([point, line])
      constraints.push(constraint.id)
    })
    constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintParallel')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let linesGeometryQuery = context.get('linesGeometryQuery')
    return (
      selectGeometrys.length > 1 && selectGeometrys.every((id) => linesGeometryQuery.hasById(id))
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

ConstraintResolver.registryRuler('addConstraintPerpendicular')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let linesGeometryQuery = context.get('linesGeometryQuery')
    return (
      selectGeometrys.length === 2 && selectGeometrys.every((id) => linesGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let constraint = constraintsManager[name].apply(constraintsManager, [
      selectGeometrys[0],
      selectGeometrys[1],
    ])
    let geometrys = [[selectGeometrys[0], selectGeometrys[1]]]
    let constraints = [constraint]
    constraintsRelationManager.add(name, geometrys, constraints)
  })
