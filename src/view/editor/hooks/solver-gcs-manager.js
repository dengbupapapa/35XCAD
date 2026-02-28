import {
  useModule as useModuleGCS,
  useSystems as useSystemsGCS,
  useUnknownsSet as useUnknownsSetGCS,
  useUnknownsSetJSON as useUnknownsSetJSONGCS,
  useNumerals as useNumeralsGCS,
  useNumeralsHash as useNumeralsHashGCS,
  useNumeralsPtrHash as useNumeralsPtrHashGCS,
  useNumeralsTemp as useNumeralsTempGCS,
  usePoints as usePointsGCS,
  usePointsHash as usePointsHashGCS,
  useArcs as useArcsGCS,
  useArcsHash as useArcsHashGCS,
  useConstraints as useConstraintsGCS,
  useConstraintsHash as useConstraintsHashGCS,
  useResults as useResultsGCS,
  useResultsHash as useResultsHashGCS,
} from './solver-gcs-provide-context.js'
import {
  useResults as useResultsQuery,
  usePoints as usePointsGCSQuery,
  useArcs as useArcsGCSQuery,
  useNumerals as useNumeralsGCSQuery,
  useSystems as useSystemsGCSQuery,
  useConstraints as useConstraintsGCSQuery,
  useUnknownsSet as useUnknownsSetGCSQuery,
} from './solver-gcs-query.js'
import {
  usePoints as usePointsGCSMapper,
  useArcs as useArcsGCSMapper,
} from './solver-gcs-mapper.js'
import {
  usePoints as usePointsGeometryQuery,
  usePlanes as usePlanesGeometryQuery,
  useArcs as useArcsGeometryQuery,
} from './geometry-query.js'
import {
  useConstraints as useConstraintsDataQuery,
} from './constraint-query.js'
import { Vector2, Vector3 } from '../core/gl-math'
import { nanoid, assertIndexFormList, worldCoords2planeCoords } from '../utils/simple'
import { upperFirst, throttle } from 'lodash-es'

