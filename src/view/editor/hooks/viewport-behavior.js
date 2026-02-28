import { onMounted, onUnmounted } from 'vue'
import {
  useCamera,
  useRenderer,
  useRaycaster,
  useControls as useControlsImpl,
  usePlanes as usePlanesEntitie,
} from './viewport-provide-context'
import {
  usePoints as usePointsGeometryManager,
  useLines as useLinesGeometryManager,
  usePolylines as usePolylinesGeometryManager,
  useArcs as useArcsGeometryManager,
  useConstraints as useConstraintsGeometryManager,
} from './geometry-manager.js'
import {
  usePoints as usePointsGeometryQuery,
  useLines as useLinesGeometryQuery,
} from './geometry-query.js'
import { useArcs as useArcsGeometryMapper } from './geometry-mapper'
import {
  useLines as useLinesGeometryDerived,
  usePointsHash as usePointsHashGeometryDerived,
} from './geometry-derived'
import useGeometryUpdater from './geometry-updater'
import useModesManagerInteractions from './modes-manager-interactions.js'
import {
  useSelectPoints as useSelectPointsInteractionManager,
  useSelectPointsStrict as useSelectPointsStrictInteractionManager,
  useSelectLines as useSelectLinesInteractionManager,
} from './interaction-manager.js'
import {
  useSelectPoints as useSelectPointsInteractionQuery,
  useSelectPointsStrict as useSelectPointsStrictInteractionQuery,
  useSelectLines as useSelectLinesInteractionQuery,
} from './interaction-query'
import { useSelectGeometrys as useSelectGeometrysInteractionDispatch } from './interaction-dispatch'
import { Vector3 } from '../core/gl-math'
import { viewport2ndc } from '../utils/simple'
import { watch } from 'vue'

/* [优化]
 * 后面同一个事件要统一抽离到一个事件里去管理，解决多次计算问题;
 */

export function useAddPointClick() {
  const camera = useCamera()
  const renderer = useRenderer()
  const raycaster = useRaycaster()
  const planesEntitie = usePlanesEntitie()
  const pointsGeometryManager = usePointsGeometryManager()
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()
  function onClick(event) {
    const plane = planesEntitie.active
    if (event.button !== 0 || !plane) return
    let rect = canvas.getBoundingClientRect()
    let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
    raycaster.setFromCamera([x, y], camera)
    let position = raycaster.intersectPlane(plane)
    if (!position) return
    pointsGeometryManager.add(position)
  }

  watch(
    () => modesManagerInteractions.enable.pointsAdd,
    (enable) => {
      if (enable) {
        canvas.addEventListener('click', onClick)
      } else {
        canvas.removeEventListener('click', onClick)
      }
    },
    { immediate: true },
  )
  onUnmounted(() => {
    canvas.removeEventListener('click', onClick)
  })
}

/* [问题]
 * 删除点要考虑提前移除线问题
 */
// export function useRemovePointClick() {
//   const camera = useCamera()
//   const renderer = useRenderer()
//   const raycaster = useRaycaster()
//   const pointsEntitie = usePointsEntitie()
//   const pointsGeometryManager = usePointsGeometryManager()
//   const canvas = renderer.element()

//   function onMousedown(event) {
//     if (event.button !== 2) return
//     let rect = canvas.getBoundingClientRect()
//     let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
//     raycaster.setFromCamera([x, y], camera)
//     const intersection = raycaster.intersectObject(pointsEntitie)
//     if (intersection.length === 0) return
//     const index = intersection[0].instanceId
//     pointsGeometryManager.remove(index)
//   }
//   onMounted(() => {
//     canvas.addEventListener('mousedown', onMousedown)
//   })
//   onUnmounted(() => {
//     canvas.removeEventListener('mousedown', onMousedown)
//   })
// }

