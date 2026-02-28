import {
  usePlanes as usePlanesGeometry,
  usePoints as usePointsGeometry,
  useLines as useLinesGeometry,
  usePolylines as usePolylinesGeometry,
  useArcs as useArcsGeometry,
  // useConstraints as useConstraintsGeometry,
  // useConstraintsIncrement as useConstraintsIncrementGeometry,
  useIncrement as useIncrementGeometry,
  usePlanesHash as usePlanesHashGeometry,
  usePointsHash as usePointsHashGeometry,
  useLinesHash as useLinesHashGeometry,
  usePolylinesHash as usePolylinesHashGeometry,
  useArcsHash as useArcsHashGeometry,
  // useConstraintsHash as useConstraintsHashGeometry,
  // useConstraintsPlaneHash as useConstraintsPlaneHashGeometry,
} from './geometry-provide-context.js'
import {
  usePlanes as usePlanesGeometryQuery,
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
  useArcs as useArcsGeometryQuery,
  // useConstraints as useConstraintsGeometryQuery,
  // useConstraintsIncrement as useConstraintsIncrementGeometryQuery,
} from './geometry-query.js'
import { useArcs as useArcsGeometryMapper } from './geometry-mapper'
import {
  useConstraints as useConstraintsManager
} from './constraint-manager.js'
import {
  useToolTemp as useToolTempGCSManager,
  usePoints as usePointsGCSManager,
  useArcs as useArcsGCSManager,
  // useConstraints as useConstraintsGCSManager,
  useSystems as useSystemsGCSManager,
  useUnknownsSet as useUnknownsSetGCSManager,
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
  usePoints as usePointsGCSMapper,
} from './solver-gcs-mapper.js'
import { usePoints as usePointsGeometryUpdater } from './geometry-updater.js'
import { useSelectPoints as useSelectPointsInteractioManager } from './interaction-manager.js'
import { usePlanes as usePlanesEntitie } from './viewport-provide-context'
import {
  nanoid,
  assertIndexFormList,
  planeCoords2worldCoords,
  worldCoords2planeCoords,
} from '../utils/simple'
import { cloneDeep, debounce, throttle } from 'lodash-es'

export default function useGeometry() {
  const pointsGeometryManager = usePoints()
  const pointsGeometryQuery = usePointsGeometryQuery()
  const linesGeometryQuery = useLinesGeometryQuery()
  const arcsGeometryMapper = useArcsGeometryMapper()
  const arcsGeometryManager = useArcs()
  const linesGeometryManager = useLines()
  return {
    updateCommitPoint(index, position) {
      // updateCommitPoint(batch) {
      // if (arguments.length === 2) {
      //   let index = arguments[0]
      //   let position = arguments[1]
      //   batch = [{ index, position }]
      // }
      // return batch.reduce((prev, { index, position }) => {
      //   // if(){

      //   // }
      //   if (arcsGeometryMapper.getFormPointIndex(index)) {
      //     prev.push(...arcsGeometryManager.updateCommit(index, position))
      //     return prev
      //   }
      //   prev.push(...pointsGeometryManager.updateCommit(index, position))
      //   return prev
      // }, [])
      if (arcsGeometryMapper.getFormPointIndex(index)) {
        return arcsGeometryManager.updateCommit(index, position)
      }
      return pointsGeometryManager.updateCommit(index, position)
    },
    updateApplyPoint(numerals) {
      pointsGeometryManager.updateApply(numerals)
    },
    updatePointImmediate(...batch) {
      let numerals = this.updateCommitPoint(...batch)
      this.updateApplyPoint(numerals)
    },
    updatePoint: throttle(function (...batch) {
      return this.updatePointImmediate(...batch)
    }, 16),
    // updatePointById: throttle(function (batch) {
    //   if (arguments.length === 2) {
    //     let id = arguments[0]
    //     let position = arguments[1]
    //     batch = [{ id, position }]
    //   }
    //   batch = batch.map(({ id, position }) => {
    //     let point = pointsGeometryQuery.get(id)
    //     let index = pointsGeometryQuery.indexOf(point)
    //     return {
    //       index,
    //       position,
    //     }
    //   })
    //   return this.updatePointImmediate(batch)
    // }, 16),
    updateLineImmediate(...batch) {
      let numerals = this.updateCommitLine(...batch)
      this.updateApplyPoint(numerals)
    },

    updateLine: throttle(function (...batch) {
      return this.updateLineImmediate(...batch)
    }, 16),
    updateCommitLine(index, position) {
      // updateCommitLine(batch) {
      // if (arguments.length === 2) {
      //   let index = arguments[0]
      //   let position = arguments[1]
      //   batch = [{ index, position }]
      // }
      // return batch.reduce((prev, { index, position }) => {
      // let line = linesGeometryQuery.getByIndex(index)
      // let pointsGeometryStart = pointsGeometryQuery.get(line.start)
      // let pointsGeometryEnd = pointsGeometryQuery.get(line.end)
      // let pointsGeometryStartIndex = pointsGeometryQuery.indexOf(pointsGeometryStart)
      // let pointsGeometryEndIndex = pointsGeometryQuery.indexOf(pointsGeometryEnd)
      // let numerals = []
      // numerals.push(...this.updateCommitPoint(pointsGeometryStartIndex,position.start))
      // numerals.push(...this.updateCommitPoint(pointsGeometryEndIndex,position.end))
      return linesGeometryManager.updateCommit(index, position)
      //   return prev
      // }, [])
    },

    update(batch) {
      if (arguments.length === 2) {
        let index = arguments[0]
        let position = arguments[1]
        batch = [{ index, position }]
      }

      let numerals = batch.reduce((prev, { index, position }) => {
        if (position instanceof Array) {
          prev.push(...this.updateCommitPoint(index, position))
          return prev
        }
        if (Object.keys(position).length === 2 && position.start instanceof Array && position.end) {
          prev.push(...this.updateCommitLine(index, position))
          return prev
        }
      }, [])

      this.updateApplyPoint(numerals)
    },
  }
}