export function useToolTemp() {
  let Module = useModuleGCS()
  let numeralsTempGCS = useNumeralsTempGCS()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let systemsGCSQuery = useSystemsGCSQuery()
  let pointsGCSQuery = usePointsGCSQuery()
  let numeralsGCSQuery = useNumeralsGCSQuery()
  let pointsGCSMapper = usePointsGCSMapper()
  let unknownsSetGCSQuery = useUnknownsSetGCSQuery()
  let unknownsSetGCSManager = useUnknownsSet()
  let arcsGCSQuery = useArcsGCSQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    addNumeral({ id, value }) {
      let double = new Module.Double(value)
      let ptr = double.ptr()
      let numeral = {
        handle: double,
        id: nanoid(),
        ptr,
        // creator: id,
      }
      numeralsTempGCS.push(numeral)
      return numeral
    },
    clearNumerals() {
      ;[...numeralsTempGCS].forEach((numeral, index) => {
        numeral.handle.delete()
        numeralsTempGCS.splice(0, 1)
      })
    },
    addConstraintCoordinateLock(
      pointGeometry,
      position = [pointGeometry.x, pointGeometry.y, pointGeometry.z],
    ) {
      // let plane = planesGeometryQuery.get(pointGeometry.plane)
      // let [u, v] = worldCoords2planeCoords(position, plane)

      // let pointGCS = pointsGCSQuery.get(pointGeometry.gcs)
      // let numeralPointGCSU = numeralsGCSQuery.get(pointGCS.u)
      // let numeralPointGCSV = numeralsGCSQuery.get(pointGCS.v)
      // let stables = unknownsSetGCSQuery.stable()
      // console.log(unknownsSetGCSManager.has(numeralPointGCSU) ,!stables.includes(numeralPointGCSU))
      // if (unknownsSetGCSManager.has(numeralPointGCSU) && !stables.includes(numeralPointGCSU)) {
      //   numeralPointGCSU.handle.set(u)
      //   let doubleX = this.addNumeral({ value: u })
      //   systemsGCSQuery.active.handle.addConstraintCoordinateX(
      //     pointGCS.handle,
      //     doubleX.handle,
      //     -1,
      //     false,
      //   )
      // }

      // if (unknownsSetGCSManager.has(numeralPointGCSV) && !stables.includes(numeralPointGCSV)) {
      //   numeralPointGCSV.handle.set(v)
      //   let doubleY = this.addNumeral({ value: v })
      //   systemsGCSQuery.active.handle.addConstraintCoordinateY(
      //     pointGCS.handle,
      //     doubleY.handle,
      //     -1,
      //     false,
      //   )
      // }
      let planeGeometry = planesGeometryQuery.get(pointGeometry.plane)
      let [u, v] = worldCoords2planeCoords(position, planeGeometry)

      let doubleX = this.addNumeral({ value: u })
      let doubleY = this.addNumeral({ value: v })
      let pointGCS = pointsGCSQuery.get(pointGeometry.gcs)

      // let numeralPointGCSU = numeralsGCSQuery.get(pointGCS.u)
      // let numeralPointGCSV = numeralsGCSQuery.get(pointGCS.v)
      // numeralPointGCSU.handle.set(u)
      // numeralPointGCSV.handle.set(v)

      systemsGCSQuery.active.handle.addConstraintCoordinateX(
        pointGCS.handle,
        doubleX.handle,
        -1,
        false,
      )
      systemsGCSQuery.active.handle.addConstraintCoordinateY(
        pointGCS.handle,
        doubleY.handle,
        -1,
        false,
      )
    },
    // addConstraintP2PDistanceLock(p1, p2, distance) {
    //   let pointGCS1 = pointsGCSMapper.getByGeometry(p1.id)
    //   let pointGCS2 = pointsGCSMapper.getByGeometry(p2.id)
    //   systemsGCSQuery.active.handle.addConstraintP2PDistance(
    //     pointGCS1.handle,
    //     pointGCS2.handle,
    //     distance.handle,
    //     -1,
    //     false,
    //   )
    // },
    addConstraintArcRadiusLock(arc) {
      let arcGCS = arcsGCSQuery.get(arc.gcs)
      let pointGeometryCenter = pointsGeometryQuery.get(arc.center)
      let pointGeometryStart = pointsGeometryQuery.get(arc.start)
      let radius = this.addNumeral({
        value: new Vector3(pointGeometryCenter.x, pointGeometryCenter.y, pointGeometryCenter.z)
          .sub(new Vector3(pointGeometryStart.x, pointGeometryStart.y, pointGeometryStart.z))
          .length(),
      })

      systemsGCSQuery.active.handle.addConstraintArcRadius(arcGCS.handle, radius.handle, -1, false)
    },
    addConstraintArcTranslationCenter(arc) {
      let arcGCS = arcsGCSQuery.get(arc.gcs)
      let pointGeometryCenter = pointsGeometryQuery.get(arc.center)
      let pointGeometryStart = pointsGeometryQuery.get(arc.start)
      let pointGeometryEnd = pointsGeometryQuery.get(arc.end)

      let pointGeometryCenterPlane = planesGeometryQuery.get(pointGeometryCenter.plane)
      let pointGeometryCenterUV = worldCoords2planeCoords(
        [pointGeometryCenter.x, pointGeometryCenter.y, pointGeometryCenter.z],
        pointGeometryCenterPlane,
      )
      let pointGeometryStartPlane = planesGeometryQuery.get(pointGeometryStart.plane)
      let pointGeometryStartUV = worldCoords2planeCoords(
        [pointGeometryStart.x, pointGeometryStart.y, pointGeometryStart.z],
        pointGeometryStartPlane,
      )
      let pointGeometryEndPlane = planesGeometryQuery.get(pointGeometryEnd.plane)
      let pointGeometryEndUV = worldCoords2planeCoords(
        [pointGeometryEnd.x, pointGeometryEnd.y, pointGeometryEnd.z],
        pointGeometryEndPlane,
      )

      let vectorStart = new Vector2(pointGeometryStartUV[0], pointGeometryStartUV[1]).sub(
        new Vector2(pointGeometryCenterUV[0], pointGeometryCenterUV[1]),
      )
      let vectorEnd = new Vector2(pointGeometryEndUV[0], pointGeometryEndUV[1]).sub(
        new Vector2(pointGeometryCenterUV[0], pointGeometryCenterUV[1]),
      )

      let radius = this.addNumeral({
        value: vectorStart.length(),
      })

      let angleStart = this.addNumeral({
        value: vectorStart.angle(),
      })
      let angleEnd = this.addNumeral({
        value: vectorEnd.angle(),
      })
      systemsGCSQuery.active.handle.addConstraintArcRadius(arcGCS.handle, radius.handle, -1, false)

      let pointGCSCenter = pointsGCSQuery.get(pointGeometryCenter.gcs)
      let pointGCSStart = pointsGCSQuery.get(pointGeometryStart.gcs)
      let pointGCSEnd = pointsGCSQuery.get(pointGeometryEnd.gcs)
      systemsGCSQuery.active.handle.addConstraintP2PAngle(
        pointGCSStart.handle,
        pointGCSCenter.handle,
        angleStart.handle,
        -1,
        false,
      )
      systemsGCSQuery.active.handle.addConstraintP2PAngle(
        pointGCSEnd.handle,
        pointGCSCenter.handle,
        angleEnd.handle,
        -1,
        false,
      )
    },
  }
}
export function useNumerals() {
  let Module = useModuleGCS()
  let numerals = useNumeralsGCS()
  let numeralsHash = useNumeralsHashGCS()
  let numeralsPtrHash = useNumeralsPtrHashGCS()
  return {
    add({ id, value }) {
      let double = new Module.Double(value)
      let ptr = double.ptr()
      let numeral = {
        handle: double,
        id: nanoid(),
        ptr,
        // creator: id,
      }
      numerals.push(numeral)
      numeralsHash[numeral.id] = numeral
      numeralsPtrHash[ptr] = numeral
      return numeral
    },
    removeById(id) {
      let numeral = numeralsHash[id]
      let index = numerals.indexOf(numeral)
      numerals.splice(index, 1)
      delete numeralsHash[id]
      delete numeralsPtrHash[numeral.ptr]
      numeral.handle.delete()
    },
    clear() {
      ;[...numerals].forEach((numeral) => {
        numerals.shift()
        delete numeralsHash[numeral.id]
        delete numeralsPtrHash[numeral.ptr]
        numeral.handle.delete()
      })
    },
  }
}
export function usePoints() {
  let Module = useModuleGCS()
  let points = usePointsGCS()
  let pointsHash = usePointsHashGCS()
  let numeralsGCSManager = useNumerals()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let pointsGCSMapper = usePointsGCSMapper()
  let numeralsGCSQuery = useNumeralsGCSQuery()
  return {
    add(data) {
      /* [问题]
       * 暂时只取xy平面 ko
       * 点属于多个平面的时候怎么办；另外这个点在不同的平面上还不能使用同一个求解器？好像可以；分裂成两个点，但是在共线的方向是值重合，所以planes换成plane？
       * 基于上面的问题，到底只有一个求解器还是多个求解器 （暂时觉得是一个求解器，但是数据该归类平面还是要做）**重要**
       */

      let plane = planesGeometryQuery.get(data.plane)
      let planeCoords = worldCoords2planeCoords([data.x, data.y, data.z], plane)
      let id = nanoid()
      let u = numeralsGCSManager.add({ id, value: planeCoords[0] })
      let v = numeralsGCSManager.add({ id, value: planeCoords[1] })
      u.creator = id
      v.creator = id
      let point = {
        handle: new Module.Point(u.handle, v.handle),
        u: u.id,
        v: v.id,
        id,
        creator: data.id,
      }
      points.push(point)
      pointsHash[point.id] = point
      return point
    },
    removeByIndex(index) {
      assertIndexFormList(points, index, 'points2:removeByIndex')
      let last = points.length - 1
      let point = points[index]
      if (index !== last) {
        points[index] = points[last]
      }
      points.pop()
      delete pointsHash[point.id]
      numeralsGCSManager.removeById(point.u)
      numeralsGCSManager.removeById(point.v)
    },
    removeById(id) {
      let index = points.findIndex((point) => point.id === id)
      this.removeByIndex(index)
    },
    remove(point) {
      let index = points.indexOf(point)
      this.removeByIndex(index)
    },
    clear() {
      numeralsGCSManager.clear()
      ;[...points].forEach((point) => {
        points.shift()
        delete pointsHash[point.id]
      })
    },
    update(data) {
      let plane = planesGeometryQuery.get(data.plane)
      let planeCoords = worldCoords2planeCoords([data.x, data.y, data.z], plane)
      let pointGCS = pointsGCSMapper.getByGeometry(data.id)
      let pointGCSU = numeralsGCSQuery.get(pointGCS.u)
      let pointGCSV = numeralsGCSQuery.get(pointGCS.v)
      pointGCSU.handle.set(planeCoords[0])
      pointGCSV.handle.set(planeCoords[1])
    },
  }
}
export function useArcs() {
  let Module = useModuleGCS()
  let numeralsGCSManager = useNumerals()
  let numeralsGCSQuery = useNumeralsGCSQuery()
  let pointsGCSMapper = usePointsGCSMapper()
  let pointsGCSManager = usePoints()
  let arcsHashGCS = useArcsHashGCS()
  let arcsGCS = useArcsGCS()
  let arcsGCSQuery = useArcsGCSQuery()
  let pointsGCSQuery = usePointsGCSQuery()
  return {
    add(data) {
      let { center, start, end, ccw, plane } = data

      let arc = {
        handle: new Module.Arc(),
        id: nanoid(),
      }

      let pointGCSCenter = pointsGCSMapper.getByGeometry(center)
      let pointGCSStart = pointsGCSMapper.getByGeometry(start)
      let pointGCSEnd = pointsGCSMapper.getByGeometry(end)
      arc.handle.center(pointGCSCenter.handle)
      arc.handle.start(pointGCSStart.handle)
      arc.handle.end(pointGCSEnd.handle)
      arc.center = pointGCSCenter.id
      arc.start = pointGCSStart.id
      arc.end = pointGCSEnd.id

      let pointGCSCenterU = numeralsGCSQuery.get(pointGCSCenter.u)
      let pointGCSCenterV = numeralsGCSQuery.get(pointGCSCenter.v)
      let pointGCSStartU = numeralsGCSQuery.get(pointGCSStart.u)
      let pointGCSStartV = numeralsGCSQuery.get(pointGCSStart.v)
      let pointGCSEndU = numeralsGCSQuery.get(pointGCSEnd.u)
      let pointGCSEndV = numeralsGCSQuery.get(pointGCSEnd.v)

      let vectorStart = new Vector2(pointGCSStartU.handle.value, pointGCSStartV.handle.value).sub(
        new Vector2(pointGCSCenterU.handle.value, pointGCSCenterV.handle.value),
      )
      let vectorEnd = new Vector2(pointGCSEndU.handle.value, pointGCSEndV.handle.value).sub(
        new Vector2(pointGCSCenterU.handle.value, pointGCSCenterV.handle.value),
      )

      let numeralGCSAngleStart = numeralsGCSManager.add({ id: arc.id, value: vectorStart.angle() })
      let numeralGCSAngleEnd = numeralsGCSManager.add({ id: arc.id, value: vectorEnd.angle() })
      let numeralGCSRadius = numeralsGCSManager.add({ id: arc.id, value: vectorStart.length() })

      numeralGCSAngleStart.creator = arc.id
      numeralGCSAngleEnd.creator = arc.id
      numeralGCSRadius.creator = arc.id
      arc.handle.angleStart(numeralGCSAngleStart.handle)
      arc.handle.angleEnd(numeralGCSAngleEnd.handle)
      arc.handle.radius(numeralGCSRadius.handle)

      arc.angleStart = numeralGCSAngleStart.id
      arc.angleEnd = numeralGCSAngleEnd.id
      arc.radius = numeralGCSRadius.id

      arcsGCS.push(arc)
      arcsHashGCS[arc.id] = arc

      return arc
    },
    update(data, endpoint) {
      let arcGCS = arcsGCSQuery.get(data.gcs)

      let pointGCSCenter = pointsGCSQuery.get(arcGCS.center)
      let pointGCSEndpoint = pointsGCSQuery.get(arcGCS[endpoint])

      let pointGCSCenterU = numeralsGCSQuery.get(pointGCSCenter.u)
      let pointGCSCenterV = numeralsGCSQuery.get(pointGCSCenter.v)
      let pointGCSEndpointU = numeralsGCSQuery.get(pointGCSEndpoint.u)
      let pointGCSEndpointV = numeralsGCSQuery.get(pointGCSEndpoint.v)

      let vector = new Vector2(pointGCSEndpointU.handle.value, pointGCSEndpointV.handle.value).sub(
        new Vector2(pointGCSCenterU.handle.value, pointGCSCenterV.handle.value),
      )
      let numeralGCSAngle = numeralsGCSQuery.get(arcGCS[`angle${upperFirst(endpoint)}`])
      let numeralGCSRadius = numeralsGCSQuery.get(arcGCS.radius)
      numeralGCSAngle.handle.set(vector.angle())
      numeralGCSRadius.handle.set(vector.length())
    },
    updateStart(data) {
      this.update(data, 'start')
    },
    updateEnd(data) {
      this.update(data, 'end')
    },
    remove(data) {
      let arcGCS = arcsGCSQuery.get(data.gcs)
      let pointGCSCenter = pointsGCSQuery.get(arcGCS.center)
      let pointGCSStart = pointsGCSQuery.get(arcGCS.start)
      let pointGCSEnd = pointsGCSQuery.get(arcGCS.end)

      numeralsGCSManager.removeById(pointGCSCenter.u)
      numeralsGCSManager.removeById(pointGCSCenter.v)
      numeralsGCSManager.removeById(pointGCSStart.u)
      numeralsGCSManager.removeById(pointGCSStart.v)
      numeralsGCSManager.removeById(pointGCSEnd.u)
      numeralsGCSManager.removeById(pointGCSEnd.v)

      numeralsGCSManager.removeById(arcGCS.angleStart)
      numeralsGCSManager.removeById(arcGCS.angleEnd)
      numeralsGCSManager.removeById(arcGCS.radius)

      pointsGCSManager.remove(pointGCSCenter)
      pointsGCSManager.remove(pointGCSStart)
      pointsGCSManager.remove(pointGCSEnd)

      let index = arcsGCSQuery.indexOf(arcGCS)
      arcsGCS.splice(index, 1)
      delete arcsHashGCS[arcGCS.id]
    },
  }
}