export function useAddLineClick() {
  const camera = useCamera()
  const renderer = useRenderer()
  const raycaster = useRaycaster()
  const planesEntitie = usePlanesEntitie()
  const pointsGeometryManager = usePointsGeometryManager()
  const linesGeometryManager = useLinesGeometryManager()
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()

  let start = null
  let end = null
  function onMousedown(event) {
    const plane = planesEntitie.active
    if (event.button !== 0 || !plane) return
    let rect = canvas.getBoundingClientRect()
    let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
    raycaster.setFromCamera([x, y], camera)
    let position = raycaster.intersectPlane(plane)
    if (!position) return

    let point = pointsGeometryManager.add(position)
    if (start) {
      end = point.id
      linesGeometryManager.add(start, end)
      start = null
      end = null
    } else {
      start = point.id
    }
  }

  watch(
    () => modesManagerInteractions.enable.linesAdd,
    (enable) => {
      if (enable) {
        canvas.addEventListener('mousedown', onMousedown)
      } else {
        canvas.removeEventListener('mousedown', onMousedown)
        //移除半成品
        if (start) {
          pointsGeometryManager.removeById(start)
          start = null
        }
      }
    },
    { immediate: true },
  )
  onUnmounted(() => {
    canvas.removeEventListener('mousedown', onMousedown)
  })
}
export function useAddPolylineClick() {
  const camera = useCamera()
  const renderer = useRenderer()
  const raycaster = useRaycaster()
  const planesEntitie = usePlanesEntitie()
  const pointsGeometryManager = usePointsGeometryManager()
  const linesGeometryManager = useLinesGeometryManager()
  const polylinesGeometryManager = usePolylinesGeometryManager()
  const constraintsGeometryManager = useConstraintsGeometryManager()
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()

  let pointsAnchor = []
  let polylineByLineIds = []
  function onMousedown(event) {
    const plane = planesEntitie.active
    if (event.button !== 0 || !plane) return
    let rect = canvas.getBoundingClientRect()
    let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
    raycaster.setFromCamera([x, y], camera)
    let position = raycaster.intersectPlane(plane)
    if (!position) return

    let lengthAfter = pointsAnchor.length
    let pointCurrent = pointsGeometryManager.add(position)
    pointsAnchor.push(pointCurrent)
    if (lengthAfter > 0) {
      let pointReference = pointsAnchor[lengthAfter - 1]
      if (lengthAfter > 1) {
        //画第二跟线就要拷贝前面的了
        let pointReferenceClone = pointsGeometryManager.clone(pointReference.id)
        pointsGeometryManager.attach(pointReferenceClone)
        constraintsGeometryManager.addConstraintP2PCoincident(
          pointReferenceClone.id,
          pointReference.id,
        )
        pointReference = pointReferenceClone
      }
      let line = linesGeometryManager.add(pointReference.id, pointCurrent.id)
      polylineByLineIds.push(line.id)
    }
  }

  watch(
    () => modesManagerInteractions.enable.polylinesAdd,
    (enable) => {
      if (enable) {
        canvas.addEventListener('mousedown', onMousedown)
      } else {
        canvas.removeEventListener('mousedown', onMousedown)
        //关闭时的操作
        if (pointsAnchor.length === 1) {
          let point = pointsAnchor[0]
          pointsGeometryManager.removeById(point.id)
        }
        if (polylineByLineIds.length > 1) {
          polylinesGeometryManager.add(polylineByLineIds)
        }
        pointsAnchor = []
        polylineByLineIds = []
      }
    },
    { immediate: true },
  )
  onUnmounted(() => {
    canvas.removeEventListener('mousedown', onMousedown)
  })
}

export function useAddArcClick() {
  let arcsGeometryManager = useArcsGeometryManager()
  const camera = useCamera()
  const renderer = useRenderer()
  const raycaster = useRaycaster()
  const planesEntitie = usePlanesEntitie()
  const pointsGeometryManager = usePointsGeometryManager()
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()

  let pointsAnchor = []
  function onMousedown(event) {
    const plane = planesEntitie.active
    if (event.button !== 0 || !plane) return
    let rect = canvas.getBoundingClientRect()
    let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
    raycaster.setFromCamera([x, y], camera)
    let position = raycaster.intersectPlane(plane)
    if (!position) return

    let point = pointsGeometryManager.add(position)
    pointsAnchor.push(point)
    if (pointsAnchor.length === 3) {
      // arcsGeometryManager.add(...[pointsAnchor[0],pointsAnchor[1],pointsAnchor[1]].map(({ id }) => id), 1)
      arcsGeometryManager.add(...pointsAnchor.map(({ id }) => id), 1)
      pointsAnchor = []
    }
  }

  watch(
    () => modesManagerInteractions.enable.arcsAdd,
    (enable) => {
      if (enable) {
        canvas.addEventListener('mousedown', onMousedown)
      } else {
        canvas.removeEventListener('mousedown', onMousedown)
        pointsAnchor.forEach((point) => {
          pointsGeometryManager.removeById(point.id)
        })
        pointsAnchor = []
      }
    },
    { immediate: true },
  )
  onUnmounted(() => {
    canvas.removeEventListener('mousedown', onMousedown)
  })
}