export function usePlanes() {
  let planesGeometry = usePlanesGeometry()
  let planesHashGeometry = usePlanesHashGeometry()
  let systemsGCSManager = useSystemsGCSManager()
  let planesEntitie = usePlanesEntitie()
  return {
    add(normal, constant) {
      let plane = { normal, constant, visible: false, active: false, id: nanoid(), type: 'plane' }
      // let system = systemsGCSManager.add()
      // plane.system = system.id
      // planes.value.push(plane)
      // planesHashGeometry.value[plane.id] = plane
      return this.attach(plane)
    },
    attach(plane) {
      let system = systemsGCSManager.add()
      plane.system = system.id
      planesGeometry.value.push(plane)
      planesHashGeometry.value[plane.id] = plane
      planesEntitie.add(plane.normal, plane.constant)
      return plane
    },
    load(planes) {
      planes.forEach((plane) => {
        this.attach(plane)
      })
    },
    removeByIndex(index) {
      assertIndexFormList(planesGeometry.value, index, 'planesGeometry:removeByIndex')
      let plane = planesGeometry.value.splice(index, 1)[0]
      delete planesHashGeometry.value[plane.id]
      planesEntitie.remove(index)
      systemsGCSManager.removeById(plane.system)
    },
    remove(plane) {
      let index = planesGeometry.value.indexOf(plane)
      this.removeByIndex(index)
    },
    removeById(id) {
      let index = planesGeometry.value.findIndex((plane) => plane.id === id)
      this.removeByIndex(index)
    },
    clear() {
      systemsGCSManager.clear()
      planesEntitie.clear()
      ;[...planesGeometry.value].forEach((plane) => {
        planesGeometry.value.splice(0, 1)
        delete planesHashGeometry.value[plane.id]
      })
    },
    visible(index) {
      assertIndexFormList(planesGeometry.value, index, 'planesGeometry:visible')
      planesGeometry.value[index].visible = true
      planesEntitie.visible(index)
    },
    hidden(index) {
      assertIndexFormList(planesGeometry.value, index, 'planesGeometry:hidden')
      planesGeometry.value[index].visible = false
      planesEntitie.hidden(index)
    },
    active(index) {
      assertIndexFormList(planesGeometry.value, index, 'planesGeometry:active')
      planesGeometry.value.forEach((plane, i) => {
        if (index === i) {
          plane.active = true
          return
        }
        plane.active = false
      })
      planesEntitie.active = index
      /* [问题]
       * 到底只有一个求解器还是多个求解器 （暂时觉得是一个求解器，但是数据该归类平面还是要做）**重要**
       */
      systemsGCSManager.active(index)
    },
  }
}
/* [问题]
 * 1、已知平面求解坐标转换到世界空间坐标（基于点属于平面来转换，而不是激活平面）**重要** ko (基于构建平面做会有精度问题，比如 0 ~~~~~~ 8.881784197001252e-16)
 * 2、获取排除完全约束项，再做整体求解 ko
 * 3、意外重合的点，要不要自动约束上（目前来看不需要，因为我的点是否依赖通过ptr来判断，不通过数值了） ko
 * 4、约束项的加入与解除要考虑变量的加入与移除 加入（ko）
 * 5、加入约束，也做更新 ko
 * 6、约束项要记录数值项(约束项本身就有数据层，提供更新数值项的方法) ko
 * 7、求解信息如何使用（已经返回回来，后续将值和plane关联上；另外还要包含dependents和dependentsGroups也要转移出来和plane关联上） ko
 * 8、做一个保存与新建的按钮方便调试 ko
 */