export function useConstraints() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let arcsGeometryQuery = useArcsGeometryQuery()
  let arcsGCSMapper = useArcsGCSMapper()
  let pointsGCSQuery = usePointsGCSQuery()
  let arcsGCSQuery = useArcsGCSQuery()
  let numeralsGCSManager = useNumerals()
  let unknownsSetManager = useUnknownsSet()
  let constraintsGCS = useConstraintsGCS()
  let constraintsHashGCS = useConstraintsHashGCS()
  let numeralsGCSQuery = useNumeralsGCSQuery()
  let systems = useSystemsGCSQuery()
  let constraintsDataQuery = useConstraintsDataQuery()
  return {
    add(data) {
      let { type, args, points, arcs, unknowns, numerals, id, plane } = data
      let args2Constraint = []
      let args2System = []
      let idConstraint = nanoid()
      args.forEach((arg, index) => {
        /* [联动] 1
         * 创建参数
         * 参数id关联
         * 创建变量
         */
        if (points instanceof Array && points.includes(index)) {
          let pointGeometry = pointsGeometryQuery.get(arg)
          let pointGCS = pointsGCSQuery.get(pointGeometry.gcs)
          args2Constraint.push(pointGCS.id)
          args2System.push(pointGCS.handle)
          let unknown = unknowns[index]
          if (!(unknown instanceof Array)) return
          if (unknown.includes('x')) {
            let numeralU = numeralsGCSQuery.get(pointGCS.u)
            unknownsSetManager.numeral(numeralU)
          }
          if (unknown.includes('y')) {
            let numeralV = numeralsGCSQuery.get(pointGCS.v)
            unknownsSetManager.numeral(numeralV)
          }
          return
        }
        if (arcs instanceof Array && arcs.includes(index)) {
          let arcsGCS = arcsGCSMapper.getByGeometry(arg)
          args2Constraint.push(arcsGCS.id)
          args2System.push(arcsGCS.handle)

          let pointGCSCenter = pointsGCSQuery.get(arcsGCS.center)
          let pointGCSStart = pointsGCSQuery.get(arcsGCS.start)
          let pointGCSEnd = pointsGCSQuery.get(arcsGCS.end)

          let numeralCenterU = numeralsGCSQuery.get(pointGCSCenter.u)
          let numeralCenterV = numeralsGCSQuery.get(pointGCSCenter.v)
          unknownsSetManager.numeral(numeralCenterU)
          unknownsSetManager.numeral(numeralCenterV)
          let numeralStartU = numeralsGCSQuery.get(pointGCSStart.u)
          let numeralStartV = numeralsGCSQuery.get(pointGCSStart.v)
          unknownsSetManager.numeral(numeralStartU)
          unknownsSetManager.numeral(numeralStartV)
          let numeralEndU = numeralsGCSQuery.get(pointGCSEnd.u)
          let numeralEndV = numeralsGCSQuery.get(pointGCSEnd.v)
          unknownsSetManager.numeral(numeralEndU)
          unknownsSetManager.numeral(numeralEndV)

          let numeralAngleStart = numeralsGCSQuery.get(arcsGCS.angleStart)
          let numeralAngleEnd = numeralsGCSQuery.get(arcsGCS.angleEnd)
          let numeralRadius = numeralsGCSQuery.get(arcsGCS.radius)

          unknownsSetManager.numeral(numeralAngleStart)
          unknownsSetManager.numeral(numeralAngleEnd)
          unknownsSetManager.numeral(numeralRadius)

          // console.log(numeralAngleStart, numeralAngleEnd, numeralRadius)

          return
        }
        if (numerals instanceof Array && numerals.includes(index)) {
          let numeralGCS = numeralsGCSManager.add({ id: idConstraint, value: arg })
          numeralGCS.creator = idConstraint
          args2Constraint.push(numeralGCS.id)
          args2System.push(numeralGCS.handle)
          return
        }

        args2Constraint.push(arg)
        args2System.push(arg)
      })
      let constraint = {
        type,
        args: args2Constraint,
        id: idConstraint,
        // creator: data.id,
      }
      constraintsGCS.push(constraint)
      constraintsHashGCS[constraint.id] = constraint
      systems.active.handle[type](...args2System)
      return constraint
    },
    removeById(id) {
      //删除tag
      let constraintData = constraintsDataQuery.get(constraint.creator)
      systems.active.handle.clearByTag(constraintData.tag)
      //删除相关数值
      let { args, numerals } = constraint
      args.forEach((arg, index) => {
        if (numerals instanceof Array && numerals.includes(index)) {
          numeralsGCSManager.removeById(arg)
        }
      })
      let constraint = constraintsHashGCS[id]
      let index = constraintsGCS.indexOf(constraint)
      constraintsGCS.splice(index, 1)
      delete constraintsHashGCS[id]
    },
    updateNumerals(data) {
      let constraintGCS = this.get(data.gcs)
      constraintGCS.args.forEach((arg, index) => {
        if (data.numerals instanceof Array && data.numerals.includes(index)) {
          let numeralGCS = numeralsGCSQuery.get(arg)
          numeralGCS.handle.set(data.args[index])
        }
      })
    },
    clear() {
      ;[...constraintsGCS].forEach((constraint) => {
        let constraintData = constraintsDataQuery.get(constraint.creator)
        systems.active.handle.clearByTag(constraintData.tag)
        constraintsGCS.shift()
        delete constraintsHashGCS[constraint.id]
      })
    },
  }
}

