import {
  usePoints as usePointsGeometryManager,
  useLines as useLinesGeometryManager,
  usePolylines as usePolylinesGeometryManager,
  useArcs as useArcsGeometryManager,
  useDimensionDistances as useDimensionDistancesGeometryManager,
} from './geometry-manager'
import {
  usePlanes as usePlanesGeometryQuery,
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
  usePolylines as usePolylinesGeometryQuery,
  useArcs as useArcsGeometryQuery,
  useDimensionDistances as useDimensionDistancesGeometryQuery,
} from './geometry-query'
import {
  usePoints as usePointsGeometryMapper,
  useLines as useLinesGeometryMapper,
  usePolylines as usePolylinesGeometryMapper,
  useArcs as useArcsGeometryMapper,
} from './geometry-mapper'
import { useConstraints as useConstraintsDispatch } from './constraint-dispatch'
import { useToolTemp as useToolTempGCSManager } from './solver-gcs-manager.js'
export function useGeometrys() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  let polylinesGeometryQuery = usePolylinesGeometryQuery()
  let arcsGeometryQuery = useArcsGeometryQuery()
  let dimensionDistancesGeometryQuery = useDimensionDistancesGeometryQuery()

  let pointsGeometryMapper = usePointsGeometryMapper()
  let linesGeometryMapper = useLinesGeometryMapper()
  let polylinesGeometryMapper = usePolylinesGeometryMapper()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  let arcsGeometryMapper = useArcsGeometryMapper()

  let constraintsDispatch = useConstraintsDispatch()

  let arcsGeometryDispatch = useArcs()
  // let polylinesGeometryDispatch = usePolylines()
  let linesGeometryDispatch = useLines()
  let pointsGeometryDispatch = usePoints()
  let dimensionDistancesGeometryDispatch = useDimensionDistances()

  return {
    remove(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      let geometryMap = batch.reduce(
        (prev, id) => {
          if (pointsGeometryQuery.hasById(id)) {
            prev.points.push(id)
          }
          if (linesGeometryQuery.hasById(id)) {
            prev.lines.push(id)
          }
          if (polylinesGeometryQuery.hasById(id)) {
            prev.polylines.push(id)
          }
          if (arcsGeometryQuery.hasById(id)) {
            prev.arcs.push(id)
          }
          if (dimensionDistancesGeometryQuery.hasById(id)) {
            prev.dimensionDistances.push(id)
          }
          return prev
        },
        { points: [], lines: [], polylines: [], arcs: [], dimensionDistances: [] },
      )

      /*
       * 收集关系移除项
       */
      //收集points所属
      let { lines: linesSuperiorFromPoints, arcs: arcsSuperiorFromPoints } =
        pointsGeometryMapper.superior(geometryMap.points)
      //收集lines所属
      let {
        // polylines: polylinesSuperiorFromLines,
        dimensionDistances: dimensionDistancesSuperiorFromLines,
      } = linesGeometryMapper.superior([...geometryMap.lines, ...linesSuperiorFromPoints])

      //反过来收集相关所从lines
      let { lines: linesSubordinateFromDimensionDistances } =
        dimensionDistancesGeometryMapper.subordinate([
          ...geometryMap.dimensionDistances,
          ...dimensionDistancesSuperiorFromLines,
        ])
      //多段线不用反向收集了，因为他不是单纯得一次性所有删除
      // let { lines: linesSubordinateFromPolylines } =polylinesGeometryMapper.subordinate([
      //   ...geometryMap.polylines,
      //   ...polylinesSuperiorFromLines,
      // ])

      //反过来收集相关所从points
      let { points: pointsSubordinateFromLines } = linesGeometryMapper.subordinate([
        ...geometryMap.lines,
        ...linesSuperiorFromPoints,
        ...linesSubordinateFromDimensionDistances,
      ])
      let { points: pointsSubordinateFromArcs } = arcsGeometryMapper.subordinate([
        ...geometryMap.arcs,
        ...arcsSuperiorFromPoints,
      ])

      // //polylines 不用直接移除，在移除line时去计算是否移除polyline
      // let { points: pointsSubordinateFromPolylines, lines: linesSubordinateFromPolylines } =
      //   polylinesGeometryMapper.subordinate(geometryMap.polylines)

      let points = new Set([
        ...geometryMap.points,
        ...pointsSubordinateFromLines,
        ...pointsSubordinateFromArcs,
        // ...pointsSubordinateFromPolylines,
      ])
      let lines = new Set([
        ...geometryMap.lines,
        // ...linesSubordinateFromPolylines,
        ...linesSuperiorFromPoints,
        ...linesSubordinateFromDimensionDistances,
      ])
      // let polylines = new Set([...geometryMap.polylines])
      let arcs = new Set([...geometryMap.arcs, ...arcsSuperiorFromPoints])
      let dimensionDistances = new Set([
        ...geometryMap.dimensionDistances,
        ...dimensionDistancesSuperiorFromLines,
      ])

      //开始移除
      constraintsDispatch.removeItemByGeometry([
        ...points,
        ...lines,
        // ...linesSubordinateFromPolylines,
        // ...polylines,
        ...arcs,
      ])

      /* [问题]
       * 约束操作调整为 async，准确的完成以下操作
       */
      dimensionDistancesGeometryDispatch.removeById([...dimensionDistances])
      arcsGeometryDispatch.removeById([...arcs])
      // polylinesGeometryDispatch.removeById(polylines)
      linesGeometryDispatch.removeById([...lines])
      pointsGeometryDispatch.removeById([...points])
    },
  }
}

