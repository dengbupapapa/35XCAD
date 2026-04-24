import {
  usePoints as usePointsGeometryManager,
  useLines as useLinesGeometryManager,
  usePolylines as usePolylinesGeometryManager,
  useArcs as useArcsGeometryManager,
  useDimensionDistances as useDimensionDistancesGeometryManager,
  useTexts as useTextsGeometryManager,
} from './geometry-manager'
import {
  usePlanes as usePlanesGeometryQuery,
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
  usePolylines as usePolylinesGeometryQuery,
  useArcs as useArcsGeometryQuery,
  useDimensionDistances as useDimensionDistancesGeometryQuery,
  useTexts as useTextsGeometryQuery,
} from './geometry-query'
import {
  usePoints as usePointsGeometryMapper,
  useLines as useLinesGeometryMapper,
  usePolylines as usePolylinesGeometryMapper,
  useArcs as useArcsGeometryMapper,
} from './geometry-mapper'
import { useConstraints as useConstraintsDispatch } from './constraint-dispatch'
import { useEffectDdebouncePromise as useEffectDdebouncePromiseConstraintQuery } from './constraint-query'
import { useToolTemp as useToolTempGCSManager } from './solver-gcs-manager.js'
export function useGeometrys() {
  let pointsGeometryQuery = usePointsGeometryQuery()
  let linesGeometryQuery = useLinesGeometryQuery()
  let polylinesGeometryQuery = usePolylinesGeometryQuery()
  let arcsGeometryQuery = useArcsGeometryQuery()
  let dimensionDistancesGeometryQuery = useDimensionDistancesGeometryQuery()
  let textsGeometryQuery = useTextsGeometryQuery()

  let pointsGeometryMapper = usePointsGeometryMapper()
  let linesGeometryMapper = useLinesGeometryMapper()
  let polylinesGeometryMapper = usePolylinesGeometryMapper()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  let arcsGeometryMapper = useArcsGeometryMapper()

  let constraintsDispatch = useConstraintsDispatch({ effectDdebounce: true })
  let effectDdebouncePromiseConstraintQuery = useEffectDdebouncePromiseConstraintQuery()

  let arcsGeometryDispatch = useArcs()
  // let polylinesGeometryDispatch = usePolylines()
  let linesGeometryDispatch = useLines()
  let pointsGeometryDispatch = usePoints()
  let dimensionDistancesGeometryDispatch = useDimensionDistances()
  let textsGeometryDispatch = useTexts()

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
          if (textsGeometryQuery.hasById(id)) {
            prev.texts.push(id)
          }
          return prev
        },
        { points: [], lines: [], polylines: [], arcs: [], dimensionDistances: [], texts: [] },
      )
      /*
       * 收集关系移除项
       */
      //收集points所属
      let {
        lines: linesSuperiorFromPoints,
        arcs: arcsSuperiorFromPoints,
        texts: textsSuperiorFromPoints,
      } = pointsGeometryMapper.superior(geometryMap.points)
      //收集lines所属
      let {
        // polylines: polylinesSuperiorFromLines,
        dimensionDistances: dimensionDistancesSuperiorFromLines,
      } = linesGeometryMapper.superior([...geometryMap.lines, ...linesSuperiorFromPoints])

      //反过来收集所从dimensionDistance
      let { dimensionDistances: dimensionDistancesSubordinateFromPoints } =
        pointsGeometryMapper.subordinate(geometryMap.points)
      let { dimensionDistances: dimensionDistancesSubordinateFromLines } =
        linesGeometryMapper.subordinate([...geometryMap.lines, ...linesSuperiorFromPoints])

      //反过来收集相关所从lines
      let {
        points: pointsSubordinateFromDimensionDistances,
        lines: linesSubordinateFromDimensionDistances,
        texts: textsSubordinateFromDimensionDistances,
      } = dimensionDistancesGeometryMapper.subordinate([
        ...geometryMap.dimensionDistances,
        ...dimensionDistancesSuperiorFromLines,
        ...dimensionDistancesSubordinateFromPoints,
        ...dimensionDistancesSubordinateFromLines,
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

      //还需要收集有关联的（比如 点 或 线 被 尺寸约束的部分  ）

      let points = new Set([
        ...geometryMap.points,
        ...pointsSubordinateFromLines,
        ...pointsSubordinateFromArcs,
        ...pointsSubordinateFromDimensionDistances,
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
        ...dimensionDistancesSubordinateFromPoints,
        ...dimensionDistancesSubordinateFromLines,
      ])

      let texts = new Set([
        ...geometryMap.texts,
        ...textsSuperiorFromPoints,
        ...textsSubordinateFromDimensionDistances,
      ])

      //开始移除
      constraintsDispatch.removeItemByGeometry([
        ...points,
        ...lines,
        // ...linesSubordinateFromPolylines,
        // ...polylines,
        ...arcs,
      ])

      //约束操作调整为 async，准确的完成以下操作
      function clearGeometry() {
        dimensionDistancesGeometryDispatch.removeById([...dimensionDistances])
        textsGeometryDispatch.removeById([...texts])
        arcsGeometryDispatch.removeById([...arcs])
        // polylinesGeometryDispatch.removeById(polylines)
        linesGeometryDispatch.removeById([...lines])
        pointsGeometryDispatch.removeById([...points])
      }
      let effectDdebouncePromise = effectDdebouncePromiseConstraintQuery.get()
      if (effectDdebouncePromise) {
        effectDdebouncePromise.then(clearGeometry)
      } else {
        clearGeometry()
      }
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

import { Vector3, Vector2 } from '../core/gl-math'
import { useRenderer } from './viewport-provide-context'
import { worldCoords2planeCoords, planeCoords2worldCoords } from '../utils/simple'
import { useDimensionDistances as useDimensionDistancesGeometryMapper } from './geometry-mapper'
import { useSelectGeometrys as useSelectGeometrysInteractionDispatch } from './interaction-dispatch.js'
import configUI from '../config-ui.json'
const space = 50
let updatedOnceDimensionDistance = new Set()
export function useDimensionDistances() {
  let dimensionDistancesGeometryManager = useDimensionDistancesGeometryManager()
  let dimensionDistancesGeometryQuery = useDimensionDistancesGeometryQuery()
  let linesGeometryManager = useLinesGeometryManager()
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryManager = usePointsGeometryManager()
  let pointsGeometryQuery = usePointsGeometryQuery()
  let planesGeometryQuery = usePlanesGeometryQuery()
  let pointsGeometryMapper = usePointsGeometryMapper()
  let linesGeometryMapper = useLinesGeometryMapper()

  let renderer = useRenderer()
  // let geometryUpdater = useGeometryUpdater()
  let constraintsDispatch = useConstraintsDispatch()
  let dimensionDistancesGeometryMapper = useDimensionDistancesGeometryMapper()
  let selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  let textsGeometryDispatch = useTexts()

  function setConstraintDistance(id, constraint) {
    let dimensionDistancesGeometry = dimensionDistancesGeometryQuery.get(id)
    dimensionDistancesGeometry.constraintDistance = constraint
  }

  function getConstraintDistance(id) {
    let dimensionDistancesGeometry = dimensionDistancesGeometryQuery.get(id)
    return dimensionDistancesGeometry.constraintDistance
  }

  // function setConstraintCoordinate(id, constraint) {
  //   let dimensionDistancesGeometry = dimensionDistancesGeometryQuery.get(id)
  //   dimensionDistancesGeometry.constraintCoordinate = constraint
  // }

  // function getConstraintCoordinate(id) {
  //   let dimensionDistancesGeometry = dimensionDistancesGeometryQuery.get(id)
  //   return dimensionDistancesGeometry.constraintCoordinate
  // }

  // function switchConstraint(id, use = true) {
  //   let dimensionDistance = dimensionDistancesGeometryQuery.get(id)
  //   let [main, corss1, corss2] = dimensionDistance.lines

  //   let corss1LineGeometry = linesGeometryQuery.get(corss1)
  //   let corss2LineGeometry = linesGeometryQuery.get(corss2)
  //   let mainLineGeometry = linesGeometryQuery.get(main)

  //   if (use) {
  //     let constraintDistance = getConstraintDistance(id)
  //     if (constraintDistance) constraintsDispatch.disable(constraintDistance)
  //     let geometrys = dimensionDistance.creator

  //     let pointsCoordinate = []
  //     geometrys.forEach((id) => {
  //       if (pointsGeometryQuery.hasById(id)) {
  //         pointsCoordinate.push(id)
  //       }
  //       if (linesGeometryQuery.hasById(id)) {
  //         let lineGeometry = linesGeometryQuery.get(id)
  //         pointsCoordinate.push(lineGeometry.start, lineGeometry.end)
  //       }
  //     })
  //     let constraint = constraintsDispatch.add('addConstraintCoordinate', pointsCoordinate)
  //     setConstraintCoordinate(id, constraint.id)
  //   } else {
  //     let constraintCoordinate = getConstraintCoordinate(id)
  //     if (constraintCoordinate) constraintsDispatch.removeById(constraintCoordinate)

  //     let constraintDistance = getConstraintDistance(id)
  //     if (constraintDistance) {
  //       constraintsDispatch.enable(constraintDistance)
  //     } else {
  //       let corss1PointStartGeometry = pointsGeometryQuery.get(corss1LineGeometry.start)
  //       let corss2PointStartGeometry = pointsGeometryQuery.get(corss2LineGeometry.start)
  //       let vector3Start = new Vector3(
  //         corss1PointStartGeometry.x,
  //         corss1PointStartGeometry.y,
  //         corss1PointStartGeometry.z,
  //       )
  //       let vector3End = new Vector3(
  //         corss2PointStartGeometry.x,
  //         corss2PointStartGeometry.y,
  //         corss2PointStartGeometry.z,
  //       )
  //       let vector3Line = vector3End.sub(vector3Start)

  //       let constraint = constraintsDispatch.add('addConstraintP2PDistance', [
  //         mainLineGeometry.start,
  //         mainLineGeometry.end,
  //         vector3Line.length(),
  //       ])
  //       setConstraintDistance(id, constraint.id)
  //     }
  //   }
  // }

  function setConstraintUnstable(id, constraints) {
    let dimensionDistancesGeometry = dimensionDistancesGeometryQuery.get(id)
    dimensionDistancesGeometry.constraintUnstable = constraints
  }
  function getConstraintUnstable(id) {
    let dimensionDistancesGeometry = dimensionDistancesGeometryQuery.get(id)
    return dimensionDistancesGeometry.constraintUnstable
  }

  function switchConstraint(id, use = true) {
    let dimensionDistance = dimensionDistancesGeometryQuery.get(id)
    // let [main, corss1, corss2] = dimensionDistance.lines

    // let corss1LineGeometry = linesGeometryQuery.get(corss1)
    // let corss2LineGeometry = linesGeometryQuery.get(corss2)
    // let mainLineGeometry = linesGeometryQuery.get(main)

    // let planeGeometry = planesGeometryQuery.get(corss1LineGeometry.plane)
    // let corss1StartGeometry = pointsGeometryQuery.get(corss1LineGeometry.start)
    // let corss1EndGeometry = pointsGeometryQuery.get(corss1LineGeometry.end)
    // // let direction = [
    // //   corss1EndGeometry.x - corss1StartGeometry.x,
    // //   corss1EndGeometry.y - corss1StartGeometry.y,
    // //   corss1EndGeometry.z - corss1StartGeometry.z,
    // // ]
    // // let [u, v] = worldCoords2planeCoords(direction, planeGeometry)
    // // let angle = Math.atan2(v, u)
    // // console.log(angle)

    let constraintUnstable = getConstraintUnstable(id)
    if (constraintUnstable) {
      constraintUnstable.forEach((id) => {
        constraintsDispatch.removeById(id)
      })
    }
    let constraintDistance = getConstraintDistance(id)
    if (use) {
      constraintsDispatch.disable(constraintDistance)

      setConstraintUnstable(id, [
        constraintsDispatch.add(
          'addConstraintCoordinate',
          [].concat(
            ...dimensionDistance.coincidents.map((coincident) => {
              return coincident[0]
            }),
          ),
        ).id,
        // constraintsDispatch.add('addConstraintP2PAngle', [
        //   corss1LineGeometry.start,
        //   corss1LineGeometry.end,
        //   angle,
        // ]).id,
      ])
    } else {
      constraintsDispatch.enable(constraintDistance)

      setConstraintUnstable(
        id,
        dimensionDistance.coincidents.map((coincident) => {
          return constraintsDispatch.add('addConstraintP2PCoincident', coincident).id
        }),
      )
    }
  }

  function switchConstraintPoint2Line(id, use = true) {
    let dimensionDistance = dimensionDistancesGeometryQuery.get(id)
    let [main, corss1, corss2] = dimensionDistance.lines
    let [point1Id, point2Id] = dimensionDistance.anchor
    let [a, lineId] = dimensionDistance.creator

    let corss1LineGeometry = linesGeometryQuery.get(corss1)
    let corss2LineGeometry = linesGeometryQuery.get(corss2)
    let mainLineGeometry = linesGeometryQuery.get(main)

    let planeGeometry = planesGeometryQuery.get(corss1LineGeometry.plane)
    let corss1StartGeometry = pointsGeometryQuery.get(corss1LineGeometry.start)
    let corss1EndGeometry = pointsGeometryQuery.get(corss1LineGeometry.end)
    let direction = [
      corss1EndGeometry.x - corss1StartGeometry.x,
      corss1EndGeometry.y - corss1StartGeometry.y,
      corss1EndGeometry.z - corss1StartGeometry.z,
    ]
    let [u, v] = worldCoords2planeCoords(direction, planeGeometry)
    let angle = Math.atan2(v, u)
    console.log(angle)

    let constraintUnstable = getConstraintUnstable(id)
    if (constraintUnstable) {
      constraintUnstable.forEach((id) => {
        constraintsDispatch.removeById(id)
      })
    }
    let constraintDistance = getConstraintDistance(id)
    if (use) {
      constraintsDispatch.disable(constraintDistance)
      setConstraintUnstable(id, [
        constraintsDispatch.add('addConstraintCoordinate', [
          corss1LineGeometry.start,
          corss2LineGeometry.start,
        ]).id,
        constraintsDispatch.add('addConstraintP2PAngle', [
          corss1LineGeometry.start,
          corss1LineGeometry.end,
          angle,
        ]).id,
      ])
    } else {
      constraintsDispatch.enable(constraintDistance)
      setConstraintUnstable(id, [
        constraintsDispatch.add('addConstraintP2PCoincident', [point1Id, corss1LineGeometry.start])
          .id,
        constraintsDispatch.add('addConstraintP2PCoincident', [point2Id, corss2LineGeometry.start])
          .id,
        constraintsDispatch.add('addConstraintPointOnLine', [point2Id, lineId]).id,
        constraintsDispatch.add('addConstraintPointOnPerpBisector', [point2Id, lineId]).id,
        constraintsDispatch.add('addConstraintPerpendicular', [mainLineGeometry.id, lineId]).id,
      ])
    }
  }
  /*
   * 创建约束
   */
  function createConstraints(dimensionDistanceId) {
    //, [point1Id, point2Id]) {
    let dimensionDistance = dimensionDistancesGeometryQuery.get(dimensionDistanceId)
    let [main, corss1, corss2] = dimensionDistance.lines

    let mainLineGeometry = linesGeometryQuery.get(main)
    let corss1LineGeometry = linesGeometryQuery.get(corss1)
    let corss2LineGeometry = linesGeometryQuery.get(corss2)

    constraintsDispatch.add('addConstraintPerpendicular2', [
      mainLineGeometry.start,
      mainLineGeometry.end,
      corss1LineGeometry.start,
      corss1LineGeometry.end,
    ])
    constraintsDispatch.add('addConstraintPerpendicular2', [
      mainLineGeometry.start,
      mainLineGeometry.end,
      corss2LineGeometry.start,
      corss2LineGeometry.end,
    ])
    // constraintsDispatch.add('addConstraintParallel2', [
    //   ///????????????????
    //   corss1LineGeometry.start,
    //   corss2LineGeometry.start,
    //   mainLineGeometry.start,
    //   mainLineGeometry.end,
    // ])
    // constraintsDispatch.add('addConstraintP2PCoincident', [point1Id, corss1LineGeometry.start])
    constraintsDispatch.add('addConstraintP2PCoincident', [
      corss1LineGeometry.end,
      mainLineGeometry.start,
    ])
    // constraintsDispatch.add('addConstraintP2PCoincident', [point2Id, corss2LineGeometry.start])???????????
    constraintsDispatch.add('addConstraintP2PCoincident', [
      corss2LineGeometry.end,
      mainLineGeometry.end,
    ])

    let mainLineGeometryStartGeometry = pointsGeometryQuery.get(mainLineGeometry.start)
    let mainLineGeometryEndGeometry = pointsGeometryQuery.get(mainLineGeometry.end)
    let vector3Start = new Vector3(
      mainLineGeometryStartGeometry.x,
      mainLineGeometryStartGeometry.y,
      mainLineGeometryStartGeometry.z,
    )
    let vector3End = new Vector3(
      mainLineGeometryEndGeometry.x,
      mainLineGeometryEndGeometry.y,
      mainLineGeometryEndGeometry.z,
    )
    let vector3Line = vector3End.sub(vector3Start)

    let constraint = constraintsDispatch.add('addConstraintP2PDistance', [
      mainLineGeometry.start,
      mainLineGeometry.end,
      vector3Line.length(),
    ])
    setConstraintDistance(dimensionDistanceId, constraint.id)
  }
  /*
   * 修正
   */
  let fixCreator = []
  function fixCreatorStore(id) {
    let dimensionDistance = dimensionDistancesGeometryQuery.get(id)
    let geometrys = dimensionDistance.creator
    let points = []
    geometrys.forEach((id) => {
      if (pointsGeometryQuery.hasById(id)) {
        points.push(id)
      }
      if (linesGeometryQuery.hasById(id)) {
        let lineGeometry = linesGeometryQuery.get(id)
        points.push(lineGeometry.start, lineGeometry.end)
      }
    })
    points.forEach((id) => {
      let pointGeometry = pointsGeometryQuery.get(id)
      let index = pointsGeometryQuery.indexOf(pointGeometry)
      fixCreator.push({ index, position: [pointGeometry.x, pointGeometry.y, pointGeometry.z] })
    })
  }
  function fixCreatorStart() {
    let numerals = fixCreator.map(({ index, position }) => {
      return pointsGeometryManager.updateCommit(index, position)
    })
    fixCreator = []
    return [].concat(...numerals)
  }

  // function switchConstraint(id, use = true) {
  //   let dimensionDistance = dimensionDistancesGeometryQuery.get(id)

  //   let pointsCoordinate = []
  //   dimensionDistance.creator.forEach((id) => {
  //     if (pointsGeometryQuery.hasById(id)) {
  //       pointsCoordinate.push(id)
  //     }
  //     if (linesGeometryQuery.hasById(id)) {
  //       let lineGeometry = linesGeometryQuery.get(id)
  //       pointsCoordinate.push(lineGeometry.start, lineGeometry.end)
  //     }
  //   })
  //   pointsCoordinate.forEach((id) => {
  //     if (use) {
  //       pointsGeometryManager.driven(id)
  //     } else {
  //       pointsGeometryManager.undriven(id)
  //     }
  //   })
  // }
  /*
   * 创建几何
   */
  function createGeometry([endpoint1Id, endpoint2Id], [anchor1Id, anchor2Id]) {
    let endpointGeometry1 = pointsGeometryQuery.get(endpoint1Id)
    let endpointGeometry2 = pointsGeometryQuery.get(endpoint2Id)
    let anchorGeometry1 = pointsGeometryQuery.get(anchor1Id)
    let anchorGeometry2 = pointsGeometryQuery.get(anchor2Id)
    //不是一个平面不让创建
    if (
      new Set([
        endpointGeometry1.plane,
        endpointGeometry2.plane,
        anchorGeometry1.plane,
        anchorGeometry2.plane,
      ]).size !== 1
    )
      return
    /*
     * 创建主线
     */
    let plane = planesGeometryQuery.get(anchorGeometry1.plane)
    let vector3Start = new Vector3(anchorGeometry1.x, anchorGeometry1.y, anchorGeometry1.z)
    let vector3End = new Vector3(anchorGeometry2.x, anchorGeometry2.y, anchorGeometry2.z)
    let vector3Line = vector3End.sub(vector3Start)
    let vector3LineNormalize = vector3Line.clone().normalize()
    let vector3Normal = new Vector3(...plane.normal)
    let vector3Perp = new Vector3().crossVectors(vector3Normal, vector3LineNormalize).normalize()

    let [uOffset, vOffset] = worldCoords2planeCoords(vector3Perp.toArray(), plane)

    let [width, height] = renderer.getSize()
    uOffset *= (space / width) * 2
    vOffset *= (space / height) * 2

    let [xOffset, yOffset, zOffset] = planeCoords2worldCoords([uOffset, vOffset], plane)

    let mainPointStartPosition = new Vector3(
      anchorGeometry1.x,
      anchorGeometry1.y,
      anchorGeometry1.z,
    )
      .add(new Vector3(xOffset, yOffset, zOffset))
      .toArray()
    let mainPointEndPosition = new Vector3(anchorGeometry2.x, anchorGeometry2.y, anchorGeometry2.z)
      .add(new Vector3(xOffset, yOffset, zOffset))
      .toArray()
    let mainPointStart = pointsGeometryManager.add(mainPointStartPosition)
    let mainPointEnd = pointsGeometryManager.add(mainPointEndPosition)
    let mainLine = linesGeometryManager.add(mainPointStart.id, mainPointEnd.id)

    /*
     * 创建交叉
     */
    let crossPointStart1 = pointsGeometryManager.clone(endpoint1Id)
    let crossPointEnd1 = pointsGeometryManager.clone(mainPointStart.id)
    pointsGeometryManager.attach(crossPointStart1)
    pointsGeometryManager.attach(crossPointEnd1)
    let crossLine1 = linesGeometryManager.add(crossPointStart1.id, crossPointEnd1.id)

    let crossPointStart2 = pointsGeometryManager.clone(endpoint2Id)
    let crossPointEnd2 = pointsGeometryManager.clone(mainPointEnd.id)
    pointsGeometryManager.attach(crossPointStart2)
    pointsGeometryManager.attach(crossPointEnd2)
    let crossLine2 = linesGeometryManager.add(crossPointStart2.id, crossPointEnd2.id)

    /*
     * 创建数值
     */
    let number = vector3Line.length()
    let numberPrecision = configUI['dimension-distance-numerical-precision']
    let text = number.toFixed(numberPrecision)
    let textGeometry = textsGeometryDispatch.add(text, mainLine.id)

    return [mainLine, crossLine1, crossLine2, textGeometry]
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
      let [mainLine, crossLine1, crossLine2, text] = createGeometry(
        [point1Id, point2Id],
        [point1Id, point2Id],
      )
      let dimensionDistance = dimensionDistancesGeometryManager.add({
        lines: [mainLine.id, crossLine1.id, crossLine2.id],
        text: text.id,
        creator: [point1Id, point2Id],
        coincidents: [
          [crossLine1.start, point1Id],
          [crossLine2.start, point2Id],
        ],
      })
      createConstraints(dimensionDistance.id)
      switchConstraint(dimensionDistance.id, true)
      // fixCreatorStore(dimensionDistance.id)
      constraintsDispatch.add('addConstraintParallel2', [
        crossLine1.start,
        crossLine2.start,
        mainLine.start,
        mainLine.end,
      ])
      switchConstraint(dimensionDistance.id, false)
      // fixCreatorStart()

      return dimensionDistance
    },

    addPonit2Line(pointId, lineId) {
      let pointGeometry = pointsGeometryQuery.get(pointId)
      let lineGeometry = linesGeometryQuery.get(lineId)
      if (pointGeometry.plane !== lineGeometry.plane) return
      /*
       * 临时创建一个在线上的点
       */
      let planeGeometry = planesGeometryQuery.get(pointGeometry.plane)
      let pointStartGeometry = pointsGeometryQuery.get(lineGeometry.start)
      let pointEndGeometry = pointsGeometryQuery.get(lineGeometry.end)
      let UVPoint = worldCoords2planeCoords(
        [pointGeometry.x, pointGeometry.y, pointGeometry.z],
        planeGeometry,
      )
      let UVPointStart = worldCoords2planeCoords(
        [pointStartGeometry.x, pointStartGeometry.y, pointStartGeometry.z],
        planeGeometry,
      )
      let UVPointEnd = worldCoords2planeCoords(
        [pointEndGeometry.x, pointEndGeometry.y, pointEndGeometry.z],
        planeGeometry,
      )
      let UVPointVector2 = new Vector2(...UVPoint)
      let UVPointStartVector2 = new Vector2(...UVPointStart)
      let UVPointEndVector2 = new Vector2(...UVPointEnd)
      let dir = UVPointEndVector2.clone().sub(UVPointStartVector2)
      let t = UVPointVector2.clone().sub(UVPointStartVector2).dot(dir) / dir.lengthSq()
      let pProjection = UVPointStartVector2.clone().add(dir.clone().multiplyScalar(t))
      //投影点
      let pointOnLineProjection = planeCoords2worldCoords(pProjection.toArray(), planeGeometry)
      let pointOnLineProjectionGeometry = pointsGeometryManager.add(pointOnLineProjection)
      let pointOnLineProjectionId = pointOnLineProjectionGeometry.id
      //中点
      let pMiddle = UVPointStartVector2.clone().add(dir.clone().multiplyScalar(0.5))
      let pointOnLineMiddle = planeCoords2worldCoords(pMiddle.toArray(), planeGeometry)
      let pointOnLineMiddleGeometry = pointsGeometryManager.add(pointOnLineMiddle)
      let pointOnLineMiddleId = pointOnLineMiddleGeometry.id
      //几何
      let [mainLine, crossLine1, crossLine2, text] = createGeometry(
        [pointId, pointOnLineProjectionId],
        [pointId, pointOnLineProjectionId],
      )
      //延长线
      let lineExtended = linesGeometryManager.add(pointOnLineMiddleId, pointOnLineProjectionId)
      /*
       * 创建尺寸数据
       */
      let dimensionDistance = dimensionDistancesGeometryManager.add({
        lines: [mainLine.id, crossLine1.id, crossLine2.id, lineExtended.id],
        points: [pointOnLineMiddleId, pointOnLineProjectionId],
        text: text.id,
        creator: [pointId, lineId],
        coincidents: [
          [crossLine1.start, pointId],
          [crossLine2.start, pointOnLineProjectionId],
        ],
      })
      /*
       * 约束
       */
      createConstraints(dimensionDistance.id)
      switchConstraint(dimensionDistance.id, true)
      constraintsDispatch.add('addConstraintParallel2', [
        crossLine1.start,
        crossLine2.start,
        mainLine.start,
        mainLine.end,
      ])

      constraintsDispatch.add('addConstraintPointOnLine', [pointOnLineProjectionId, lineId])
      constraintsDispatch.add('addConstraintPointOnLine', [pointOnLineMiddleId, lineId])
      constraintsDispatch.add('addConstraintPointOnPerpBisector', [pointOnLineMiddleId, lineId])
      constraintsDispatch.add('addConstraintPerpendicular2', [
        lineGeometry.start,
        lineGeometry.end,
        pointId,
        pointOnLineProjectionId,
      ])
      switchConstraint(dimensionDistance.id, false)

      return dimensionDistance
    },
    addLine2Line(lineId1, lineId2) {
      let lineGeometry1 = linesGeometryQuery.get(lineId1)
      let lineGeometry2 = linesGeometryQuery.get(lineId2)
      if (lineGeometry1.plane !== lineGeometry2.plane) return
      let pointId = lineGeometry1.start
      /*
       * [问题]
       * 还需要判断该两直线是否存在平行约束,如果存在就不要再加了,不然约束冗余
       */
      constraintsDispatch.add('addConstraintParallel', [lineId1, lineId2])
      let dimensionDistance = this.addPonit2Line(pointId, lineId2)
      return dimensionDistance
    },

    updateBefore(id) {
      if (updatedOnceDimensionDistance.has(id)) return
      updatedOnceDimensionDistance.add(id)
      switchConstraint(id, true)
      // fixCreatorStore(id)
      // fixCreatorStart()
    },
    updateCommit(index) {
      // let pointGeometry = pointsGeometryQuery.getByIndex(index)
      // let dimensionDistanceGeometry = dimensionDistancesGeometryMapper.getFormPoint(pointGeometry)
      // fixCreatorStore(dimensionDistanceGeometry.id)
      // return fixCreatorStart()
      // let id = dimensionDistanceGeometry.id
      // console.log(3, id, updatedOnceDimensionDistance)
      // if (updatedOnceDimensionDistance.has(id)) return
      // updatedOnceDimensionDistance.add(id)
      // switchConstraint(dimensionDistanceGeometry.id, true)
      // console.log(1, id)
    },
    updateAfter(id) {
      if (!updatedOnceDimensionDistance.has(id)) return
      updatedOnceDimensionDistance.delete(id)
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
        let [mainLine, crossLine1, crossLine2, ...linesExtended] = lines
        let crossLine1Geometry = linesGeometryQuery.get(crossLine1)
        let crossLine2Geometry = linesGeometryQuery.get(crossLine2)

        let lineExtendedIds = []
        linesExtended.forEach((id) => {
          let lineExtended = linesGeometryQuery.get(id)
          lineExtendedIds.push(lineExtended.start, lineExtended.end)
        })
        points = points.filter((id) => {
          return (
            id !== crossLine1Geometry.start &&
            id !== crossLine2Geometry.start &&
            !dimensionDistanceGeometry.points.includes(id) &&
            !lineExtendedIds.includes(id)
          )
        })
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
        let [mainLine, crossLine1, crossLine2, ...linesExtended] = lines
        let crossLine1Geometry = linesGeometryQuery.get(crossLine1)
        let crossLine2Geometry = linesGeometryQuery.get(crossLine2)
        let lineExtendedIds = []
        linesExtended.forEach((id) => {
          let lineExtended = linesGeometryQuery.get(id)
          lineExtendedIds.push(lineExtended.start, lineExtended.end)
        })
        points = points.filter((id) => {
          return (
            id !== crossLine1Geometry.start &&
            id !== crossLine2Geometry.start &&
            !dimensionDistanceGeometry.points.includes(id) &&
            !lineExtendedIds.includes(id)
          )
        })
        selectGeometrysInteractionDispatch.remove([...points, ...lines])
      }
    },
    // activate(id) {
    //   let dimensionDistances = []
    //   if (pointsGeometryQuery.hasById(id)) {
    //     let { dimensionDistances: dimensionDistancesSubordinateFromPoints } =
    //       pointsGeometryMapper.subordinate(id)
    //     dimensionDistances.push(...dimensionDistancesSubordinateFromPoints)
    //   }
    //   if (linesGeometryQuery.hasById(id)) {
    //     let { dimensionDistances: dimensionDistancesSubordinateFromLines } =
    //       linesGeometryMapper.subordinate(id)
    //     dimensionDistances.push(...dimensionDistancesSubordinateFromLines)
    //   }
    //   let dimensionDistanceGeometry =
    //     dimensionDistancesGeometryMapper.getFormLineId(id) ||
    //     dimensionDistancesGeometryMapper.getFormPointId(id)
    //   if (dimensionDistanceGeometry) {
    //     dimensionDistances.push(dimensionDistanceGeometry.id)
    //   }
    //   dimensionDistances.forEach((id) => {
    //     let { points, lines } = dimensionDistancesGeometryMapper.subordinate(id)
    //     selectGeometrysInteractionDispatch.push([...points, ...lines])
    //   })
    // },
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

export function useTexts() {
  let linesGeometryQuery = useLinesGeometryQuery()
  let pointsGeometryManager = usePointsGeometryManager()
  let textsGeometryManager = useTextsGeometryManager()
  let constraintsDispatch = useConstraintsDispatch()
  return {
    add(content, lineRefer) {
      let lineReferGeometry = linesGeometryQuery.get(lineRefer)
      let pointGeometry = pointsGeometryManager.clone(lineReferGeometry.start)
      pointsGeometryManager.attach(pointGeometry)
      let textGeometry = textsGeometryManager.add(content, pointGeometry.id, lineRefer)

      constraintsDispatch.add('addConstraintP2PCoincident', [
        lineReferGeometry.start,
        pointGeometry.id,
      ])

      return textGeometry
    },
    removeById(batch) {
      if (!(batch instanceof Array)) {
        batch = [batch]
      }
      batch.forEach((id) => {
        textsGeometryManager.removeById(id)
      })
    },
  }
}