// export function useMovePointClick() {
//   const camera = useCamera()
//   const renderer = useRenderer()
//   const raycaster = useRaycaster()
//   const planesEntitie = usePlanesEntitie()
//   const pointsGeometryManager = usePointsGeometryManager()
//   const arcsGeometryMapper = useArcsGeometryMapper()
//   const arcsGeometryManager = useArcsGeometryManager()
//   const geometryUpdater = useGeometryUpdater()
//   const modesManagerInteractions = useModesManagerInteractions()
//   const canvas = renderer.element()

//   let active = null
//   function onMousedown(event) {
//     if (event.button !== 0) return
//     let rect = canvas.getBoundingClientRect()
//     let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
//     raycaster.setFromRenderer(renderer)
//     raycaster.setFromCamera([x, y], camera)
//     // raycaster.setPointsHash(pointsHashGeometryDerived.value)
//     // let position = raycaster.intersectPlane(planesEntitie.active)
//     // if (!position) return
//     let index = raycaster.intersectObject({ x, y }, 'point')?.index
//     if (typeof index !== 'number' || !~index) return
//     active = index
//   }
//   function onMousemove(event) {
//     if (typeof active !== 'number') return
//     const plane = planesEntitie.active
//     if (event.button !== 0 || !plane) return
//     let rect = canvas.getBoundingClientRect()
//     let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
//     raycaster.setFromCamera([x, y], camera)
//     let position = raycaster.intersectPlane(plane)
//     if (!position) return
//     // if (arcsGeometryMapper.getFormPointIndex(active)) {
//     //   arcsGeometryManager.update(active, position)
//     //   return
//     // }
//     // pointsGeometryManager.update(active, position)
//     geometryUpdater.update(active, position)
//   }
//   function onMouseup(event) {
//     if (event.button !== 0) return
//     active = null
//   }

//   watch(
//     () => modesManagerInteractions.enable.entitieTranslation,
//     (enable) => {
//       if (enable) {
//         addEventListener()
//       } else {
//         removeEventListener()
//       }
//     },
//     { immediate: true },
//   )
//   function addEventListener() {
//     canvas.addEventListener('mousedown', onMousedown)
//     canvas.addEventListener('mousemove', onMousemove)
//     canvas.addEventListener('mouseup', onMouseup)
//   }
//   function removeEventListener() {
//     canvas.removeEventListener('mousedown', onMousedown)
//     canvas.removeEventListener('mousemove', onMousemove)
//     canvas.removeEventListener('mouseup', onMouseup)
//   }
//   onUnmounted(removeEventListener)
// }
// export function useMoveLineClick() {
//   const camera = useCamera()
//   const renderer = useRenderer()
//   const raycaster = useRaycaster()
//   const planesEntitie = usePlanesEntitie()
//   const linesGeometryDerived = useLinesGeometryDerived()
//   // const pointsGeometry = usePointsGeometry()
//   const pointsHashGeometryDerived = usePointsHashGeometryDerived()
//   // const pointsGeometryManager = usePointsGeometryManager()
//   const geometryUpdater = useGeometryUpdater()
//   const modesManagerInteractions = useModesManagerInteractions()
//   const canvas = renderer.element()