export function usePoints() {
  let pointsGeometryManager = usePointsGeometryManager()
  let pointsGeometryQuery = usePointsGeometryQuery()
  return {
    removeById(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      batch.forEach((id) => {
        pointsGeometryManager.removeById(id)
      })
    },
  }
}
export function useLines() {
  let linesGeometryManager = useLinesGeometryManager()
  let linesGeometryQuery = useLinesGeometryQuery()
  let polylinesGeometryQuery = usePolylinesGeometryQuery()
  let polylinesGeometryManager = usePolylinesGeometryManager()
  return {
    removeById(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      batch.forEach((id) => {
        let line = linesGeometryQuery.get(id)
        if (polylinesGeometryQuery.hasById(line.creator)) {
          polylinesGeometryManager.splitByLineId(id)
        }
        linesGeometryManager.removeById(id)
      })
    },
  }
}
// function usePolylines() {
//   let polylinesGeometryManager = usePolylinesGeometryManager()
//   let polylinesGeometryQuery = usePolylinesGeometryQuery()
//   return {
//     removeById(batch) {
//       if (!(batch instanceof Array)) {
//         batch = [batch]
//       }
//       batch.forEach((id) => {
//         polylinesGeometryManager.removeById(id)
//       })
//     },
//   }
// }
export function useArcs() {
  let arcsGeometryManager = useArcsGeometryManager()
  let arcsGeometryQuery = useArcsGeometryQuery()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let toolTempGCSManager = useToolTempGCSManager()
  return {
    removeById(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      batch.forEach((id) => {
        arcsGeometryManager.removeById(id)
      })
    },
    updateCommit(index, position) {
      let pointGeometry = pointsGeometryQuery.getByIndex(index)
      let arcFormCenter = arcsGeometryQuery.getFormCenter(pointGeometry)
      let arcFormStart = arcsGeometryQuery.getFormStart(pointGeometry)
      let arcFormEnd = arcsGeometryQuery.getFormEnd(pointGeometry)

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
    },
  }
}