export function useResults() {
  let results = useResultsGCS()
  let resultsHash = useResultsHashGCS()
  let resultsQuery = useResultsQuery()
  return {
    add({ id }) {
      let result = {
        id: nanoid(),
        // creator: id,
      }
      results.value.push(result)
      resultsHash.value[result.id] = result
      this.initial(result.id)
      return result
    },
    removeByIndex(index) {
      let result = results.value.splice(index, 1)[0]
      delete resultsHash.value[result.id]
    },
    removeById(id) {
      let index = results.value.findIndex((result) => result.id === id)
      this.removeByIndex(index)
    },
    remove(result) {
      let index = results.value.indexOf(result)
      this.removeByIndex(index)
    },
    clear() {
      ;[...results.value].forEach((result) => {
        results.value.splice(0, 1)
        delete resultsHash.value[result.id]
      })
    },
    initial(id) {
      let result = resultsQuery.get(id)
      result.status = undefined
      result.dependents = []
      result.dependentsGroups = []
      result.hasConflicting = undefined
      result.hasRedundant = undefined
      result.conflictings = []
      result.redundants = []
    },
    update(
      id,
      {
        status,
        dependents = [],
        dependentsGroups = [],
        hasConflicting,
        hasRedundant,
        conflictings = [],
        redundants = [],
      },
    ) {
      let result = resultsQuery.get(id)
      result.status = status
      result.dependents = dependents
      result.dependentsGroups = dependentsGroups
      result.hasConflicting = hasConflicting
      result.hasRedundant = hasRedundant
      result.conflictings = conflictings
      result.redundants = redundants
    },
    backup(id) {
      let result = resultsQuery.get(id)
      delete result.snapshot
      result.snapshot = Object.assign({}, result)
    },
  }
}