//   let active = null
//   let positionFromPlaneBegin = new Vector3()
//   let pointStartBegin = new Vector3()
//   let pointEndBegin = new Vector3()
//   function onMousedown(event) {
//     const plane = planesEntitie.active
//     if (!plane || event.button !== 0) return
//     let rect = canvas.getBoundingClientRect()
//     let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
//     raycaster.setFromCamera([x, y], camera)
//     raycaster.setFromRenderer(renderer)
//     // raycaster.setPointsHash(pointsHashGeometryDerived.value)
//     let index = raycaster.intersectObject({ x, y }, 'line')?.index
//     let positionFromPlane = raycaster.intersectPlane(plane)
//     if (typeof index !== 'number' || !~index || !positionFromPlane) return
//     let { start, end } = linesGeometryDerived.value[index]
//     let pointStart = pointsHashGeometryDerived.value[start]
//     let pointEnd = pointsHashGeometryDerived.value[end]
//     pointStartBegin.set(pointStart.x, pointStart.y, pointStart.z)
//     pointEndBegin.set(pointEnd.x, pointEnd.y, pointEnd.z)
//     positionFromPlaneBegin.set(...positionFromPlane)
//     active = index
//   }
//   let positionFromPlaneCurrent = new Vector3()
//   function onMousemove(event) {
//     const plane = planesEntitie.active
//     if (!plane || event.button !== 0 || typeof active !== 'number') return
//     let rect = canvas.getBoundingClientRect()
//     let x = ((event.clientX - rect.left) / rect.width) * 2 - 1
//     let y = -((event.clientY - rect.top) / rect.height) * 2 + 1
//     raycaster.setFromCamera([x, y], camera)
//     let positionFromPlane = raycaster.intersectPlane(planesEntitie.active)
//     if (!positionFromPlane) return
//     positionFromPlaneCurrent.set(...positionFromPlane)
//     let offset = positionFromPlaneCurrent.sub(positionFromPlaneBegin)
//     let pointStartCurrent = pointStartBegin.clone().add(offset)
//     let pointEndCurrent = pointEndBegin.clone().add(offset)
//     // let { start, end } = linesGeometryDerived.value[active]
//     // let pointStart = pointsHashGeometryDerived.value[start]
//     // let pointEnd = pointsHashGeometryDerived.value[end]
//     // let pointStartIndex = pointsGeometry.value.indexOf(pointStart)
//     // let pointEndIndex = pointsGeometry.value.indexOf(pointEnd)
//     // pointsGeometryManager.update(pointStartIndex, pointStartCurrent.toArray())
//     // pointsGeometryManager.update(pointEndIndex, pointEndCurrent.toArray())
//     geometryUpdater.update(active, {
//       start: pointStartCurrent.toArray(),
//       end: pointEndCurrent.toArray(),
//     })
//   }
//   function onMouseup(event) {
//     if (event.button !== 0) return
//     active = null
//   }

//   watch(
//     () => modesManagerInteractions.enable.entitieTranslation,
//     (enable) => {
//       if (enable) {
//         addEventListener()
//       } else {
//         removeEventListener()
//       }
//     },
//     { immediate: true },
//   )
//   function addEventListener() {
//     canvas.addEventListener('mousedown', onMousedown)
//     canvas.addEventListener('mousemove', onMousemove)
//     canvas.addEventListener('mouseup', onMouseup)
//   }
//   function removeEventListener() {
//     canvas.removeEventListener('mousedown', onMousedown)
//     canvas.removeEventListener('mousemove', onMousemove)
//     canvas.removeEventListener('mouseup', onMouseup)
//   }
//   onUnmounted(removeEventListener)
// }

// export function useSelectPointClick() {
//   const camera = useCamera()
//   const renderer = useRenderer()
//   const raycaster = useRaycaster()
//   const pointsGeometryQuery = usePointsGeometryQuery()
//   const modesManagerInteractions = useModesManagerInteractions()
//   const selectPointsManager = useSelectPointsInteractionManager()
//   const canvas = renderer.element()

