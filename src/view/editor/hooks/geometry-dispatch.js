import {
  usePoints as usePointsGeometryManager,
  useLines as useLinesGeometryManager,
  usePolylines as usePolylinesGeometryManager,
  useArcs as useArcsGeometryManager,
} from './geometry-manager'
import {
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
  usePolylines as usePolylinesGeometryQuery,
  useArcs as useArcsGeometryQuery,
} from './geometry-query'
import {
  usePoints as usePointsGeometryMapper,
  useLines as useLinesGeometryMapper,
  usePolylines as usePolylinesGeometryMapper,
  useArcs as useArcsGeometryMapper,
} from './geometry-mapper'
import { useConstraintsRelation as useConstraintsRelationQuery } from './constraint-query'
import { useConstraints as useConstraintsDispatch } from './constraint-dispatch'
export function useGeometrys() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  let polylinesGeometryQuery = usePolylinesGeometryQuery()
  let arcsGeometryQuery = useArcsGeometryQuery()
  let constraintsRelationQuery = useConstraintsRelationQuery()

  let pointsGeometryMapper = usePointsGeometryMapper()
  let linesGeometryMapper = useLinesGeometryMapper()
  let polylinesGeometryMapper = usePolylinesGeometryMapper()
  let arcsGeometryMapper = useArcsGeometryMapper()

  let constraintsDispatch = useConstraintsDispatch()

  let arcsGeometryDispatch = useArcs()
  // let polylinesGeometryDispatch = usePolylines()
  let linesGeometryDispatch = useLines()
  let pointsGeometryDispatch = usePoints()

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
          return prev
        },
        { points: [], lines: [], polylines: [], arcs: [] },
      )

      /*
       * 收集关系移除项
       */
      //收集points所属
      let { lines: linesSuperiorFromPoints, arcs: arcsSuperiorFromPoints } =
        pointsGeometryMapper.superior(geometryMap.points)
      //反过来收集相关所从points
      let { points: pointsSubordinateFromLines } = linesGeometryMapper.subordinate([
        ...geometryMap.lines,
        ...linesSuperiorFromPoints,
      ])
      let { points: pointsSubordinateFromArcs } = arcsGeometryMapper.subordinate([
        ...geometryMap.arcs,
        ...arcsSuperiorFromPoints,
      ])
      //polylines 不用直接移除，在移除line时去计算是否移除polyline
      let { points: pointsSubordinateFromPolylines, lines: linesSubordinateFromPolylines } =
        polylinesGeometryMapper.subordinate(geometryMap.polylines)

      let points = new Set([
        ...geometryMap.points,
        ...pointsSubordinateFromLines,
        ...pointsSubordinateFromArcs,
        ...pointsSubordinateFromPolylines,
      ])
      let lines = new Set([
        ...geometryMap.lines,
        ...linesSubordinateFromPolylines,
        ...linesSuperiorFromPoints,
      ])
      let polylines = new Set([...geometryMap.polylines])
      let arcs = new Set([...geometryMap.arcs, ...arcsSuperiorFromPoints])

      //开始移除
      constraintsDispatch.removeItemByGeometry([
        ...points,
        ...lines,
        ...linesSubordinateFromPolylines,
        ...polylines,
        ...arcs,
      ])
      setTimeout(() => {
        arcsGeometryDispatch.removeById([...arcs])
        // polylinesGeometryDispatch.removeById(polylines)
        linesGeometryDispatch.removeById([...lines])
        pointsGeometryDispatch.removeById([...points])
      }, 100)
    },
  }
}

function usePoints() {
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
function useLines() {
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
          polylinesGeometryManager.splitByLine(id)
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
function useArcs() {
  let arcsGeometryManager = useArcsGeometryManager()
  return {
    removeById(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      batch.forEach((id) => {
        arcsGeometryManager.removeById(id)
      })
    },
  }
}

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