export function useSystems() {
  let systems = useSystemsGCS()
  let Module = useModuleGCS()
  let { System, Algorithm, SolveStatus, Dependents, DependentsGroups, Tags } = Module
  let unknownsSetManager = useUnknownsSet()
  let unknownsSetGCSQuery = useUnknownsSetGCSQuery()
  let resultsManager = useResults()
  let resultsQuery = useResultsQuery()
  let systemsGCSQuery = useSystemsGCSQuery()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let constraintsDataQuery = useConstraintsDataQuery()
  let constraintsGCSQuery = useConstraintsGCSQuery()
  let pointsGCSQuery = usePointsGCSQuery()
  let numeralsGCSQuery = useNumeralsGCSQuery()

  return {
    add() {
      let system = { handle: new System(), id: nanoid(), active: false }
      let unknowns = unknownsSetManager.add(system)
      unknowns.creator = system.id
      system.unknowns = unknowns.id
      let result = resultsManager.add(system)
      result.creator = system.id
      system.result = result.id
      systems.push(system)
      return system
    },
    removeByIndex(index) {
      let system = systems.splice(index, 1)[0]
      unknownsSetManager.removeById(system.unknowns)
      resultsManager.removeById(system.result)
    },
    removeById(id) {
      let index = systems.findIndex((system) => system.id === id)
      this.removeByIndex(index)
    },
    remove(system) {
      let index = systems.value.indexOf(system)
      this.removeByIndex(index)
    },
    clear() {
      unknownsSetManager.clear()
      resultsManager.clear()
      ;[...systems].forEach(() => {
        systems.splice(0, 1)
      })
    },
    reset() {
      systemsGCSQuery.active.handle.invalidatedDiagnosis()
      systemsGCSQuery.active.handle.declareUnknowns(unknownsSetGCSQuery.active.handle)
      // systemsGCSQuery.active.handle.initSolution(Algorithm.DogLeg);
      // systemsGCSQuery.active.handle.clear()
      // //需要加载约束项
      // let index = systemsGCSQuery.indexOf(systemsGCSQuery.active)
      // let plane = planesGeometryQuery.getByIndex(index)
      // let constraints = constraintsDataQuery.getByPlane(plane.id)
      // constraints.forEach(({ type, points, numerals, tag, id, gcs }) => {
      //   let { args } = constraintsGCSQuery.get(gcs)
      //   let args2System = []
      //   args.forEach((arg, index) => {
      //     if (points instanceof Array && points.includes(index)) {
      //       let pointGCS = pointsGCSQuery.get(arg)
      //       args2System.push(pointGCS.handle)
      //       // //注册为unknown
      //       // let numeralU = numeralsGCSQuery.get(pointGCS.u)
      //       // let numeralV = numeralsGCSQuery.get(pointGCS.v)
      //       // unknownsManager.numeral(numeralU.handle)
      //       // unknownsManager.numeral(numeralV.handle)
      //       return
      //     }
      //     if (numerals instanceof Array && numerals.includes(index)) {
      //       let numeralGCS = numeralsGCSQuery.get(arg)
      //       // let numeralGCS = numeralsGCSManager.add({ id: idConstraint, value: arg })
      //       args2System.push(numeralGCS.handle)
      //       return
      //     }
      //     args2System.push(arg)
      //   })
      //   systemsGCSQuery.active.handle[type](...args2System)
      // })
    },
    solver /*: throttle(function */() {
      let system = systemsGCSQuery.active.handle
      let result = resultsQuery.get(systemsGCSQuery.active.result)
      resultsManager.backup(systemsGCSQuery.active.result)
      // system.declareUnknowns(unknownsSetGCSQuery.active.handle)
      system.initSolution(Algorithm.DogLeg)
      let status = system.solve(true, Algorithm.DogLeg, false)
      if (status != SolveStatus.Success.value && status != SolveStatus.Converged.value) {
        let diagnose = system.diagnose(Algorithm.DogLeg)
        let conflictings = []
        let hasConflicting = system.hasConflicting()
        if (hasConflicting) {
          let tags = new Tags()
          system.getConflicting(tags)
          for (let i = 0; i < tags.size(); i++) {
            conflictings.push(tags.ptr(i))
          }
        }
        let redundants = []
        let hasRedundant = system.hasRedundant()
        if (hasRedundant) {
          let tags = new Tags()
          system.getRedundant(tags)
          for (let i = 0; i < tags.size(); i++) {
            redundants.push(tags.ptr(i))
          }
        }
        resultsManager.update(systemsGCSQuery.active.result, {
          status,
          diagnose,
          conflictings,
          hasConflicting,
          redundants,
          hasRedundant,
        })
        this.reset()
        //undoSolution
        /* [问题]
         * 是利用undoSolution还是直接clear
         */
        return result
      }
      system.applySolution()
      let ds = new Dependents()
      system.getDependentParams(ds)
      let dependents = new Set() //[]
      for (let i = 0; i < ds.size(); i++) {
        dependents.add(ds.ptr(i))
      }

      let dgs = new DependentsGroups()
      system.getDependentParamsGroups(dgs)
      let dependentsGroups = []
      for (let r = 0; r < dgs.row(); r++) {
        let column = new Set() //[]
        for (let c = 0; c < dgs.column(r); c++) {
          column.add(dgs.ptr(r, c))
        }
        dependentsGroups.push(column.values().toArray())
      }
      resultsManager.update(systemsGCSQuery.active.result, {
        status,
        dependents: dependents.values().toArray(),
        dependentsGroups,
      })
      return result
    } /*, 16)*/,
    active(index) {
      assertIndexFormList(systems, index, 'systems:active')
      systems.forEach((system, i) => {
        if (index === i) {
          system.active = true
          return
        }
        system.active = false
      })
      unknownsSetManager.active(index)
    },
    // set active(index) {
    //   assertIndexFormList(systems, index)
    //   systems.forEach((system, i) => {
    //     if (index === i) {
    //       system.active = true
    //       return
    //     }
    //     system.active = false
    //   })
    //   unknownsSetManager.active = index
    // },
    // get active() {
    //   return systems.find(({ active }) => active)
    // },
  }
}

