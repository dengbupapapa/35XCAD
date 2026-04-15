import { onMounted, onUnmounted, watch } from 'vue'
import {
  useCamera,
  useRenderer,
  useRaycaster,
  usePlanes as usePlanesEntitie,
} from './viewport-provide-context'
import {
  usePoints as usePointsGeometryManager,
  useLines as useLinesGeometryManager,
  usePolylines as usePolylinesGeometryManager,
  useArcs as useArcsGeometryManager,
} from './geometry-manager.js'

import useModesManagerInteractions from './modes-manager-interactions.js'

import { useConstraints as useConstraintsDispatch } from './constraint-dispatch'
import { viewport2ndc } from '../utils/simple'

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
  const modesManagerInteractions = useModesManagerInteractions()
  const canvas = renderer.element()
  const constraintsDispatch = new useConstraintsDispatch()

  let pointsAnchor = []
  let polylineByLineIds = []
  let polyline = null
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
        // constraintsManager.addConstraintP2PCoincident(pointReferenceClone.id, pointReference.id)
        constraintsDispatch.add('addConstraintP2PCoincident', [
          pointReferenceClone.id,
          pointReference.id,
        ])
        pointReference = pointReferenceClone
      }
      let line = linesGeometryManager.add(pointReference.id, pointCurrent.id)
      polylineByLineIds.push(line.id)

      if (!polyline && polylineByLineIds.length === 2) {
        polyline = polylinesGeometryManager.add([...polylineByLineIds])
      } else if (polylineByLineIds.length > 2) {
        polylinesGeometryManager.append(polyline.id, line.id)
      }
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
        // if (polylineByLineIds.length > 1) {
        //   polylinesGeometryManager.add(polylineByLineIds)
        // }
        pointsAnchor = []
        polylineByLineIds = []
        polyline = null
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