export function usePoints() {
  let pointsGeometry = usePointsGeometry()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let planesGeometryQuery = usePlanesGeometryQuery()
  // let planesManager = usePlanes()
  let pointsHashGeometry = usePointsHashGeometry()
  let numeralsGCSQuery = useNumeralsGCSQuery()
  let pointsGCSQuery = usePointsGCSQuery()
  let pointsGCSManager = usePointsGCSManager()
  let systemsGCSManager = useSystemsGCSManager()
  let systemsGCSQuery = useSystemsGCSQuery()
  let selectPointsInteractioManager = useSelectPointsInteractioManager()
  let unknownsSetGCSManager = useUnknownsSetGCSManager()
  let toolTempGCSManager = useToolTempGCSManager()
  let unknownsSetGCSQuery = useUnknownsSetGCSQuery()
  return {
    add(position) {
      let [x, y, z] = position
      let point = {
        x,
        y,
        z,
        id: nanoid(),
        // planes: [planesManager?.active?.id],
        plane: planesGeometryQuery?.active?.id,
        type: 'point',
      }
      // let pointGCS = pointsGCSManager.add(point)
      // point.gcs = pointGCS.id
      // pointsGeometry.value.push(point)
      // pointsHashGeometry.value[point.id] = point
      // selectPointsInteractioManager.push(point.id)
      return this.attach(point)
    },
    attach(point) {
      // point = new Ponit(point)
      let pointGCS = pointsGCSManager.add(point)
      point.gcs = pointGCS.id
      pointsGeometry.value.push(point)
      pointsHashGeometry.value[point.id] = point
      // selectPointsInteractioManager.push(point.id)
      return point
    },
    load(pointsGeometry) {
      pointsGeometry.forEach((point) => {
        this.attach(point)
      })
    },
    clone(id) {
      let point = pointsHashGeometry.value[id]
      let clone = cloneDeep(point)
      clone.id = nanoid()
      return clone
    },
    removeByIndex(index) {
      assertIndexFormList(pointsGeometry.value, index, 'pointsGeometry:removeByIndex')
      let last = pointsGeometry.value.length - 1
      let point = pointsGeometry.value[index]
      if (index !== last) {
        pointsGeometry.value[index] = pointsGeometry.value[last]
      }
      pointsGeometry.value.pop()
      delete pointsHashGeometry.value[point.id]
      pointsGCSManager.removeById(point.gcs)
    },
    remove(point) {
      let index = pointsGeometry.value.indexOf(point)
      this.removeByIndex(index)
    },
    removeById(id) {
      let index = pointsGeometry.value.findIndex((point) => point.id === id)
      this.removeByIndex(index)
    },
    clear() {
      pointsGCSManager.clear()
      ;[...pointsGeometry.value].forEach((point) => {
        pointsGeometry.value.shift()
        delete pointsHashGeometry.value[point.id]
      })
    },
    // updateById(batch) {
    //   if (arguments.length === 2) {
    //     let id = arguments[0]
    //     let position = arguments[1]
    //     batch = [{ id, position }]
    //   }

    //   batch = batch.map(({ id, position }) => {
    //     let point = pointsGeometryQuery.get(id)
    //     let index = pointsGeometryQuery.indexOf(point)
    //     return {
    //       index,
    //       position,
    //     }
    //   })
    //   this.update(batch)
    // },
    // update(...batch) {
    //   /* [问题]
    //    * 这段求解调用应该移到gcs里去 ko (占时不用移动,因为保证manager从上执行原则)
    //    */
    //   let numerals = this.updateCommit(...batch)
    //   this.updateApply(numerals)
    // },
    // updateCommit(batch) {
    //   if (arguments.length === 2) {
    //     let index = arguments[0]
    //     let position = arguments[1]
    //     batch = [{ index, position }]
    //   }
    //   let numerals = []
    //   batch.forEach(({ index, position }) => {
    //     let pointCurrentGeometry = pointsGeometry.value[index]
    //     let pointCurrentGCS = pointsGCSQuery.get(pointCurrentGeometry.gcs)
    //     let numeralCurrentU = numeralsGCSQuery.get(pointCurrentGCS.u)
    //     let numeralCurrentV = numeralsGCSQuery.get(pointCurrentGCS.v)
    //     // numerals.push(numeralCurrentU, numeralCurrentV)
    //     // this.updatePure(index, position)
    //     //不是变量
    //     if (
    //       !unknownsSetGCSManager.has(numeralCurrentU) &&
    //       !unknownsSetGCSManager.has(numeralCurrentV)
    //     ) {
    //       return this.updatePure(index, position)
    //     }
    //     let plane = planesGeometryQuery.get(pointCurrentGeometry.plane)
    //     let [u, v] = worldCoords2planeCoords(position, plane)

    //     let stables = unknownsSetGCSQuery.stable()

    //     // console.log(stables.includes(numeralCurrentU), stables.includes(numeralCurrentV))

    //     if (unknownsSetGCSManager.has(numeralCurrentU) && !stables.includes(numeralCurrentU)) {
    //       numeralCurrentU.handle.set(u)
    //       let doubleX = toolTempGCSManager.addNumeral({ value: u })
    //       systemsGCSQuery.active.handle.addConstraintCoordinateX(
    //         pointCurrentGCS.handle,
    //         doubleX.handle,
    //         -1,
    //         false,
    //       )
    //       numerals.push(numeralCurrentU)
    //     }

    //     if (unknownsSetGCSManager.has(numeralCurrentV) && !stables.includes(numeralCurrentV)) {
    //       numeralCurrentV.handle.set(v)
    //       let doubleY = toolTempGCSManager.addNumeral({ value: v })
    //       systemsGCSQuery.active.handle.addConstraintCoordinateY(
    //         pointCurrentGCS.handle,
    //         doubleY.handle,
    //         -1,
    //         false,
    //       )
    //       numerals.push(numeralCurrentV)
    //     }
    //     // toolTempGCSManager.addConstraintCoordinate(pointCurrentGeometry, position)
    //   })
    //   return numerals
    // },
    updateCommit(index, position) {
      let numerals = []
      let pointCurrentGeometry = pointsGeometry.value[index]
      let pointCurrentGCS = pointsGCSQuery.get(pointCurrentGeometry.gcs)
      let numeralCurrentU = numeralsGCSQuery.get(pointCurrentGCS.u)
      let numeralCurrentV = numeralsGCSQuery.get(pointCurrentGCS.v)
      // numerals.push(numeralCurrentU, numeralCurrentV)
      // this.updatePure(index, position)
      //不是变量
      if (
        !unknownsSetGCSManager.has(numeralCurrentU) &&
        !unknownsSetGCSManager.has(numeralCurrentV)
      ) {
        this.updatePure(index, position)
        return numerals
      }
      let plane = planesGeometryQuery.get(pointCurrentGeometry.plane)
      let [u, v] = worldCoords2planeCoords(position, plane)

      let stables = unknownsSetGCSQuery.stable()
      // console.log(stables, unknownsSetGCSManager.has(numeralCurrentU), numeralCurrentU)

      // console.log(stables.includes(numeralCurrentU), stables.includes(numeralCurrentV))

      if (!unknownsSetGCSManager.has(numeralCurrentU)) {
        let [x, y, z] = planeCoords2worldCoords([u, numeralCurrentV.handle.value], plane)
        this.updatePure(index, [x, y, z])
        // this.updatePure(index, [position[0], pointCurrentGeometry.y, position[2]])
      }
      if (!unknownsSetGCSManager.has(numeralCurrentV)) {
        let [x, y, z] = planeCoords2worldCoords([numeralCurrentU.handle.value, v], plane)
        this.updatePure(index, [x, y, z])
        // this.updatePure(index, [pointCurrentGeometry.x, position[1], position[2]])
      }

      if (unknownsSetGCSManager.has(numeralCurrentU) && !stables.includes(numeralCurrentU)) {
        numeralCurrentU.handle.set(u)
        let doubleX = toolTempGCSManager.addNumeral({ value: u })
        systemsGCSQuery.active.handle.addConstraintCoordinateX(
          pointCurrentGCS.handle,
          doubleX.handle,
          -1,
          false,
        )
        numerals.push(numeralCurrentU)
      }

      if (unknownsSetGCSManager.has(numeralCurrentV) && !stables.includes(numeralCurrentV)) {
        numeralCurrentV.handle.set(v)
        let doubleY = toolTempGCSManager.addNumeral({ value: v })
        systemsGCSQuery.active.handle.addConstraintCoordinateY(
          pointCurrentGCS.handle,
          doubleY.handle,
          -1,
          false,
        )
        numerals.push(numeralCurrentV)
      }
      // toolTempGCSManager.addConstraintCoordinate(pointCurrentGeometry, position)
      return numerals
    },
    updateApply(numerals) {
      let result = systemsGCSManager.solver()
      let { dependentsGroups, dependents, status, redundants } = result
      // console.log(result)
      let updatedPoints = new Set()
      dependentsGroups.forEach((rows) => {
        if (numerals.some((numeral) => rows.includes(numeral.ptr))) {
          rows.forEach((ptr) => {
            let numeralGCS = numeralsGCSQuery.getByPtr(ptr)
            let pointGCS = pointsGCSQuery.get(numeralGCS.creator)
            if (!pointGCS) return
            let pointGeometry = pointsGeometryQuery.get(pointGCS.creator)
            // console.log(ptr,pointGeometry.id)
            if (updatedPoints.has(pointGeometry)) {
              // console.log("updatedPoints.has(pointGeometry)", pointGeometry)
              return
            }
            updatedPoints.add(pointGeometry)
            this.updateByNumeralPtr(ptr)
          })
        }
      })

      systemsGCSQuery.active.handle.clearByTag(-1)
      toolTempGCSManager.clearNumerals()
    },
    updateByNumeralPtr(ptr) {
      let numeralGCS = numeralsGCSQuery.getByPtr(ptr)
      let pointGCS = pointsGCSQuery.get(numeralGCS.creator)
      if (!pointGCS) return
      let pointGeometry = pointsGeometryQuery.get(pointGCS.creator)
      // console.log(pointGeometry)
      // if (updatedPoints.has(pointGeometry)) {
      //   return
      // }
      // updatedPoints.add(pointGeometry)
      // console.log(pointGeometry)
      let index = pointsGeometryQuery.indexOf(pointGeometry)
      let numeralU = numeralsGCSQuery.get(pointGCS.u)
      let numeralV = numeralsGCSQuery.get(pointGCS.v)

      let plane = planesGeometryQuery.get(pointGeometry.plane)
      let [x, y, z] = planeCoords2worldCoords([numeralU.handle.value, numeralV.handle.value], plane)
      this.updatePure(index, [x, y, z])
    },
    updatePure(index, position) {
      assertIndexFormList(pointsGeometry.value, index, 'pointsGeometry:updatePure')
      let [x, y, z] = position
      pointsGeometry.value[index].x = x
      pointsGeometry.value[index].y = y
      pointsGeometry.value[index].z = z
      pointsGCSManager.update(pointsGeometry.value[index])
    },
  }
}