export function useUnknownsSet() {
  let unknownsSet = useUnknownsSetGCS()
  let unknownsSetJSONGCS = useUnknownsSetJSONGCS()
  let unknownsSetGCSQuery = useUnknownsSetGCSQuery()
  let Module = useModuleGCS()
  return {
    add({ id }) {
      let unknowns = {
        handle: new Module.Unknowns(),
        id: nanoid(),
        // creator: id,
        active: false,
      }
      unknownsSet.push(unknowns)
      unknownsSetJSONGCS.value[unknowns.id] = []
      return unknowns
    },
    removeByIndex(index) {
      let unknowns = unknownsSet.splice(index, 1)[0]
      delete unknownsSetJSONGCS.value[unknowns.id]
    },
    removeById(id) {
      let index = unknownsSet.findIndex((unknowns) => unknowns.id === id)
      this.removeByIndex(index)
    },
    remove(unknowns) {
      let index = unknownsSet.indexOf(unknowns)
      this.removeByIndex(index)
    },
    clear() {
      ;[...unknownsSet].forEach((unknowns) => {
        unknownsSet.splice(0, 1)
        delete unknownsSetJSONGCS.value[unknowns.id]
      })
    },
    has(numeral) {
      return unknownsSet.some(({ handle }) => handle.has(numeral.handle))
    },
    numeral(n) {
      let unknowns = unknownsSetGCSQuery.active
      if (unknownsSetJSONGCS.value[unknowns.id].includes(n.id)) return
      unknownsSetJSONGCS.value[unknowns.id].push(n.id)
      unknownsSetGCSQuery.active.handle.push(n.handle)
    },
    active(index) {
      assertIndexFormList(unknownsSet, index, 'unknownsSet:active')
      unknownsSet.forEach((unknowns, i) => {
        if (index === i) {
          unknowns.active = true
          return
        }
        unknowns.active = false
      })
    },
    // set active(index) {
    //   assertIndexFormList(unknownsSet, index)
    //   unknownsSet.forEach((unknowns, i) => {
    //     if (index === i) {
    //       unknowns.active = true
    //       return
    //     }
    //     unknowns.active = false
    //   })
    // },
    // get active() {
    //   return unknownsSet.find(({ active }) => active)
    // },
  }
}