//   function onMousedown(event) {
//     if (event.button !== 0) return
//     let rect = canvas.getBoundingClientRect()
//     let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
//     raycaster.setFromRenderer(renderer)
//     raycaster.setFromCamera([x, y], camera)
//     // raycaster.setPointsHash(pointsHashGeometryDerived.value)
//     // let position = raycaster.intersectPlane(planesEntitie.active)
//     // if (!position) return
//     let index = raycaster.intersectObject({ x, y }, 'point')?.index
//     if (typeof index !== 'number' || !~index) {
//       return selectPointsManager.clear()
//     }
//     let point = pointsGeometryQuery.getByIndex(index)
//     if (event.ctrlKey || event.shiftKey) {
//       return selectPointsManager.push(point.id)
//     }
//     selectPointsManager.set(point.id)
//   }
//   watch(
//     () => modesManagerInteractions.enable.entitieSelect,
//     (enable) => {
//       if (enable) {
//         addEventListener()
//       } else {
//         removeEventListener()
//       }
//     },
//     { immediate: true },
//   )
//   function addEventListener() {
//     canvas.addEventListener('mousedown', onMousedown)
//   }
//   function removeEventListener() {
//     canvas.removeEventListener('mousedown', onMousedown)
//   }
//   onUnmounted(removeEventListener)
// }

/*
 * 选中
 */
export function useSelect() {
  const camera = useCamera()
  const renderer = useRenderer()
  const raycaster = useRaycaster()
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()
  const selectPointsInteractionManager = useSelectPointsInteractionManager()
  // const selectPointsStrictInteractionManager = useSelectPointsStrictInteractionManager()
  const selectLinesInteractionManager = useSelectLinesInteractionManager()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  const selectPoints = useSelectPoints()
  const selectLines = useSelectLines()

  function onMousedown(event) {
    if (event.button !== 0) return
    let rect = canvas.getBoundingClientRect()
    let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
    raycaster.setFromRenderer(renderer)
    raycaster.setFromCamera([x, y], camera)
    let state = { x, y }
    if (!selectPoints.onMousedown(state, event) && !selectLines.onMousedown(state, event)) {
      // selectPointsInteractionManager.clear()
      // selectLinesInteractionManager.clear()
      selectGeometrysInteractionDispatch.clear()
    }
  }

  function onMousemove(event) {
    selectPoints.onMousemove({}, event)
    selectLines.onMousemove({}, event)
  }
  function onMouseup(event) {
    selectPoints.onMouseup({}, event)
    selectLines.onMouseup({}, event)
  }
  watch(
    () => modesManagerInteractions.enable.entitieSelect,
    (enable) => {
      if (enable) {
        addEventListener()
      } else {
        removeEventListener()
      }
    },
    { immediate: true },
  )
  function addEventListener() {
    canvas.addEventListener('mousedown', onMousedown)
    canvas.addEventListener('mousemove', onMousemove)
    canvas.addEventListener('mouseup', onMouseup)
  }
  function removeEventListener() {
    canvas.removeEventListener('mousedown', onMousedown)
    canvas.removeEventListener('mousemove', onMousemove)
    canvas.removeEventListener('mouseup', onMouseup)
  }
  onUnmounted(removeEventListener)
}
const THRESHOLD = 5
const CLICK_TIME = 200
/* [问题]
 * 重合项选中时怎么让选中项在最上方（边框？选中规则顺序问题？）
 * 先选线再选线上的点好像有点逻辑问题
 */