import { Vector3 } from '../core/gl-math'
import { useRenderer } from './viewport-provide-context'
import { worldCoords2planeCoords, planeCoords2worldCoords } from '../utils/simple'
import { useDimensionDistances as useDimensionDistancesGeometryMapper } from './geometry-mapper'
import { useSelectGeometrys as useSelectGeometrysInteractionDispatch } from './interaction-dispatch.js'
const space = 50
export function useDimensionDistances() {
  let updatedOnce = new Set()
  let dimensionDistancesGeometryManager = useDimensionDistancesGeometryManager()
  let dimensionDistancesGeometryQuery = useDimensionDistancesGeometryQuery()
  let linesGeometryManager = useLinesGeometryManager()
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryManager = usePointsGeometryManager()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let renderer = useRenderer()
  // let geometryUpdater = useGeometryUpdater()
  let constraintsDispatch = useConstraintsDispatch()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  let selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  let toolTempGCSManager = useToolTempGCSManager()

  function setConstraintDriving(id, constraint) {
    let dimensionDistancesGeometry = dimensionDistancesGeometryQuery.get(id)
    dimensionDistancesGeometry.constraintDriving = constraint
  }
  function getConstraintDriving(id) {
    let dimensionDistancesGeometry = dimensionDistancesGeometryQuery.get(id)
    return dimensionDistancesGeometry.constraintDriving
  }
  function switchConstraint(id, activate = true) {
    let dimensionDistance = dimensionDistancesGeometryQuery.get(id)
    let [main, corss1, corss2] = dimensionDistance.lines

    let corss1LineGeometry = linesGeometryQuery.get(corss1)
    let corss2LineGeometry = linesGeometryQuery.get(corss2)

    let constraintDriving = getConstraintDriving(id)
    if (constraintDriving) constraintsDispatch.removeById(constraintDriving)

    if (activate) {
      let constraint = constraintsDispatch.add('addConstraintCoordinate', [
        corss1LineGeometry.start,
        corss2LineGeometry.start,
      ])
      setConstraintDriving(id, constraint.id)
    } else {
      let corss1PointStartGeometry = pointsGeometryQuery.get(corss1LineGeometry.start)
      let corss2PointStartGeometry = pointsGeometryQuery.get(corss2LineGeometry.start)
      let vector3Start = new Vector3(
        corss1PointStartGeometry.x,
        corss1PointStartGeometry.y,
        corss1PointStartGeometry.z,
      )
      let vector3End = new Vector3(
        corss2PointStartGeometry.x,
        corss2PointStartGeometry.y,
        corss2PointStartGeometry.z,
      )
      let vector3Line = vector3End.sub(vector3Start)

      let constraint = constraintsDispatch.add('addConstraintP2PDistance', [
        corss1LineGeometry.start,
        corss2LineGeometry.start,
        vector3Line.length(),
      ])
      setConstraintDriving(id, constraint.id)
    }
  }

  return {
    removeById(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      batch.forEach((id) => {
        dimensionDistancesGeometryManager.removeById(id)
      })
    },
    addPonit2Point(point1Id, point2Id) {
      let pointGeometry1 = pointsGeometryQuery.get(point1Id)
      let pointGeometry2 = pointsGeometryQuery.get(point2Id)
      /*
       * 创建主线
       */
      let mainPointStart = pointsGeometryManager.add([
        pointGeometry1.x,
        pointGeometry1.y,
        pointGeometry1.z,
      ])
      let mainPointEnd = pointsGeometryManager.add([
        pointGeometry2.x,
        pointGeometry2.y,
        pointGeometry2.z,
      ])
      let mainLine = linesGeometryManager.add(mainPointStart.id, mainPointEnd.id)

      /*
       * 平移主线
       */
      let plane = planesGeometryQuery.get(mainLine.plane)
      let vector3Start = new Vector3(mainPointStart.x, mainPointStart.y, mainPointStart.z)
      let vector3End = new Vector3(mainPointEnd.x, mainPointEnd.y, mainPointEnd.z)
      let vector3Line = vector3End.sub(vector3Start)
      let vector3LineNormalize = vector3Line.clone().normalize()
      let vector3Normal = new Vector3(...plane.normal)
      let vector3Perp = new Vector3().crossVectors(vector3Normal, vector3LineNormalize).normalize()

      let [uOffset, vOffset] = worldCoords2planeCoords(vector3Perp.toArray(), plane)

      let [width, height] = renderer.getSize()
      uOffset *= (space / width) * 2
      vOffset *= (space / height) * 2

      let [xOffset, yOffset, zOffset] = planeCoords2worldCoords([uOffset, vOffset], plane)

      ;[mainPointStart, mainPointEnd].forEach((point) => {
        let index = pointsGeometryQuery.indexOf(point)
        pointsGeometryManager.updatePure(
          index,
          new Vector3(point.x, point.y, point.z)
            .add(new Vector3(xOffset, yOffset, zOffset))
            .toArray(),
        )
      })

      /*
       * 创建交叉
       */
      let crossPointStart1 = pointsGeometryManager.clone(point1Id)
      let crossPointEnd1 = pointsGeometryManager.clone(mainPointStart.id)
      pointsGeometryManager.attach(crossPointStart1)
      pointsGeometryManager.attach(crossPointEnd1)
      let crossLine1 = linesGeometryManager.add(crossPointStart1.id, crossPointEnd1.id)
      let crossPointStart2 = pointsGeometryManager.clone(point2Id)
      let crossPointEnd2 = pointsGeometryManager.clone(mainPointEnd.id)
      pointsGeometryManager.attach(crossPointStart2)
      pointsGeometryManager.attach(crossPointEnd2)
      let crossLine2 = linesGeometryManager.add(crossPointStart2.id, crossPointEnd2.id)

      /*
       * 创建dimension数据
       */
      let dimensionDistance = dimensionDistancesGeometryManager.add([
        mainLine.id,
        crossLine1.id,
        crossLine2.id,
      ])

      /*
       * 创建约束
       */
      constraintsDispatch.add('addConstraintPerpendicular2', [
        mainPointStart.id,
        mainPointEnd.id,
        crossPointStart1.id,
        crossPointEnd1.id,
      ])
      constraintsDispatch.add('addConstraintPerpendicular2', [
        mainPointStart.id,
        mainPointEnd.id,
        crossPointStart2.id,
        crossPointEnd2.id,
      ])
      constraintsDispatch.add('addConstraintParallel2', [
        crossPointStart1.id,
        crossPointStart2.id,
        mainPointStart.id,
        mainPointEnd.id,
      ])
      constraintsDispatch.add('addConstraintP2PCoincident', [point1Id, crossPointStart1.id])
      constraintsDispatch.add('addConstraintP2PCoincident', [crossPointEnd1.id, mainPointStart.id])
      constraintsDispatch.add('addConstraintP2PCoincident', [point2Id, crossPointStart2.id])
      constraintsDispatch.add('addConstraintP2PCoincident', [crossPointEnd2.id, mainPointEnd.id])
      switchConstraint(dimensionDistance.id, false)
    },

    updateBefore(id) {
      if (updatedOnce.has(id)) return
      updatedOnce.add(id)
      switchConstraint(id, true)
    },
    updateAfter(id) {
      updatedOnce.delete(id)
      switchConstraint(id, false)
    },
    activate(subId) {
      let dimensionDistanceGeometry =
        dimensionDistancesGeometryMapper.getFormLineId(subId) ||
        dimensionDistancesGeometryMapper.getFormPointId(subId)

      if (dimensionDistanceGeometry) {
        let { points, lines } = dimensionDistancesGeometryMapper.subordinate(
          dimensionDistanceGeometry.id,
        )
        selectGeometrysInteractionDispatch.push([...points, ...lines])
      }
    },
    deactivate(subId) {
      let dimensionDistanceGeometry =
        dimensionDistancesGeometryMapper.getFormLineId(subId) ||
        dimensionDistancesGeometryMapper.getFormPointId(subId)

      if (dimensionDistanceGeometry) {
        let { points, lines } = dimensionDistancesGeometryMapper.subordinate(
          dimensionDistanceGeometry.id,
        )
        selectGeometrysInteractionDispatch.remove([...points, ...lines])
      }
    },
  }
}

