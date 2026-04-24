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
  static context = new Map()
  static setContext(key, object) {
    ConstraintResolver.context.set(key, object)
  }
  static getContext(key) {
    return ConstraintResolver.context.get(key)
  }
  #content = new Map()
  constructor(options) {
    // ConstraintResolver.context.entries().forEach(([key, value]) => {
    //   if (options?.effectDdebounce && key === 'constraintsManager') {
    //     this.#content.set(key, ConstraintResolver.getContext('constraintsManagerEffectDdebounce'))
    //     return
    //   }
    //   this.#content.set(key, value)
    // })
    // console.log(this.#content)
    // if (options?.effectDdebounce && key==='constraintsManager') {
    // } else {
    // }
    // console.log(options?.effectDdebounce)
    // let constraintsManagerEffectDdebounce = ConstraintResolver.getContext(
    //   'constraintsManagerEffectDdebounce',
    // )
    // let constraintsManager = ConstraintResolver.getContext('constraintsManager')
    // ConstraintResolver.setContext('constraintsManager', function () {
    //   console.log(options?.effectDdebounce)
    //   if (options?.effectDdebounce) {
    //     return constraintsManagerEffectDdebounce
    //   }
    //   return constraintsManager
    // })
  }
  solverUsable(args) {
    return ConstraintResolver.rulers
      .filter((ruler, index) => {
        return ruler.applyUsable(args)
      })
      .map((ruler) => ConstraintResolver.names[ConstraintResolver.rulers.indexOf(ruler)])
  }
  solverAttach(name, args, driving, tag) {
    let index = ConstraintResolver.names.indexOf(name)
    let ruler = ConstraintResolver.rulers[index]
    return ruler.applyAttach(name, args, driving, tag)
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
    return constraintsRelationManager.add(name, geometrys, constraints)
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
    return constraintsRelationManager.add(name, geometrys, constraints)
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
    return constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintCoordinate')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      selectGeometrys.length !== 0 && selectGeometrys.every((id) => pointsGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys, driving, tag) {
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
        driving,
        tag,
      ])
      geometrys.push([point.id])
      constraints.push(constraintX.id)
      let constraintY = constraintsManager['addConstraintCoordinateY'].apply(constraintsManager, [
        point.id,
        v,
        driving,
        tag,
      ])
      geometrys.push([point.id])
      constraints.push(constraintY.id)
    }
    return constraintsRelationManager.add(name, geometrys, constraints)
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
  return constraintsRelationManager.add(name, geometrys, constraints)
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
    return constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintPointOnLine2')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      selectGeometrys.length > 2 && selectGeometrys.every((id) => pointsGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let geometrys = []
    let constraints = []
    let points = [...selectGeometrys]
    let pointLine = points.splice(0, 2)
    points.forEach((point) => {
      let constraint = constraintsManager[name].apply(constraintsManager, [point, ...pointLine])
      geometrys.push([...selectGeometrys])
      constraints.push(constraint.id)
    })
    return constraintsRelationManager.add(name, geometrys, constraints)
  })

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
    return constraintsRelationManager.add(name, geometrys, constraints)
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
    return constraintsRelationManager.add(name, geometrys, constraints)
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
    let constraints = [constraint.id]
    return constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintEqualLength')
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
    return constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintHorizontal')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let linesGeometryQuery = context.get('linesGeometryQuery')
    return (
      selectGeometrys.length > 0 && selectGeometrys.every((id) => linesGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selectGeometrys.length; i++) {
      let line = selectGeometrys[i]
      let constraint = constraintsManager[name].apply(constraintsManager, [line])
      geometrys.push([line])
      constraints.push(constraint.id)
    }
    return constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintVertical')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let linesGeometryQuery = context.get('linesGeometryQuery')
    return (
      selectGeometrys.length > 0 && selectGeometrys.every((id) => linesGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let geometrys = []
    let constraints = []
    for (let i = 0; i < selectGeometrys.length; i++) {
      let line = selectGeometrys[i]
      let constraint = constraintsManager[name].apply(constraintsManager, [line])
      geometrys.push([line])
      constraints.push(constraint.id)
    }
    return constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintHorizontal2')
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
    return constraintsRelationManager.add(name, geometrys, constraints)
  })
ConstraintResolver.registryRuler('addConstraintVertical2')
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
    return constraintsRelationManager.add(name, geometrys, constraints)
  })

