import {
  Scene as ImplScene,
  OrthographicCamera as ImplOrthographicCamera,
  WebGLRenderer as ImplRenderer,
  Vector3,
  Vector2,
  MOUSE as ImplMOUSE
} from 'three'
import { OrbitControls as ImplOrbitControls } from '../lib/OrbitControls'

export class Renderer {
  impl
  constructor(options = { antialias: true }) {
    this.impl = new ImplRenderer(options)
  }
  appendTo(element) {
    element.appendChild(this.impl.domElement)
  }
  render(scene, camera) {
    this.impl.render(scene.impl, camera.impl)
  }
  setAnimationLoop(fn) {
    this.impl.setAnimationLoop(fn)
  }
  setSize(...args) {
    this.impl.setSize(...args)
  }
  getSize() {
    let size = new Vector2()
    this.impl.getSize(size)
    return size.toArray()
  }
  setClearColor(...args) {
    this.impl.setClearColor(...args)
  }
  setPixelRatio(...args) {
    this.impl.setPixelRatio(...args)
  }
  element() {
    return this.impl.domElement
  }
}

export class Scene {
  impl
  constructor(...args) {
    this.impl = new ImplScene(...args)
  }
  add(...args) {
    this.impl.add(...args.map((arg) => arg.impl))
  }
}

export class OrthographicCamera {
  impl
  constructor(...args) {
    this.impl = new ImplOrthographicCamera(...args)
    this.impl.position.z = 5
    // this.impl.position.y = 5
    // this.impl.position.x = 5
    // setTimeout(()=>{
    //   this.impl.lookAt(0,0,1000)
    // })
  }
  setSize(width, height, viewSize = 1) {
    let aspect = width / height
    this.impl.left = -viewSize * aspect
    this.impl.right = viewSize * aspect
    this.impl.top = viewSize
    this.impl.bottom = -viewSize
    this.impl.updateProjectionMatrix()
  }
}

export class Controls {
  impl
  constructor(camera, element) {
    //禁用掉浏览器缩放
    window.addEventListener('mousewheel', function(event){
      if (event.ctrlKey === true || event.metaKey) {
          event.preventDefault();
      }
    },{ passive: false});
    window.addEventListener('DOMMouseScroll', function(event){
        if (event.ctrlKey === true || event.metaKey) {
            event.preventDefault();
        }
    },{ passive: false});
    camera = camera.impl
    this.impl = new ImplOrbitControls(camera, element)
    this.impl.enablePan = false
    this.impl.enableRotate = false
    this.impl.enableZoom = false
    this.impl.mouseButtons = {
      LEFT: -1,
      MIDDLE: ImplMOUSE.PAN,
      RIGHT: -1
    };
  }
  set enablePan(state) {
    this.impl.enablePan = state
  }
  get enablePan() {
    return this.impl.enablePan
  }
  set enableRotate(state) {
    this.impl.enableRotate = state
  }
  get enableRotate() {
    return this.impl.enableRotate
  }
  set enableZoom(state) {
    this.impl.enableZoom = state
  }
  get enableZoom() {
    return this.impl.enableZoom
  }
}