export function useLines() {
  let linesGeometry = useLinesGeometry()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let linesHashGeometry = useLinesHashGeometry()
  let pointsGeometryManager = usePoints()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let pointsGeometryUpdater = usePointsGeometryUpdater()
  return {
    add(start, end) {
      let line = {
        start,
        end,
        id: nanoid(),
        planes: [planesGeometryQuery?.active?.id],
        type: 'line',
      }
      // linesGeometry.value.push(line) //我们的架构是否一定两个点在同一plane？
      // linesHashGeometry.value[line.id] = line
      return this.attach(line)
    },
    attach(line) {
      let start = pointsGeometryQuery.get(line.start)
      let end = pointsGeometryQuery.get(line.end)
      start.creator = line.id
      end.creator = line.id
      linesGeometry.value.push(line) //我们的架构是否一定两个点在同一plane？
      linesHashGeometry.value[line.id] = line
      return line
    },
    load(lines) {
      lines.forEach((line) => {
        this.attach(line)
      })
    },
    removeByIndex(index) {
      assertIndexFormList(linesGeometry.value, index, 'linesGeometry:removeByIndex')
      let last = linesGeometry.value.length - 1
      let line = linesGeometry.value[index]
      if (index !== last) {
        linesGeometry.value[index] = linesGeometry.value[last]
      }
      linesGeometry.value.pop()
      delete linesHashGeometry.value[line.id]
      if (pointsGeometryQuery.get(line.start)) pointsGeometryManager.removeById(line.start)
      if (pointsGeometryQuery.get(line.end)) pointsGeometryManager.removeById(line.end)
    },
    remove(line) {
      let index = linesGeometry.value.indexOf(line)
      this.removeByIndex(index)
    },
    removeById(id) {
      let index = linesGeometry.value.findIndex((line) => line.id === id)
      this.removeByIndex(index)
    },
    clear() {
      pointsGeometryManager.clear()
      ;[...linesGeometry.value].forEach((line) => {
        linesGeometry.value.shift()
        delete linesHashGeometry.value[line.id]
      })
    },
    updateCommit(index, position) {
      let line = linesGeometry.value[index]
      let pointsGeometryStart = pointsGeometryQuery.get(line.start)
      let pointsGeometryEnd = pointsGeometryQuery.get(line.end)
      let pointsGeometryStartIndex = pointsGeometryQuery.indexOf(pointsGeometryStart)
      let pointsGeometryEndIndex = pointsGeometryQuery.indexOf(pointsGeometryEnd)
      let numerals = []
      numerals.push(...pointsGeometryUpdater.updateCommit(pointsGeometryStartIndex, position.start))
      numerals.push(...pointsGeometryUpdater.updateCommit(pointsGeometryEndIndex, position.end))
      return numerals
    },
    // updateCommit(batch) {
    //   if (arguments.length === 2) {
    //     let index = arguments[0]
    //     let position = arguments[1]
    //     batch = [{ index, position }]
    //   }
    //   let numerals = []
    //   batch.forEach(({ index, position }) => {
    //     let line = linesGeometry.value[index]
    //     let pointsGeometryStart = pointsGeometryQuery.get(line.start)
    //     let pointsGeometryEnd = pointsGeometryQuery.get(line.end)
    //     let pointsGeometryStartIndex = pointsGeometryQuery.indexOf(pointsGeometryStart)
    //     let pointsGeometryEndIndex = pointsGeometryQuery.indexOf(pointsGeometryEnd)

    //     numerals.push(
    //       ...pointsGeometryManager.updateCommit(pointsGeometryStartIndex, position.start),
    //     )
    //     numerals.push(...pointsGeometryManager.updateCommit(pointsGeometryEndIndex, position.end))
    //   })
    //   return numerals
    // },
    // update(index, position) {
    //   let line = linesGeometry.value[index]
    //   let pointsGeometryStart = pointsGeometryQuery.get(line.start)
    //   let pointsGeometryEnd = pointsGeometryQuery.get(line.end)
    //   let pointsGeometryStartIndex = pointsGeometryQuery.indexOf(pointsGeometryStart)
    //   let pointsGeometryEndIndex = pointsGeometryQuery.indexOf(pointsGeometryEnd)
    //   geometryManager.updatePoint([
    //     { index: pointsGeometryStartIndex, position: position.start },
    //     { index: pointsGeometryEndIndex, position: position.end },
    //   ])
    // },
    // update(index, position) {
    //   let numerals = this.updateCommit(index, position)
    //   this.updateApply(numerals)
    // },
    // updateApply(numerals) {
    //   pointsGeometryManager.updateApply(numerals)
    // },
  }
}

