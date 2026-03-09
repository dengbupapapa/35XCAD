import {
  useConstraints as useConstraintsProvideContext,
  useConstraintsHash as useConstraintsHashProvideContext,
  useConstraintsPlaneHash as useConstraintsPlaneHashProvideContext,
  useConstraintsIncrement as useConstraintsIncrementProvideContext,
  useConstraintsRelation as useConstraintsRelationProvideContext,
  useConstraintsRelationHash as useConstraintsRelationHashProvideContext,
} from './constraint-provide-context.js'
import {
  usePlanes as usePlanesGeometryQuery,
  usePoints as usePointsGeometryQuery,
} from './geometry-query.js'
import { usePoints as usePointsGeometryManager } from './geometry-manager.js'
import {
  useConstraints as useConstraintsQuery,
  useConstraintsIncrement as useConstraintsIncrementQuery,
  useConstraintsRelation as useConstraintsRelationQuery,
} from './constraint-query.js'
import {
  useToolTemp as useToolTempGCSManager,
  useConstraints as useConstraintsGCSManager,
  useSystems as useSystemsGCSManager,
} from './solver-gcs-manager.js'
import {
  useNumerals as useNumeralsGCSQuery,
  usePoints as usePointsGCSQuery,
  useUnknownsSet as useUnknownsSetGCSQuery,
  useResults as useResultsGCSQuery,
  useSystems as useSystemsGCSQuery,
} from './solver-gcs-query.js'
import { useArcs as useArcsGCSMapper } from './solver-gcs-mapper.js'
import { nanoid, assertIndexFormList } from '../utils/simple'
import { debounce } from 'lodash-es'
export function useConstraints() {
  let constraintsProvideContext = useConstraintsProvideContext()
  let constraintsHashProvideContext = useConstraintsHashProvideContext()
  let constraintsPlaneHashProvideContext = useConstraintsPlaneHashProvideContext()
  let constraintsIncrementQuery = useConstraintsIncrementQuery()
  let constraintsGCSManager = useConstraintsGCSManager()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let pointsGeometryManager = usePointsGeometryManager()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let constraintsQuery = useConstraintsQuery()
  let systemsGCSManager = useSystemsGCSManager()
  let systemsGCSQuery = useSystemsGCSQuery()
  let unknownsSetGCSQuery = useUnknownsSetGCSQuery()
  let resultsGCSQuery = useResultsGCSQuery()
  let numeralsGCSQuery = useNumeralsGCSQuery()
  let pointsGCSQuery = usePointsGCSQuery()
  let arcsGCSMapper = useArcsGCSMapper()
  let toolTempGCSManager = useToolTempGCSManager()

  let constraintsBatch = []
  function usageConstraintsBatch() {
    let numerals = []
    constraintsBatch.forEach((constraint) => {
      constraint.args.forEach((arg, index) => {
        /* [联动] 1
         * 找出与该约束有关的变量
         * 为了刷新某些变量
         */
        if (constraint.points instanceof Array && constraint.points.includes(index)) {
          let pointGeometry = pointsGeometryQuery.get(arg)
          let pointGCS = pointsGCSQuery.get(pointGeometry.gcs)
          let unknown = constraint.unknowns[index]
          if (!(unknown instanceof Array)) return
          if (unknown.includes('x')) {
            let numeralU = numeralsGCSQuery.get(pointGCS.u)
            numerals.push(numeralU)
          }
          if (unknown.includes('y')) {
            let numeralV = numeralsGCSQuery.get(pointGCS.v)
            numerals.push(numeralV)
          }
          return
        }
        if (constraint.arcs instanceof Array && constraint.arcs.includes(index)) {
          let arcsGCS = arcsGCSMapper.getByGeometry(arg)

          let pointGCSCenter = pointsGCSQuery.get(arcsGCS.center)
          let pointGCSStart = pointsGCSQuery.get(arcsGCS.start)
          let pointGCSEnd = pointsGCSQuery.get(arcsGCS.end)

          let numeralCenterU = numeralsGCSQuery.get(pointGCSCenter.u)
          let numeralCenterV = numeralsGCSQuery.get(pointGCSCenter.v)
          numerals.push(numeralCenterU)
          numerals.push(numeralCenterV)
          let numeralStartU = numeralsGCSQuery.get(pointGCSStart.u)
          let numeralStartV = numeralsGCSQuery.get(pointGCSStart.v)
          numerals.push(numeralStartU)
          numerals.push(numeralStartV)
          let numeralEndU = numeralsGCSQuery.get(pointGCSEnd.u)
          let numeralEndV = numeralsGCSQuery.get(pointGCSEnd.v)
          numerals.push(numeralEndU)
          numerals.push(numeralEndV)

          return
        }
      })
    })
    constraintsBatch = []
    return numerals
  }
  function updateGeometry() {
    let numeralsRelated = usageConstraintsBatch()

    let updatedPoints = new Set()
    function updated(ptr) {
      let numeralGCS = numeralsGCSQuery.getByPtr(ptr)
      let pointGCS = pointsGCSQuery.get(numeralGCS.creator)
      if (!pointGCS) return
      let pointGeometry = pointsGeometryQuery.get(pointGCS.creator)
      if (updatedPoints.has(pointGeometry)) {
        return true
      }
      updatedPoints.add(pointGeometry)
    }

    let stables = unknownsSetGCSQuery.stable()
    let stablesRelated = numeralsRelated.filter((numeral) => stables.includes(numeral))
    stablesRelated.forEach(({ ptr }) => {
      if (updated(ptr)) return
      pointsGeometryManager.updateByNumeralPtr(ptr)
    })

    let resultCurrent = resultsGCSQuery.get(systemsGCSQuery.active.result)
    let resultBackup = resultsGCSQuery.backup(systemsGCSQuery.active.result)
    // console.log(resultCurrent, resultBackup)
    // console.log(resultCurrent, numeralsRelated)
    ;[...resultCurrent.dependentsGroups, ...resultBackup.dependentsGroups].forEach((rows) => {
      if (numeralsRelated.some((numeral) => rows.includes(numeral.ptr))) {
        rows.forEach((ptr) => {
          if (updated(ptr)) return
          pointsGeometryManager.updateByNumeralPtr(ptr)
        })
      }
    })
  }

  let effect = debounce(function effect() {
    /* [问题]
     * 这段求解调用应该移到gcs里去
     */
    systemsGCSManager.reset()
    systemsGCSManager.solver()
    updateGeometry()

    systemsGCSQuery.active.handle.clearByTag(-1)
    toolTempGCSManager.clearNumerals()
  }, 16)

  return {
    updateNumerals(id, numerals) {
      let constraint = constraintsQuery.get(id)
      // if (constraint.numerals.length !== numerals.length) {
      //   throw new Error('constraint.numerals.length !== numerals.length!')
      // }
      constraint.numerals.forEach((index, i) => {
        constraint.args[index] = numerals[i]
      })
      // constraintsGCSManager.update(constraint)
      // effect()
    },
    add(constraint) {
      let tag = constraintsIncrementQuery.get()
      constraint.tag = tag
      constraint.id = nanoid()
      constraint.args.push(tag, true)
      constraint.plane = planesGeometryQuery?.active?.id

      this.attach(constraint)
    },
    attach(constraint) {
      let constraintGCS = constraintsGCSManager.add(constraint)
      constraintGCS.creator = constraint.id
      constraint.gcs = constraintGCS.id
      constraintsProvideContext.value.push(constraint)
      constraintsHashProvideContext.value[constraint.id] = constraint
      if (!(constraintsPlaneHashProvideContext.value[constraint.plane] instanceof Array)) {
        constraintsPlaneHashProvideContext.value[constraint.plane] = []
      }
      constraintsPlaneHashProvideContext.value[constraint.plane].push(constraint)
      constraintsBatch.push(constraint)
      effect()
    },
    load(constraintsProvideContext) {
      constraintsProvideContext.forEach((constraint) => {
        this.attach(constraint)
      })
    },
    removeByIndex(index) {
      let constraint = constraintsProvideContext.value.splice(index, 1)[0]
      constraintsGCSManager.removeById(constraint.gcs)
      delete constraintsHashProvideContext.value[constraint.id]
      let constraintsPlaneHashItem = constraintsPlaneHashProvideContext.value[constraint.plane]
      let indexForConstraintsPlaneHash = constraintsPlaneHashItem.indexOf(constraint)
      constraintsPlaneHashItem.splice(indexForConstraintsPlaneHash, 1)
      effect()
    },
    remove(constraint) {
      let index = constraintsProvideContext.value.indexOf(constraint)
      this.removeByIndex(index)
    },
    removeById(id) {
      let constraint = constraintsHashProvideContext.value[id]
      let index = constraintsQuery.indexOf(constraint)
      this.removeByIndex(index)
    },
    clear() {
      constraintsGCSManager.clear()
      ;[...constraintsProvideContext.value].forEach((constraint) => {
        constraintsProvideContext.value.shift()
        delete constraintsHashProvideContext.value[constraint.id]
      })
      Object.keys(constraintsPlaneHashProvideContext.value).forEach((plane) => {
        delete constraintsPlaneHashProvideContext.value[plane]
      })
    },
    addConstraintP2PDistance(p1, p2, distance) {
      let constraint = {
        type: 'addConstraintP2PDistance',
        args: [p1, p2, distance],
        points: [0, 1],
        numerals: [2],
        unknowns: [
          ['x', 'y'],
          ['x', 'y'],
        ],
      }
      this.add(constraint)
      return constraint
    },
    addConstraintHorizontal() {},
    // addConstraintCoordinate(p, { x, y }) {
    //   this.addConstraintCoordinateX(p, x)
    //   this.addConstraintCoordinateY(p, y)
    // },
    addConstraintCoordinateX(p, x) {
      let constraint = {
        type: 'addConstraintCoordinateX',
        args: [p, x],
        points: [0],
        numerals: [1],
        unknowns: [['x']],
      }
      this.add(constraint)
      return constraint
    },
    addConstraintCoordinateY(p, y) {
      let constraint = {
        type: 'addConstraintCoordinateY',
        args: [p, y],
        points: [0],
        numerals: [1],
        unknowns: [['y']],
      }
      this.add(constraint)
      return constraint
    },
    addConstraintP2PCoincident(p1, p2) {
      let constraint = {
        type: 'addConstraintP2PCoincident',
        args: [p1, p2],
        points: [0, 1],
        unknowns: [
          ['x', 'y'],
          ['x', 'y'],
        ],
      }
      this.add(constraint)
      return constraint
    },
    addConstraintArcRules(arc) {
      let constraint = {
        type: 'addConstraintArcRules',
        args: [arc],
        arcs: [0],
      }
      this.add(constraint)
      return constraint
    },
  }
}

