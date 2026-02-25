import { provide, inject } from 'vue'
import { Renderer, Scene, OrthographicCamera, Controls } from '../core/gl-viewport'
import { Planes, Points, Lines, Arcs } from '../core/gl-entitie'
import { Raycaster } from '../core/gl-query'

export default function useRegistry() {
  const camera = new OrthographicCamera()
  const scene = new Scene()
  const renderer = new Renderer()
  const raycaster = new Raycaster()
  const controls = new Controls(camera, renderer.element())
  const planes = new Planes()
  const points = new Points()
  const lines = new Lines()
  const arcs = new Arcs()
  provide(cameraSymbol, camera)
  provide(sceneSymbol, scene)
  provide(rendererSymbol, renderer)
  provide(raycasterSymbol, raycaster)
  provide(controlsSymbol, controls)
  provide(planesSymbol, planes)
  provide(pointsSymbol, points)
  provide(linesSymbol, lines)
  provide(arcsSymbol, arcs)
}

const cameraSymbol = Symbol('camera')
const sceneSymbol = Symbol('scene')
const rendererSymbol = Symbol('renderer')
const raycasterSymbol = Symbol('raycaster')
const controlsSymbol = Symbol('controls')
const planesSymbol = Symbol('planes')
const pointsSymbol = Symbol('points')
const linesSymbol = Symbol('lines')
const arcsSymbol = Symbol('arcs')
export function useCamera() {
  return inject(cameraSymbol)
}
export function useScene() {
  return inject(sceneSymbol)
}
export function useRenderer() {
  return inject(rendererSymbol)
}
export function useRaycaster() {
  return inject(raycasterSymbol)
}
export function useControls() {
  return inject(controlsSymbol)
}
export function usePlanes() {
  return inject(planesSymbol)
}
export function usePoints() {
  return inject(pointsSymbol)
}
export function useLines() {
  return inject(linesSymbol)
}
export function useArcs() {
  return inject(arcsSymbol)
}