export function usePolylines() {
  let polylinesGeometry = usePolylinesGeometry()
  let polylinesHashGeometry = usePolylinesHashGeometry()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let linesGeometryManager = useLines()
  let linesGeometryQuery = useLinesGeometryQuery()
  return {
    add(lines) {
      let polyline = {
        lines,
        id: nanoid(),
        planes: [planesGeometryQuery?.active?.id],
        type: 'polyline',
      }
      // polylinesGeometry.value.push(polyline)
      // polylinesHashGeometry.value[polyline.id] = polyline
      return this.attach(polyline)
    },
    attach(polyline) {
      polylinesGeometry.value.push(polyline)
      polylinesHashGeometry.value[polyline.id] = polyline
      return polyline
    },
    load(polylinesGeometry) {
      polylinesGeometry.forEach((polyline) => {
        this.attach(polyline)
      })
    },
    removeByIndex(index) {
      assertIndexFormList(polylinesGeometry.value, index, 'polylinesGeometry:removeByIndex')
      let polyline = polylinesGeometry.value.splice(index, 1)[0]
      delete polylinesHashGeometry.value[polyline.id]
      polyline.lines.forEach((line) => {
        if (linesGeometryQuery.get(line)) linesGeometryManager.removeById(line)
      })
    },
    remove(polyline) {
      let index = polylinesGeometry.value.indexOf(polyline)
      this.removeByIndex(index)
    },
    removeById(id) {
      let index = polylinesGeometry.value.findIndex((polyline) => polyline.id === id)
      this.removeByIndex(index)
    },
    clear() {
      linesGeometryManager.clear()
      ;[...polylinesGeometry.value].forEach((polyline) => {
        polylinesGeometry.value.shift()
        delete polylinesHashGeometry.value[polyline.id]
      })
    },
  }
}
export function useArcs() {
  let arcsGeometry = useArcsGeometry()
  let arcsHashGeometry = useArcsHashGeometry()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let pointsGeometryManager = usePoints()
  let arcsGCSManager = useArcsGCSManager()
  let constraintsManager = useConstraintsManager()
  let systemsGCSQuery = useSystemsGCSQuery()
  let pointsGCSMapper = usePointsGCSMapper()
  let toolTempGCSManager = useToolTempGCSManager()
  let arcsGeometryQuery = useArcsGeometryQuery()
  return {
    add(center, start, end, ccw) {
      let arc = {
        center,
        start,
        end,
        ccw,
        id: nanoid(),
        plane: planesGeometryQuery?.active?.id,
        type: 'arc',
      }
      // arcsGeometry.value.push(arc)
      // arcsHashGeometry.value[arc.id] = arc
      this.attach(arc)

      let pointCenterGeometry = pointsGeometryQuery.get(arc.center)
      toolTempGCSManager.addConstraintCoordinateLock(pointCenterGeometry)

      constraintsManager.addConstraintArcRules(arc.id)

      return arc
    },
    attach(arc) {
      let center = pointsGeometryQuery.get(arc.center)
      let start = pointsGeometryQuery.get(arc.start)
      let end = pointsGeometryQuery.get(arc.end)
      center.creator = arc.id
      start.creator = arc.id
      end.creator = arc.id
      arcsGeometry.value.push(arc)
      arcsHashGeometry.value[arc.id] = arc
      let arcGCS = arcsGCSManager.add(arc)
      arcGCS.creator = arc.id
      arc.gcs = arcGCS.id
      return arc
    },
    load(arcsGeometry) {
      arcsGeometry.forEach((arc) => {
        this.attach(arc)
      })
    },
    removeByIndex(index) {
      assertIndexFormList(arcsGeometry.value, index, 'arcsGeometry:removeByIndex')
      let last = arcsGeometry.value.length - 1
      let arc = arcsGeometry.value[index]
      if (index !== last) {
        arcsGeometry.value[index] = arcsGeometry.value[last]
      }
      arcsGCSManager.remove(arc)
      arcsGeometry.value.pop()
      delete arcsHashGeometry.value[arc.id]
      if (pointsGeometryQuery.get(arc.center)) pointsGeometryManager.removeById(arc.center)
      if (pointsGeometryQuery.get(arc.end)) pointsGeometryManager.removeById(arc.end)
      if (pointsGeometryQuery.get(arc.end)) pointsGeometryManager.removeById(arc.end)
    },
    remove(arc) {
      let index = arcsGeometry.value.indexOf(arc)
      this.removeByIndex(index)
    },
    removeById(id) {
      let index = arcsGeometry.value.findIndex((arc) => arc.id === id)
      this.removeByIndex(index)
    },
    clear() {
      pointsGeometryManager.clear()
      ;[...arcsGeometry.value].forEach((arc) => {
        arcsGeometry.value.shift()
        delete arcsHashGeometry.value[arc.id]
      })
    },
    // update(index, position) {
    //   let numerals = this.updateCommit(index, position)
    //   this.updateApply(numerals)
    // },
    updateApply(numerals) {
      pointsGeometryManager.updateApply(numerals)
    },
    updateCommit(index, position) {
      let numerals = []
      let pointGeometry = pointsGeometryQuery.getByIndex(index)
      let arcFormCenter = arcsGeometryQuery.getFormCenter(pointGeometry)
      let arcFormStart = arcsGeometryQuery.getFormStart(pointGeometry)
      let arcFormEnd = arcsGeometryQuery.getFormEnd(pointGeometry)
      let numeralsCurrent = pointsGeometryManager.updateCommit(index, position)
      numerals.push(...numeralsCurrent)
      if (arcFormStart || arcFormEnd) {
        let arc = arcFormStart || arcFormEnd
        let pointCenterGeometry = pointsGeometryQuery.get(arc.center)
        toolTempGCSManager.addConstraintCoordinateLock(pointCenterGeometry)
      }

      if (arcFormCenter) {
        toolTempGCSManager.addConstraintArcRadiusLock(arcFormCenter)
      }
      // if (arcFormStart) {
      //   arcsGCSManager.updateStart(arcFormStart)
      // }
      // if (arcFormEnd) {
      //   arcsGCSManager.updateEnd(arcFormEnd)
      // }

      return numerals
    },
    // updateCommit(batch) {
    //   if (arguments.length === 2) {
    //     let index = arguments[0]
    //     let position = arguments[1]
    //     batch = [{ index, position }]
    //   }
    //   let numerals = []
    //   batch.forEach(({ index, position }) => {
    //     let pointGeometry = pointsGeometryQuery.getByIndex(index)
    //     let arcFormCenter = arcsGeometryQuery.getFormCenter(pointGeometry)
    //     let arcFormStart = arcsGeometryQuery.getFormStart(pointGeometry)
    //     let arcFormEnd = arcsGeometryQuery.getFormEnd(pointGeometry)
    //     let numeralsCurrent = pointsGeometryManager.updateCommit(index, position)
    //     numerals.push(...numeralsCurrent)
    //     if (arcFormStart || arcFormEnd) {
    //       let arc = arcFormStart || arcFormEnd
    //       let pointCenterGeometry = pointsGeometryQuery.get(arc.center)
    //       toolTempGCSManager.addConstraintCoordinateLock(pointCenterGeometry)
    //     }

    //     if (arcFormCenter) {
    //       toolTempGCSManager.addConstraintArcRadiusLock(arcFormCenter)
    //     }
    //     // if (arcFormStart) {
    //     //   arcsGCSManager.updateStart(arcFormStart)
    //     // }
    //     // if (arcFormEnd) {
    //     //   arcsGCSManager.updateEnd(arcFormEnd)
    //     // }
    //   })

    //   return numerals
    // },
  }
}