function useSelectPoints() {
  const raycaster = useRaycaster()
  const pointsGeometryQuery = usePointsGeometryQuery()
  const selectPointsInteractionManager = useSelectPointsInteractionManager()
  const selectPointsInteractionQuery = useSelectPointsInteractionQuery()
  const selectPointsStrictInteractionManager = useSelectPointsStrictInteractionManager()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  // const selectPointsStrictInteractionQuery = useSelectPointsStrictInteractionQuery()

  let startTime = 0
  let startX = 0
  let startY = 0
  let isDragging = false
  let activeted = false
  let idRemove = null
  return {
    onMousedown({ x, y }, event) {
      activeted = true
      startTime = Date.now()
      startX = event.clientX
      startY = event.clientY
      isDragging = false
      let index = raycaster.intersectObject({ x, y }, 'point')?.index
      if (typeof index !== 'number' || !~index) {
        return false //不存在点
      }
      let point = pointsGeometryQuery.getByIndex(index)
      selectPointsStrictInteractionManager.add(point.id)
      if (event.ctrlKey || event.shiftKey) {
        if (selectPointsInteractionQuery.includes(point.id)) {
          idRemove = point.id
        }
        selectGeometrysInteractionDispatch.push(point.id)
      } else {
        if (!selectPointsInteractionQuery.includes(point.id)) {
          selectGeometrysInteractionDispatch.set(point.id)
          selectPointsStrictInteractionManager.add(point.id)
        }
      }
      return true
    },
    onMousemove(state, event) {
      if (!activeted) return
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      if (Math.hypot(dx, dy) > THRESHOLD) {
        isDragging = true
      }
    },
    onMouseup(state, event) {
      const duration = Date.now() - startTime
      if (!isDragging && duration < CLICK_TIME) {
        // console.log('click');
        if (idRemove) {
          selectGeometrysInteractionDispatch.remove(idRemove)
          // selectPointsStrictInteractionManager.remove(idRemove)
        }
      } else {
        // console.log('drag');
      }
      idRemove = null
      activeted = false
    },
  }
}
function useSelectLines() {
  const raycaster = useRaycaster()
  const linesGeometryQuery = useLinesGeometryQuery()
  const selectPointsInteractionManager = useSelectPointsInteractionManager()
  const selectPointsInteractionQuery = useSelectPointsInteractionQuery()
  const selectLinesInteractionManager = useSelectLinesInteractionManager()
  const selectLinesInteractionQuery = useSelectLinesInteractionQuery()
  const selectGeometrysInteractionDispatch = useSelectGeometrysInteractionDispatch()
  // const selectPointsStrictInteractionManager = useSelectPointsStrictInteractionManager();

  let startTime = 0
  let startX = 0
  let startY = 0
  let isDragging = false
  let activeted = false
  let lineRemove = null
  return {
    onMousedown({ x, y }, event) {
      activeted = true
      startTime = Date.now()
      startX = event.clientX
      startY = event.clientY
      isDragging = false
      let index = raycaster.intersectObject({ x, y }, 'line')?.index
      if (typeof index !== 'number' || !~index) {
        return false
      }
      let line = linesGeometryQuery.getByIndex(index)
      let { start, end } = line
      let hasStart = selectPointsInteractionQuery.includes(start)
      let hasEnd = selectPointsInteractionQuery.includes(end)

      // if (event.ctrlKey || event.shiftKey) {
      //   if (selectLinesInteractionQuery.includes(line.id)) {
      //     lineRemove = line
      //   }
      //   selectLinesInteractionManager.push(line.id)
      // } else {
      //   if (!selectLinesInteractionQuery.includes(line.id)) {
      //     selectLinesInteractionManager.set(line.id)
      //   }
      // }

      // if (event.ctrlKey || event.shiftKey) {
      //   // let ids = []
      //   // if (!hasStart && hasEnd) {
      //   //   ids.push(start)
      //   // }
      //   // if (hasStart && !hasEnd) {
      //   //   ids.push(end)
      //   // }
      //   // if (hasStart && hasEnd) {
      //   //   ids.push(start, end)
      //   // }
      //   // if (!hasStart && !hasEnd) {
      //   //   ids.push(start, end)
      //   // }
      //   // selectPointsInteractionManager.push(ids)
      //   selectPointsInteractionManager.push([start, end])
      // } else {
      //   // if (!hasStart && hasEnd) {
      //   //   selectPointsInteractionManager.push(start)
      //   // }
      //   // if (hasStart && !hasEnd) {
      //   //   selectPointsInteractionManager.push(end)
      //   // }
      //   // if (hasStart && hasEnd) {
      //   //   selectPointsInteractionManager.set([start, end])
      //   // }
      //   // if (!hasStart && !hasEnd) {
      //   //   selectPointsInteractionManager.set([start, end])
      //   // }
      //   selectPointsInteractionManager.set([start, end])
      // }

      if (event.ctrlKey || event.shiftKey) {
        if (selectLinesInteractionQuery.includes(line.id)) {
          lineRemove = line
        }
        // selectLinesInteractionManager.push(line.id)
        // selectPointsInteractionManager.push([start, end])
        selectGeometrysInteractionDispatch.push([line.id, start, end])
      } else {
        // if (!selectLinesInteractionQuery.includes(line.id)) {
        //   selectLinesInteractionManager.set(line.id)
        //   selectPointsInteractionManager.set([start, end])
        // }
        if (!selectLinesInteractionQuery.includes(line.id)) {
          selectGeometrysInteractionDispatch.set([line.id, start, end])
        }
      }
      return true
    },
    onMousemove(state, event) {
      if (!activeted) return
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      if (Math.hypot(dx, dy) > THRESHOLD) {
        isDragging = true
      }
    },
    onMouseup(state, event) {
      const duration = Date.now() - startTime
      if (!isDragging && duration < CLICK_TIME) {
        // console.log('click');
        if (lineRemove) {
          // selectLinesInteractionManager.remove(lineRemove.id)
          // selectPointsInteractionManager.remove(lineRemove.start)
          // selectPointsInteractionManager.remove(lineRemove.end)
          selectGeometrysInteractionDispatch.remove([
            lineRemove.id,
            lineRemove.start,
            lineRemove.end,
          ])
        }
      } else {
        // console.log('drag');
      }
      lineRemove = null
      activeted = false
    },
  }
}
/*
 * 移动
 */