export function useConstraintsIncrement() {
  let constraintsIncrementProvideContext = useConstraintsIncrementProvideContext()
  return {
    set(number) {
      constraintsIncrementProvideContext.value = number
    },
  }
}

export function useConstraintsRelation() {
  let constraintsRelationProvideContext = useConstraintsRelationProvideContext()
  let constraintsRelationHashProvideContext = useConstraintsRelationHashProvideContext()
  let constraintsIncrementQuery = useConstraintsIncrementQuery()
  return {
    add(type, geometrys, constraints) {
      let constraintRelation = {
        type,
        geometrys,
        constraints,
        id: nanoid(),
        tag: constraintsIncrementQuery.get(),
      }
      this.attach(constraintRelation)
    },
    attach(constraintRelation) {
      constraintsRelationProvideContext.value.push(constraintRelation)
      constraintsRelationHashProvideContext.value[constraintRelation.id] = constraintRelation
    },
    removeByIndex(index) {
      assertIndexFormList(
        constraintsRelationProvideContext.value,
        index,
        'constraintsRelation:removeByIndex',
      )
      let constraintRelation = constraintsRelationProvideContext.value.splice(index, 1)[0]
      delete constraintsRelationHashProvideContext.value[constraintRelation.id]
    },
    remove(constraintRelation) {
      let index = constraintsRelationProvideContext.value.indexOf(constraintRelation)
      this.removeByIndex(index)
    },
    removeById(id) {
      let index = constraintsRelationProvideContext.value.findIndex((point) => point.id === id)
      this.removeByIndex(index)
    },
    clear() {
      ;[...constraintsRelationProvideContext.value].forEach((constraintRelation) => {
        constraintsRelationProvideContext.value.shift()
        delete constraintsRelationHashProvideContext.value[constraintRelation.id]
      })
    },
    load(constraintsRelation) {
      constraintsRelation.forEach((constraintRelation) => {
        this.attach(constraintRelation)
      })
    },
  }
}
/*
 * 收集几何和约束需要细化到一对一的关系吗
 */