// export function useConstraints() {
//   let constraintsGeometry = useConstraintsGeometry()
//   let constraintsHashGeometry = useConstraintsHashGeometry()
//   let constraintsPlaneHashGeometry = useConstraintsPlaneHashGeometry()
//   let constraintsIncrementGeometryQuery = useConstraintsIncrementGeometryQuery()
//   let constraintsGCSManager = useConstraintsGCSManager()
//   let planesGeometryQuery = usePlanesGeometryQuery()
//   let pointsManager = usePoints()
//   let pointsGeometryQuery = usePointsGeometryQuery()
//   let constraintsGeometryQuery = useConstraintsGeometryQuery()
//   let systemsGCSManager = useSystemsGCSManager()
//   let systemsGCSQuery = useSystemsGCSQuery()
//   let unknownsSetGCSQuery = useUnknownsSetGCSQuery()
//   let resultsGCSQuery = useResultsGCSQuery()
//   let numeralsGCSQuery = useNumeralsGCSQuery()
//   let pointsGCSQuery = usePointsGCSQuery()
//   let arcsGCSMapper = useArcsGCSMapper()
//   let toolTempGCSManager = useToolTempGCSManager()

//   let constraintsBatch = []
//   function usageConstraintsBatch() {
//     let numerals = []
//     constraintsBatch.forEach((constraint) => {
//       constraint.args.forEach((arg, index) => {
//         /* [联动] 1
//          * 找出与该约束有关的变量
//          */
//         if (constraint.points instanceof Array && constraint.points.includes(index)) {
//           let pointGeometry = pointsGeometryQuery.get(arg)
//           let pointGCS = pointsGCSQuery.get(pointGeometry.gcs)
//           let unknown = constraint.unknowns[index]
//           if (!(unknown instanceof Array)) return
//           if (unknown.includes('x')) {
//             let numeralU = numeralsGCSQuery.get(pointGCS.u)
//             numerals.push(numeralU)
//           }
//           if (unknown.includes('y')) {
//             let numeralV = numeralsGCSQuery.get(pointGCS.v)
//             numerals.push(numeralV)
//           }
//           return
//         }
//         if (constraint.arcs instanceof Array && constraint.arcs.includes(index)) {
//           let arcsGCS = arcsGCSMapper.getByGeometry(arg)

