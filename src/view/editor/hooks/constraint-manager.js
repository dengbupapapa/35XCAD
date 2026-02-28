import {
  useConstraints as useConstraintsGeometry,
  useConstraintsIncrement as useConstraintsIncrementGeometry,
  useConstraintsHash as useConstraintsHashGeometry,
  useConstraintsPlaneHash as useConstraintsPlaneHashGeometry,
} from './constraint-provide-context.js'
import {
  usePlanes as usePlanesGeometryQuery,
  usePoints as usePointsGeometryQuery,
} from './geometry-query.js'
import {usePoints as usePointsGeometryManager} from "./geometry-manager.js"
import {
  useConstraints as useConstraintsGeometryQuery,
  useConstraintsIncrement as useConstraintsIncrementGeometryQuery,
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
import {
  useArcs as useArcsGCSMapper,
} from './solver-gcs-mapper.js'
import {
  nanoid,
} from '../utils/simple'
import { debounce} from 'lodash-es'
export function useConstraints() {
  let constraintsGeometry = useConstraintsGeometry()
  let constraintsHashGeometry = useConstraintsHashGeometry()
  let constraintsPlaneHashGeometry = useConstraintsPlaneHashGeometry()
  let constraintsIncrementGeometryQuery = useConstraintsIncrementGeometryQuery()
  let constraintsGCSManager = useConstraintsGCSManager()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let pointsGeometryManager = usePointsGeometryManager()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let constraintsGeometryQuery = useConstraintsGeometryQuery()
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
      let constraint = constraintsGeometryQuery.get(id)
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
      let tag = constraintsIncrementGeometryQuery.get()
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
      constraintsGeometry.value.push(constraint)
      constraintsHashGeometry.value[constraint.id] = constraint
      if (!(constraintsPlaneHashGeometry.value[constraint.plane] instanceof Array)) {
        constraintsPlaneHashGeometry.value[constraint.plane] = []
      }
      constraintsPlaneHashGeometry.value[constraint.plane].push(constraint)
      constraintsBatch.push(constraint)
      effect()
    },
    load(constraintsGeometry) {
      constraintsGeometry.forEach((constraint) => {
        this.attach(constraint)
      })
    },
    removeByIndex(index) {
      let constraint = constraintsGeometry.value.splice(index, 1)[0]
      delete constraintsHashGeometry.value[constraint.id]
      let constraintsPlaneHashItem = constraintsPlaneHashGeometry.value[constraint.plane]
      let indexForConstraintsPlaneHash = constraintsPlaneHashItem.indexOf(constraint)
      constraintsPlaneHashItem.splice(indexForConstraintsPlaneHash, 1)
      constraintsGCSManager.removeById(constraint.gcs)
    },
    remove(constraint) {
      let index = constraintsGeometry.value.indexOf(constraint)
      this.removeByIndex(index)
    },
    clear() {
      constraintsGCSManager.clear()
      ;[...constraintsGeometry.value].forEach((constraint) => {
        constraintsGeometry.value.shift()
        delete constraintsHashGeometry.value[constraint.id]
      })
      Object.keys(constraintsPlaneHashGeometry.value).forEach((plane) => {
        delete constraintsPlaneHashGeometry.value[plane]
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
    },
    addConstraintHorizontal() {},
    addConstraintCoordinate(p, { x, y }) {
      this.addConstraintCoordinateX(p, x)
      this.addConstraintCoordinateY(p, y)
    },
    addConstraintCoordinateX(p, x) {
      let constraint = {
        type: 'addConstraintCoordinateX',
        args: [p, x],
        points: [0],
        numerals: [1],
        unknowns: [['x']],
      }
      this.add(constraint)
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
    },
    addConstraintArcRules(arc) {
      let constraint = {
        type: 'addConstraintArcRules',
        args: [arc],
        arcs: [0],
      }
      this.add(constraint)
    },
  }
}

export function useConstraintsIncrement() {
  let constraintsIncrementGeometry = useConstraintsIncrementGeometry()
  return {
    set(number) {
      constraintsIncrementGeometry.value = number
    },
  }
}