export function useHelpers() {
  let dimensionDistancesGeometryDispatch = useDimensionDistances()
  return {
    activate(subId) {
      dimensionDistancesGeometryDispatch.activate(subId)
    },
    deactivate(subId) {
      dimensionDistancesGeometryDispatch.deactivate(subId)
    },
  }
}

/* [增强]
 * 1、dimensionDistances增加独立选取
 * 2、删除功能关联dimensionDistances
 * 3、渲染模块系统性加入样式规则（颜色、几何大小）
 * 4、约束注册功能增加隐式标记
 * 5、dimensionDistances增加操作约束（只能在dimension方向上移动——角度）
 */

/*
 * 1、每种几何都建立1对多影响思路
 * 2、分解成多个hooks
 * 要包含：收集能力，处理能力（如polyline分解成多段）
 * 3、约束不要考虑掉了（在solver-gcs里可以针对性处理逻辑）
 */

/*
 * 解除约束会影响几何数据（在solver-gcs里定义unattach）
 * 删除几何会影响约束（当前这个文件处理？）
 * 删除几何会影响其他几何（当前这个文件能处理）
 *
 * 先处理约束再处理几何
 */

/*
 * 1、先收集到最小单位 点和线
 * 2、从哪个开始删（线），删点要不要把线另一头也删了（不删吧）
 * 3、要修改相关的几何的属性（creator）
 * 4、polyline和以后的rectangle这些不要直接删，而是删除线或者点的时候看还有子项没
 */

/*
 * 1、点和弧、线，先来回收集
 * 2、多段线怎么处理，有属于要删除多段线的 线 就不单独删除了
 */