//           let pointGCSCenter = pointsGCSQuery.get(arcsGCS.center)
//           let pointGCSStart = pointsGCSQuery.get(arcsGCS.start)
//           let pointGCSEnd = pointsGCSQuery.get(arcsGCS.end)

//           let numeralCenterU = numeralsGCSQuery.get(pointGCSCenter.u)
//           let numeralCenterV = numeralsGCSQuery.get(pointGCSCenter.v)
//           numerals.push(numeralCenterU)
//           numerals.push(numeralCenterV)
//           let numeralStartU = numeralsGCSQuery.get(pointGCSStart.u)
//           let numeralStartV = numeralsGCSQuery.get(pointGCSStart.v)
//           numerals.push(numeralStartU)
//           numerals.push(numeralStartV)
//           let numeralEndU = numeralsGCSQuery.get(pointGCSEnd.u)
//           let numeralEndV = numeralsGCSQuery.get(pointGCSEnd.v)
//           numerals.push(numeralEndU)
//           numerals.push(numeralEndV)

//           return
//         }
//       })
//     })
//     constraintsBatch = []
//     return numerals
//   }
//   function updateGeometry() {
//     let numeralsRelated = usageConstraintsBatch()

//     let updatedPoints = new Set()
//     function updated(ptr) {
//       let numeralGCS = numeralsGCSQuery.getByPtr(ptr)
//       let pointGCS = pointsGCSQuery.get(numeralGCS.creator)
//       if (!pointGCS) return
//       let pointGeometry = pointsGeometryQuery.get(pointGCS.creator)
//       if (updatedPoints.has(pointGeometry)) {
//         return true
//       }
//       updatedPoints.add(pointGeometry)
//     }

//     let stables = unknownsSetGCSQuery.stable()
//     let stablesRelated = numeralsRelated.filter((numeral) => stables.includes(numeral))
//     stablesRelated.forEach(({ ptr }) => {
//       if (updated(ptr)) return
//       pointsManager.updateByNumeralPtr(ptr)
//     })