export function useMove() {
  const camera = useCamera()
  const renderer = useRenderer()
  const raycaster = useRaycaster()
  const planesEntitie = usePlanesEntitie()
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()
  const movePoints = useMovePoints()
  const moveLines = useMoveLines()

  let activeted = false
  function onMousedown(event) {
    const plane = planesEntitie.active
    if (!plane || event.button !== 0) return
    let rect = canvas.getBoundingClientRect()
    let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
    raycaster.setFromCamera([x, y], camera)
    raycaster.setFromRenderer(renderer)
    let state = { x, y }
    activeted = movePoints.onMousedown(state, event) || moveLines.onMousedown(state, event)
  }
  function onMousemove(event) {
    const plane = planesEntitie.active
    if (!plane || event.button !== 0 || !activeted) return
    let rect = canvas.getBoundingClientRect()
    let { x, y } = viewport2ndc(rect, { x: event.clientX, y: event.clientY })
    raycaster.setFromCamera([x, y], camera)
    raycaster.setFromRenderer(renderer)
    let state = { x, y }
    movePoints.onMousemove(state, event)
    moveLines.onMousemove(state, event)
  }
  function onMouseup(event) {
    if (event.button !== 0) return
    activeted = false
    movePoints.onMouseup({}, event)
    moveLines.onMouseup({}, event)
  }

  watch(
    () => modesManagerInteractions.enable.entitieTranslation,
    (enable) => {
      if (enable) {
        addEventListener()
      } else {
        removeEventListener()
      }
    },
    { immediate: true },
  )
  function addEventListener() {
    canvas.addEventListener('mousedown', onMousedown)
    canvas.addEventListener('mousemove', onMousemove)
    canvas.addEventListener('mouseup', onMouseup)
  }
  function removeEventListener() {
    canvas.removeEventListener('mousedown', onMousedown)
    canvas.removeEventListener('mousemove', onMousemove)
    canvas.removeEventListener('mouseup', onMouseup)
  }
  onUnmounted(removeEventListener)
}
function useMoveLines() {
  const raycaster = useRaycaster()
  const planesEntitie = usePlanesEntitie()
  const linesGeometryQuery = useLinesGeometryQuery()
  const pointsGeometryQuery = usePointsGeometryQuery()
  const selectPointsInteractionQuery = useSelectPointsInteractionQuery()
  const geometryUpdater = useGeometryUpdater()
  let positionFromPlaneBegin = new Vector3()
  let selectPointsPositionBegin = {}
  let positionFromPlaneCurrent = new Vector3()
  let activeted = false
  return {
    onMousedown({ x, y }, event) {
      let index = raycaster.intersectObject({ x, y }, 'line')?.index
      let positionFromPlane = raycaster.intersectPlane(planesEntitie.active)
      if (typeof index !== 'number' || !~index || !positionFromPlane) return false
      let { start, end } = linesGeometryQuery.getByIndex(index)
      let pointStart = pointsGeometryQuery.get(start)
      let pointEnd = pointsGeometryQuery.get(end)
      if (
        !selectPointsInteractionQuery.includes(pointStart.id) &&
        !selectPointsInteractionQuery.includes(pointEnd.id)
      )
        return false
      positionFromPlaneBegin.set(...positionFromPlane)
      let selectPoints = selectPointsInteractionQuery.get()
      selectPoints.forEach((id) => {
        let { x, y, z } = pointsGeometryQuery.get(id)
        selectPointsPositionBegin[id] = new Vector3(x, y, z)
      })
      activeted = true
      return true
    },
    onMousemove({ x, y }, event) {
      if (!activeted) return
      let positionFromPlane = raycaster.intersectPlane(planesEntitie.active)
      if (!positionFromPlane) return
      positionFromPlaneCurrent.set(...positionFromPlane)
      let offset = positionFromPlaneCurrent.sub(positionFromPlaneBegin)

      let selectPoints = selectPointsInteractionQuery.get()

      let batch = selectPoints.map((id) => {
        let point = pointsGeometryQuery.get(id)
        let index = pointsGeometryQuery.indexOf(point)
        let selectPointPositionBegin = selectPointsPositionBegin[id]
        let selectPointPositionCurrent = selectPointPositionBegin.clone().add(offset)
        return {
          index,
          position: selectPointPositionCurrent.toArray(),
        }
      })
      geometryUpdater.update(batch)
    },
    onMouseup({ x, y }, event) {
      activeted = false
      selectPointsPositionBegin = {}
    },
  }
}