ConstraintResolver.registryRuler('addConstraintMidpointOnLine')
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
    let line1 = selectGeometrys[0]
    let line2 = selectGeometrys[1]
    let constraint = constraintsManager[name].apply(constraintsManager, [line1, line2])
    return constraintsRelationManager.add(name, [[line1, line2]], [constraint.id])
  })
ConstraintResolver.registryRuler('addConstraintMidpointOnLine2')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      selectGeometrys.length === 4 && selectGeometrys.every((id) => pointsGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let point1 = selectGeometrys[0]
    let point2 = selectGeometrys[1]
    let point3 = selectGeometrys[2]
    let point4 = selectGeometrys[3]
    let constraint = constraintsManager[name].apply(constraintsManager, [
      point1,
      point2,
      point3,
      point4,
    ])
    return constraintsRelationManager.add(name, [[point1, point2, point3, point4]], [constraint.id])
  })

ConstraintResolver.registryRuler('addConstraintP2PSymmetric')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      selectGeometrys.length === 3 && selectGeometrys.every((id) => pointsGeometryQuery.hasById(id))
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let point1 = selectGeometrys[0]
    let point2 = selectGeometrys[1]
    let point = selectGeometrys[2]
    let constraint = constraintsManager[name].apply(constraintsManager, [point1, point2, point])
    return constraintsRelationManager.add(name, [[point1, point2, point]], [constraint.id])
  })

ConstraintResolver.registryRuler('addConstraintP2PSymmetric2')
  .usable(function (selectGeometrys) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let linesGeometryQuery = context.get('linesGeometryQuery')
    return (
      selectGeometrys.length === 3 &&
      selectGeometrys.filter((id) => pointsGeometryQuery.hasById(id)).length === 2 &&
      selectGeometrys.filter((id) => linesGeometryQuery.hasById(id)).length === 1
    )
  })
  .attach(function (name, selectGeometrys) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let linesGeometryQuery = context.get('linesGeometryQuery')
    let points = selectGeometrys.filter((id) => pointsGeometryQuery.hasById(id))
    let line = selectGeometrys.filter((id) => linesGeometryQuery.hasById(id))[0]
    let constraint = constraintsManager[name].apply(constraintsManager, [...points, line])
    return constraintsRelationManager.add(name, [[...points, line]], [constraint.id])
  })

ConstraintResolver.registryRuler('addConstraintP2PDistance')
  .usable(function (args) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return (
      args.length === 3 &&
      args.filter((id) => pointsGeometryQuery.hasById(id)).length === 2 &&
      args.filter((value) => typeof value === 'number')
    )
  })
  .attach(function (name, args, driving, tag) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    let points = args.filter((id) => pointsGeometryQuery.hasById(id))
    let distance = args.filter((value) => typeof value === 'number')[0]
    let constraint = constraintsManager[name].apply(constraintsManager, [
      ...points,
      distance,
      driving,
      tag,
    ])
    return constraintsRelationManager.add(name, [[...points]], [constraint.id])
  })

ConstraintResolver.registryRuler('addConstraintParallel2')
  .usable(function (args) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return args.length === 4 && args.every((id) => pointsGeometryQuery.hasById(id))
  })
  .attach(function (name, args) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let constraint = constraintsManager[name].apply(constraintsManager, [...args])
    return constraintsRelationManager.add(name, [[...args]], [constraint.id])
  })
ConstraintResolver.registryRuler('addConstraintPerpendicular2')
  .usable(function (args) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return args.length === 4 && args.every((id) => pointsGeometryQuery.hasById(id))
  })
  .attach(function (name, args) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let constraint = constraintsManager[name].apply(constraintsManager, [...args])
    return constraintsRelationManager.add(name, [[...args]], [constraint.id])
  })

ConstraintResolver.registryRuler('addConstraintP2PAngle')
  .usable(function (args) {
    let context = this.getContext()
    let pointsGeometryQuery = context.get('pointsGeometryQuery')
    return args.length === 2 && args.every((id) => pointsGeometryQuery.hasById(id))
  })
  .attach(function (name, args) {
    let context = this.getContext()
    let constraintsManager = context.get('constraintsManager')
    let constraintsRelationManager = context.get('constraintsRelationManager')
    let constraint = constraintsManager[name].apply(constraintsManager, [...args])
    return constraintsRelationManager.add(name, [[...args]], [constraint.id])
  })