//     let resultCurrent = resultsGCSQuery.get(systemsGCSQuery.active.result)
//     let resultBackup = resultsGCSQuery.backup(systemsGCSQuery.active.result)
//     // console.log(resultCurrent, resultBackup)
//     // console.log(resultCurrent, numeralsRelated)
//     ;[...resultCurrent.dependentsGroups, ...resultBackup.dependentsGroups].forEach((rows) => {
//       if (numeralsRelated.some((numeral) => rows.includes(numeral.ptr))) {
//         rows.forEach((ptr) => {
//           if (updated(ptr)) return
//           pointsManager.updateByNumeralPtr(ptr)
//         })
//       }
//     })
//   }

//   let effect = debounce(function effect() {
//     /* [问题]
//      * 这段求解调用应该移到gcs里去
//      */
//     systemsGCSManager.reset()
//     systemsGCSManager.solver()
//     updateGeometry()

//     systemsGCSQuery.active.handle.clearByTag(-1)
//     toolTempGCSManager.clearNumerals()
//   }, 16)

//   return {
//     updateNumerals(id, numerals) {
//       let constraint = constraintsGeometryQuery.get(id)
//       // if (constraint.numerals.length !== numerals.length) {
//       //   throw new Error('constraint.numerals.length !== numerals.length!')
//       // }
//       constraint.numerals.forEach((index, i) => {
//         constraint.args[index] = numerals[i]
//       })
//       // constraintsGCSManager.update(constraint)
//       // effect()
//     },
//     add(constraint) {
//       let tag = constraintsIncrementGeometryQuery.get()
//       constraint.tag = tag
//       constraint.id = nanoid()
//       constraint.args.push(tag, true)
//       constraint.plane = planesGeometryQuery?.active?.id

//       this.attach(constraint)
//     },
//     attach(constraint) {
//       let constraintGCS = constraintsGCSManager.add(constraint)
//       constraintGCS.creator = constraint.id
//       constraint.gcs = constraintGCS.id
//       constraintsGeometry.value.push(constraint)
//       constraintsHashGeometry.value[constraint.id] = constraint
//       if (!(constraintsPlaneHashGeometry.value[constraint.plane] instanceof Array)) {
//         constraintsPlaneHashGeometry.value[constraint.plane] = []
//       }
//       constraintsPlaneHashGeometry.value[constraint.plane].push(constraint)
//       constraintsBatch.push(constraint)
//       effect()
//     },
//     load(constraintsGeometry) {
//       constraintsGeometry.forEach((constraint) => {
//         this.attach(constraint)
//       })
//     },
//     removeByIndex(index) {
//       let constraint = constraintsGeometry.value.splice(index, 1)[0]
//       delete constraintsHashGeometry.value[constraint.id]
//       let constraintsPlaneHashItem = constraintsPlaneHashGeometry.value[constraint.plane]
//       let indexForConstraintsPlaneHash = constraintsPlaneHashItem.indexOf(constraint)
//       constraintsPlaneHashItem.splice(indexForConstraintsPlaneHash, 1)
//       constraintsGCSManager.removeById(constraint.gcs)
//     },
//     remove(constraint) {
//       let index = constraintsGeometry.value.indexOf(constraint)
//       this.removeByIndex(index)
//     },
//     clear() {
//       constraintsGCSManager.clear()
//       ;[...constraintsGeometry.value].forEach((constraint) => {
//         constraintsGeometry.value.shift()
//         delete constraintsHashGeometry.value[constraint.id]
//       })
//       Object.keys(constraintsPlaneHashGeometry.value).forEach((plane) => {
//         delete constraintsPlaneHashGeometry.value[plane]
//       })
//     },
//     addConstraintP2PDistance(p1, p2, distance) {
//       let constraint = {
//         type: 'addConstraintP2PDistance',
//         args: [p1, p2, distance],
//         points: [0, 1],
//         numerals: [2],
//         unknowns: [
//           ['x', 'y'],
//           ['x', 'y'],
//         ],
//       }
//       this.add(constraint)
//     },
//     addConstraintHorizontal() {},
//     addConstraintCoordinate(p, { x, y }) {
//       this.addConstraintCoordinateX(p, x)
//       this.addConstraintCoordinateY(p, y)
//     },
//     addConstraintCoordinateX(p, x) {
//       let constraint = {
//         type: 'addConstraintCoordinateX',
//         args: [p, x],
//         points: [0],
//         numerals: [1],
//         unknowns: [['x']],
//       }
//       this.add(constraint)
//     },
//     addConstraintCoordinateY(p, y) {
//       let constraint = {
//         type: 'addConstraintCoordinateY',
//         args: [p, y],
//         points: [0],
//         numerals: [1],
//         unknowns: [['y']],
//       }
//       this.add(constraint)
//     },
//     addConstraintP2PCoincident(p1, p2) {
//       let constraint = {
//         type: 'addConstraintP2PCoincident',
//         args: [p1, p2],
//         points: [0, 1],
//         unknowns: [
//           ['x', 'y'],
//           ['x', 'y'],
//         ],
//       }
//       this.add(constraint)
//     },
//     addConstraintArcRules(arc) {
//       let constraint = {
//         type: 'addConstraintArcRules',
//         args: [arc],
//         arcs: [0],
//       }
//       this.add(constraint)
//     },
//   }
// }

// export function useConstraintsIncrement() {
//   let constraintsIncrementGeometry = useConstraintsIncrementGeometry()
//   return {
//     set(number) {
//       constraintsIncrementGeometry.value = number
//     },
//   }
// }

// export function useIncrement() {
//   let incrementGeometry = useIncrementGeometry()
//   return {
//     set(number) {
//       incrementGeometry.value = number
//     },
//   }
// }