function useMovePoints() {
  const raycaster = useRaycaster()
  const planesEntitie = usePlanesEntitie()
  const selectPointsInteractionQuery = useSelectPointsInteractionQuery()
  const pointsGeometryQuery = usePointsGeometryQuery()
  const geometryUpdater = useGeometryUpdater()
  let positionFromPlaneBegin = new Vector3()
  let selectPointsPositionBegin = {}
  let positionFromPlaneCurrent = new Vector3()
  let activeted = false
  return {
    onMousedown({ x, y }, event) {
      let index = raycaster.intersectObject({ x, y }, 'point')?.index
      let positionFromPlane = raycaster.intersectPlane(planesEntitie.active)
      if (typeof index !== 'number' || !~index || !positionFromPlane) return false
      let point = pointsGeometryQuery.getByIndex(index)
      if (!selectPointsInteractionQuery.includes(point.id)) return false
      positionFromPlaneBegin.set(...positionFromPlane)
      let selectPoints = selectPointsInteractionQuery.get()
      selectPoints.forEach((id) => {
        let { x, y, z } = pointsGeometryQuery.get(id)
        selectPointsPositionBegin[id] = new Vector3(x, y, z)
      })
      activeted = true
      return true
    },
    onMousemove({ x, y }, event) {
      if (!activeted) return
      let positionFromPlane = raycaster.intersectPlane(planesEntitie.active)
      if (!positionFromPlane) return
      positionFromPlaneCurrent.set(...positionFromPlane)
      let offset = positionFromPlaneCurrent.sub(positionFromPlaneBegin)

      let selectPoints = selectPointsInteractionQuery.get()

      let batch = selectPoints.map((id) => {
        let point = pointsGeometryQuery.get(id)
        let index = pointsGeometryQuery.indexOf(point)
        let selectPointPositionBegin = selectPointsPositionBegin[id]
        let selectPointPositionCurrent = selectPointPositionBegin.clone().add(offset)
        return {
          index,
          position: selectPointPositionCurrent.toArray(),
        }
      })
      geometryUpdater.update(batch)
    },
    onMouseup(state, event) {
      activeted = false
      selectPointsPositionBegin = {}
    },
  }
}

//视图控制器
export function useControls() {
  const controls = useControlsImpl()
  const modesManagerInteractions = useModesManagerInteractions()
  watch(
    () => modesManagerInteractions.enable.controls,
    (enable) => {
      controls.enablePan = enable
      controls.enableRotate = enable
      controls.enableZoom = enable
    },
    { immediate: true },
  )
}
