import { Plane as ImplPlane } from 'three'
import {
  Matrix4,
  Vector2,
  Vector3,
  Vector4,
  InstancedMesh,
  Group,
  PlaneHelper,
  BufferAttribute,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  ShaderMaterial,
  DoubleSide,
  FrontSide,
  BackSide,
  DataTexture,
  PlaneGeometry,
  Mesh,
  RedFormat,
  UnsignedByteType,
  Object3D,
  CanvasTexture,
  MeshBasicMaterial,
  Quaternion,
} from 'three'
import configUI from '../config-ui.json'
import { planeCoords2worldCoords } from '../utils/simple'

export class Plane {
  impl
  constructor(normal, constant) {
    this.impl = new ImplPlane(new Vector3(...normal), constant)
  }
}
export class Planes {
  impl
  #activated = null
  constructor() {
    this.impl = new Group()
  }
  add(normal, constant) {
    const plane = new ImplPlane(new Vector3(...normal), constant)
    const helper = new PlaneHelper(plane, 1, 0x0000ff)
    helper.visible = false
    this.impl.add(helper)
  }
  remove(index) {
    this.#assertIndex(index)
    this.impl.children.splice(index, 1)
    if (index === this.#activated) {
      this.#activated = null
    }
  }
  clear() {
    this.impl.children.forEach(() => {
      this.impl.children.splice(0, 1)
    })
    this.#activated = null
  }
  visible(index) {
    this.#assertIndex(index)
    this.impl.children[index].visible = true
  }
  hidden(index) {
    this.#assertIndex(index)
    this.impl.children[index].visible = false
  }
  set active(index) {
    this.#assertIndex(index)
    this.#activated = index
  }
  get active() {
    if (this.impl.children[this.#activated]?.plane) {
      let { normal, constant } = this.impl.children[this.#activated]?.plane
      return new Plane(normal.toArray(), constant)
    }
  }
  #assertIndex(index) {
    if (index < 0 || index >= this.impl.children.length) {
      throw `not exist plane by index:${index}!`
    }
  }
}

/*
 * [优化]
 * 图形相关的比如渲染、选取、交互动画。定义接口层，不同图形单独编写实现
 */

/* [疑惑]
 * 当相交视角几乎与平面共面时，点太近了但是在视窗内会消失，算问题吗。
 */
export class Points {
  impl
  #resolution = new Vector2(500, 500)
  #MAX_POINTS = 10000
  constructor() {
    const positions = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0])
    const indices = [0, 1, 2, 2, 1, 3]
    const centers = new Float32Array(this.#MAX_POINTS * 3)
    const sizes = new Float32Array(this.#MAX_POINTS)
    const colors = new Float32Array(this.#MAX_POINTS * 4)
    const geometry = new InstancedBufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.setAttribute('center', new InstancedBufferAttribute(centers, 3))
    geometry.setAttribute('size', new InstancedBufferAttribute(sizes, 1))
    geometry.setAttribute('color', new InstancedBufferAttribute(colors, 4))
    const material = new ShaderMaterial({
      vertexShader: Points.shaderVertex,
      fragmentShader: Points.shaderFragment,
      // depthTest: true,
      // transparent: true,
      side: DoubleSide,
      uniforms: {
        // size: { value: configUI['point-size'] },
        resolution: { value: this.#resolution },
        // color: { value: new Vector4(...configUI['point-color']) },
        // colorActived: { value: new Vector4(...configUI['point-color-actived']) },
      },
    })

    this.impl = new InstancedMesh(geometry, material, this.#MAX_POINTS)
    this.impl.count = 0
    this.impl.frustumCulled = false
  }
  color(index, value) {
    const attributeColor = this.impl.geometry.attributes.color
    attributeColor.array.set(value, index * 4)
    attributeColor.needsUpdate = true
  }
  size(index, value) {
    const attributeSize = this.impl.geometry.attributes.size
    attributeSize.array.set([value], index * 1)
    attributeSize.needsUpdate = true
  }
  add(position, size = configUI['point-size'], color = configUI['point-color']) {
    let index = this.impl.count++

    this.color(index, color)
    this.size(index, size)

    this.translation(index, position)
  }

  /*
   * 注意数据同步顺序
   */
  remove(index) {
    let last = this.impl.count - 1

    if (index !== last) {
      // 把最后一个点挪过来
      const center = this.impl.geometry.attributes.center
      center.array.copyWithin(index * 3, last * 3, last * 3 + 3)
      center.needsUpdate = true

      const attributeColor = this.impl.geometry.attributes.color
      attributeColor.array.copyWithin(index * 4, last * 4, last * 4 + 4)
      attributeColor.needsUpdate = true

      const attributeSize = this.impl.geometry.attributes.size
      attributeSize.array.copyWithin(index * 1, last * 1, last * 1 + 1)
      attributeSize.needsUpdate = true
    }
    this.impl.count--
    this.impl.computeBoundingSphere()
    this.impl.computeBoundingBox()
  }
  translation(index, position) {
    const center = this.impl.geometry.attributes.center
    center.array.set(position, index * 3)
    center.needsUpdate = true
    this.impl.computeBoundingSphere()
    this.impl.computeBoundingBox()
  }
  set resolution(resolution) {
    this.#resolution.set(...resolution)
  }
  get resolution() {
    return this.#resolution.toArray()
  }
  static shaderVertex = `
    attribute vec3 center;
    attribute vec4 color;
    attribute float size;
    uniform vec2 resolution;
    varying vec4 v_color;
    void main() {
      vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(center, 1.0);
      vec2 pixel = size / resolution * 2.0;
      clipPos.xy += position.xy * pixel * clipPos.w;
      gl_Position = clipPos;
      v_color = color;
    }
  `

  static shaderFragment = `
    varying vec4 v_color;
    void main() {
      gl_FragColor = v_color;
    }
  `
}

export class Lines {
  impl
  #MAX_LINES = 10000
  #resolution = new Vector2(500, 500)
  constructor() {
    const positions = new Float32Array([-0.5, 0, 0, 0.5, 0, 0, -0.5, 1, 0, 0.5, 1, 0])
    const indices = [0, 1, 2, 2, 1, 3]
    const starts = new Float32Array(this.#MAX_LINES * 3)
    const ends = new Float32Array(this.#MAX_LINES * 3)
    const lineWidths = new Float32Array(this.#MAX_LINES)
    const lineColors = new Float32Array(this.#MAX_LINES * 4)
    const geometry = new InstancedBufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.setAttribute('lineStart', new InstancedBufferAttribute(starts, 3))
    geometry.setAttribute('lineEnd', new InstancedBufferAttribute(ends, 3))
    geometry.setAttribute('lineWidth', new InstancedBufferAttribute(lineWidths, 1))
    geometry.setAttribute('lineColor', new InstancedBufferAttribute(lineColors, 4))
    const material = new ShaderMaterial({
      vertexShader: Lines.shaderVertex,
      fragmentShader: Lines.shaderFragment,
      // depthTest: true,
      side: DoubleSide,
      uniforms: {
        // lineWidth: { value: configUI['line-width'] },
        pointWidth: { value: configUI['point-size'] },
        resolution: { value: this.#resolution },
        // color: { value: new Vector4(...configUI['line-color']) },
        // colorActived: { value: new Vector4(...configUI['line-color-actived']) },
      },
    })
    this.impl = new InstancedMesh(geometry, material, this.#MAX_LINES)
    this.impl.count = 0
    this.impl.frustumCulled = false
  }

  lineColor(index, value) {
    const attributeLineColor = this.impl.geometry.attributes.lineColor
    attributeLineColor.array.set(value, index * 4)
    attributeLineColor.needsUpdate = true
  }
  lineWidth(index, value) {
    const attributeLineWidth = this.impl.geometry.attributes.lineWidth
    attributeLineWidth.array.set([value], index * 1)
    attributeLineWidth.needsUpdate = true
  }
  add(start, end, lineWidth = configUI['line-width'], lineColor = configUI['line-color']) {
    let index = this.impl.count++
    this.lineWidth(index, lineWidth)
    this.lineColor(index, lineColor)
    this.translation(index, start, end)
  }
  translation(index, start, end) {
    const lineStart = this.impl.geometry.attributes.lineStart
    const lineEnd = this.impl.geometry.attributes.lineEnd
    lineStart.array.set(start, index * 3)
    lineEnd.array.set(end, index * 3)
    lineStart.needsUpdate = true
    lineEnd.needsUpdate = true
    // this.impl.computeBoundingSphere()
    // this.impl.computeBoundingBox()
  }
  remove(index) {
    let last = this.impl.count - 1
    if (index !== last) {
      // 把最后一个点挪过来
      const lineStart = this.impl.geometry.attributes.lineStart
      const lineEnd = this.impl.geometry.attributes.lineEnd
      lineStart.array.copyWithin(index * 3, last * 3, last * 3 + 3)
      lineEnd.array.copyWithin(index * 3, last * 3, last * 3 + 3)
      lineStart.needsUpdate = true
      lineEnd.needsUpdate = true

      const attributeLineColor = this.impl.geometry.attributes.lineColor
      attributeLineColor.array.copyWithin(index * 4, last * 4, last * 4 + 4)
      attributeLineColor.needsUpdate = true

      const attributeLineWidth = this.impl.geometry.attributes.lineWidth
      attributeLineWidth.array.copyWithin(index * 1, last * 1, last * 1 + 1)
      attributeLineWidth.needsUpdate = true
    }
    this.impl.count--
    // this.impl.computeBoundingSphere()
    // this.impl.computeBoundingBox()
  }
  set resolution(resolution) {
    this.#resolution.set(...resolution)
  }
  get resolution() {
    return this.#resolution.toArray()
  }
  static shaderVertex = `
    attribute vec3 lineStart;
    attribute vec3 lineEnd;
    attribute float lineWidth;
    attribute vec4 lineColor;
    uniform vec2 resolution;
    uniform float pointWidth;
    varying vec4 v_lineColor;
    void main() {
      float t = position.y;
      float side = position.x;
      
      vec4 clipA = projectionMatrix * modelViewMatrix * vec4(lineStart, 1.0);
      vec4 clipB = projectionMatrix * modelViewMatrix * vec4(lineEnd, 1.0);
      
      vec2 ndcA = clipA.xy / clipA.w;
      vec2 ndcB = clipB.xy / clipB.w;
      vec2 dir = normalize(ndcB - ndcA);
      
      float shrinkPx = pointWidth * 0.5 ;
      vec2 shrinkNDC = shrinkPx / resolution * 2.0;
      
      vec2 ndcA2 = ndcA + dir * shrinkNDC;
      vec2 ndcB2 = ndcB - dir * shrinkNDC;
      vec2 ndcP = mix(ndcA2, ndcB2, t);
      
      vec2 normal = vec2(-dir.y, dir.x);
      vec2 pixel = lineWidth / resolution * 2.0;
      
      float w = mix(clipA.w, clipB.w, t);
      vec4 clipP;
      clipP.xy = ndcP * w + normal * side * pixel * w;
      clipP.z  = mix(clipA.z, clipB.z, t);
      clipP.w  = w;
      
      gl_Position = clipP;
      v_lineColor = lineColor;
    }
  `
  static shaderFragment = `
    varying vec4 v_lineColor;
    void main() {
      gl_FragColor = v_lineColor;
    }
  `
}

export class Arc {
  #MAX_LINES = 128
  #resolution = new Vector2(500, 500)
  constructor(options, number = this.#MAX_LINES) {
    const positions = new Float32Array([-0.5, 0, 0, 0.5, 0, 0, -0.5, 1, 0, 0.5, 1, 0])
    const indices = [0, 1, 2, 2, 1, 3]

    let ccw = options?.ccw || 0
    let pointCenter = options?.center || [0, 1, 0]
    let pointStart = options?.start || [-1, 0, 0]
    let pointEnd = options?.end || [1, 1, 0]
    let normal = options?.normal || [0, 0, 1]

    pointCenter = new Vector3(...pointCenter)
    pointStart = new Vector3(...pointStart).sub(pointCenter)
    pointEnd = new Vector3(...pointEnd).sub(pointCenter)
    normal = new Vector3(...normal)

    const { lineStarts, lineEnds } = Arc.fragment(pointStart, normal, number)
    const geometry = new InstancedBufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.setAttribute('lineStart', new InstancedBufferAttribute(lineStarts, 3))
    geometry.setAttribute('lineEnd', new InstancedBufferAttribute(lineEnds, 3))

    const material = new ShaderMaterial({
      vertexShader: Arc.shaderVertex,
      fragmentShader: Arc.shaderFragment,
      // depthTest: true,
      side: DoubleSide,
      uniforms: {
        lineWidth: { value: configUI['line-width'] },
        pointWidth: { value: configUI['point-size'] },
        resolution: { value: this.#resolution },
        color: { value: new Vector4(...configUI['line-color']) },
        center: { value: pointCenter },
        start: { value: pointStart },
        end: { value: pointEnd },
        normal: { value: normal },
        ccw: { value: ccw },
      },
    })
    this.impl = new InstancedMesh(geometry, material, number)
    this.impl.count = number
    this.impl.frustumCulled = false
  }
  get geometry() {
    return this.impl.geometry
  }
  set resolution(resolution) {
    this.#resolution.set(...resolution)
  }
  get resolution() {
    return this.#resolution.toArray()
  }
  static shaderVertex = `
    attribute vec3 lineStart;
    attribute vec3 lineEnd;
    uniform vec3 center;
    uniform vec3 start;
    uniform vec3 end;
    uniform vec2 resolution;
    uniform float lineWidth;
    uniform float pointWidth;
    uniform float ccw;
    varying vec3 v_position;
    varying vec3 v_lineStart;
    varying vec3 v_lineEnd;
    void main() {

      v_lineStart = lineStart;
      v_lineEnd = lineEnd;
      v_position = position;

      float t = position.y;
      float side = position.x;
      
      vec4 clipA = projectionMatrix * modelViewMatrix * vec4(lineStart + center , 1.0);
      vec4 clipB = projectionMatrix * modelViewMatrix * vec4(lineEnd + center, 1.0);
      
      vec2 ndcA = clipA.xy / clipA.w;
      vec2 ndcB = clipB.xy / clipB.w;
      vec2 dir = normalize(ndcB - ndcA);
      
      float shrinkPx = pointWidth * 0.5 ;
      vec2 shrinkNDC = shrinkPx / resolution * 2.0;

      vec2 shrinkNDCStart = vec2(0.0);
      bool isEndpointStart= all(equal(start, lineStart));
      if(isEndpointStart){
        // shrinkNDCStart = shrinkNDC;
      }
      vec2 shrinkNDCEnd = vec2(0.0);;
      bool isEndpointEnd= all(equal(end, lineEnd));
      if(isEndpointEnd){
        // shrinkNDCEnd = shrinkNDC;
      }
      vec2 ndcA2 = ndcA + dir * shrinkNDCStart;
      vec2 ndcB2 = ndcB - dir * shrinkNDCEnd;
      vec2 ndcP = mix(ndcA2, ndcB2, t);
      
      vec2 normal = vec2(-dir.y, dir.x);
      vec2 pixel = lineWidth / resolution * 2.0;
      
      float w = mix(clipA.w, clipB.w, t);
      vec4 clipP;
      clipP.xy = ndcP * w + normal * side * pixel * w;
      clipP.z  = mix(clipA.z, clipB.z, t);
      clipP.w  = w;
      
      gl_Position = clipP;
    }
  `
  static shaderFragment = `
    uniform vec4 color;
    uniform vec3 start;
    uniform vec3 end;
    uniform vec3 center;
    uniform vec3 normal;
    uniform float ccw;
    varying vec3 v_position;
    varying vec3 v_lineStart;
    varying vec3 v_lineEnd;

    bool isInRange(vec3 p){
      vec3 a = normalize(start);
      vec3 b = normalize(end);
      vec3 c = normalize(p);
      float cross_ab = dot(cross(a, b), normal);
      float cross_ac = dot(cross(a, c), normal);
      float dot_ab = dot(a, b);
      float dot_ac = dot(a, c);
      bool inRange = 
        cross_ab >= 0.0
        ?(cross_ac >= 0.0 && dot_ac >= dot_ab)
        :(cross_ac >= 0.0 || dot_ac <= dot_ab);
      return inRange;
    }

    void main() {
      float t = v_position.y;
      vec3 p = mix(v_lineStart, v_lineEnd, t);
      bool isComplete= all(equal(start, end));
      if(!isComplete){
        bool inRange = isInRange(p);
        if(int(ccw)==1) inRange = !inRange;
        if(!inRange){
          discard;
        }
      }
      gl_FragColor = color;
    }
  `
  static fragment2(pointCenter, pointStart, normal, number) {
    const lineStarts = new Float32Array(number * 3)
    const lineEnds = new Float32Array(number * 3)
    let gap = (2 * Math.PI) / number
    for (let i = 0; i < number; i++) {
      let lineStart = pointStart
        .clone()
        .sub(pointCenter)
        .applyAxisAngle(normal, gap * i)
      let lineEnd
      if (i === number - 1) {
        lineEnd = pointStart.clone().sub(pointCenter)
      } else {
        lineEnd = pointStart
          .clone()
          .sub(pointCenter)
          .applyAxisAngle(normal, gap * (i + 1))
      }
      lineStarts.set(lineStart.toArray(), i * 3)
      lineEnds.set(lineEnd.toArray(), i * 3)
    }
    return {
      lineStarts,
      lineEnds,
    }
  }
  static fragment(start, normal, number) {
    const lineStarts = new Float32Array(number * 3)
    const lineEnds = new Float32Array(number * 3)
    let gap = (2 * Math.PI) / number
    for (let i = 0; i < number; i++) {
      let lineStart = start.clone().applyAxisAngle(normal, gap * i)
      let lineEnd
      if (i === number - 1) {
        lineEnd = start.clone()
      } else {
        lineEnd = start.clone().applyAxisAngle(normal, gap * (i + 1))
      }
      lineStarts.set(lineStart.toArray(), i * 3)
      lineEnds.set(lineEnd.toArray(), i * 3)
    }
    return {
      lineStarts,
      lineEnds,
    }
  }
}

/* [问题]
 * point与arc fight-z
 */
export class Arcs {
  #MAX_ARCS = 1000
  #MAX_ARC_LINES = 64
  #lines = []
  #resolution = new Vector2(500, 500)
  get #MAX_LINES() {
    return this.#MAX_ARCS * this.#MAX_ARC_LINES
  }
  get #count() {
    return Math.round(this.impl.count / this.#MAX_ARC_LINES)
  }
  set #count(number) {
    this.impl.count = number * this.#MAX_ARC_LINES
  }
  #indexLines(index) {
    return index * this.#MAX_ARC_LINES
  }
  constructor() {
    const positions = new Float32Array([-0.5, 0, 0, 0.5, 0, 0, -0.5, 1, 0, 0.5, 1, 0])
    const indices = [0, 1, 2, 2, 1, 3]
    const centers = new Float32Array(this.#MAX_LINES * 3)
    const starts = new Float32Array(this.#MAX_LINES * 3)
    const ends = new Float32Array(this.#MAX_LINES * 3)
    const normals = new Float32Array(this.#MAX_LINES * 3)
    const ccws = new Float32Array(this.#MAX_LINES * 1)
    const radii = new Float32Array(this.#MAX_LINES * 1)

    const lineStarts = new Float32Array(this.#MAX_LINES * 3)
    const lineEnds = new Float32Array(this.#MAX_LINES * 3)

    const geometry = new InstancedBufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.setAttribute('center', new InstancedBufferAttribute(centers, 3))
    geometry.setAttribute('start', new InstancedBufferAttribute(starts, 3))
    geometry.setAttribute('end', new InstancedBufferAttribute(ends, 3))
    geometry.setAttribute('n', new InstancedBufferAttribute(normals, 3))
    geometry.setAttribute('ccw', new InstancedBufferAttribute(ccws, 1))
    geometry.setAttribute('radius', new InstancedBufferAttribute(radii, 1))
    geometry.setAttribute('lineStart', new InstancedBufferAttribute(lineStarts, 3))
    geometry.setAttribute('lineEnd', new InstancedBufferAttribute(lineEnds, 3))

    const material = new ShaderMaterial({
      vertexShader: Arcs.shaderVertex,
      fragmentShader: Arcs.shaderFragment,
      // depthTest: true,
      side: DoubleSide,
      uniforms: {
        color: { value: new Vector4(...configUI['line-color']) },
        lineWidth: { value: configUI['line-width'] },
        pointWidth: { value: configUI['point-size'] },
        resolution: { value: this.#resolution },
      },
    })
    this.impl = new InstancedMesh(geometry, material, this.#MAX_LINES)
    this.impl.count = 0
    this.impl.frustumCulled = false
  }
  #toCenterSpace(point, center) {
    return new Vector3(...point).sub(new Vector3(...center))
  }
  add(center, start, end, normal, ccw) {
    let index = this.#count++
    const { lineStarts, lineEnds } = Arc.fragment(
      this.#toCenterSpace(start, center).normalize(),
      new Vector3(...normal),
      this.#MAX_ARC_LINES,
    )
    this.#lines[index] = {
      lineStarts,
      lineEnds,
    }
    const lineStart = this.impl.geometry.attributes.lineStart
    const lineEnd = this.impl.geometry.attributes.lineEnd
    lineStart.array.set(lineStarts, this.#indexLines(index) * 3)
    lineEnd.array.set(lineEnds, this.#indexLines(index) * 3)
    lineStart.needsUpdate = true
    lineEnd.needsUpdate = true
    this.translation(index, center, start, end, normal, ccw)
  }
  translation(index, center, start, end, normal, ccw) {
    start = this.#toCenterSpace(start, center)
    let radius = start.length()
    start = start.toArray()
    end = this.#toCenterSpace(end, center).toArray()
    const centers = this.impl.geometry.attributes.center
    const starts = this.impl.geometry.attributes.start
    const ends = this.impl.geometry.attributes.end
    const normals = this.impl.geometry.attributes.n
    const ccws = this.impl.geometry.attributes.ccw
    const radii = this.impl.geometry.attributes.radius
    centers.array.set(
      Array(this.#MAX_ARC_LINES)
        .fill()
        .map(() => center)
        .flat(),
      this.#indexLines(index) * 3,
    )
    starts.array.set(
      Array(this.#MAX_ARC_LINES)
        .fill()
        .map(() => start)
        .flat(),
      this.#indexLines(index) * 3,
    )
    ends.array.set(
      Array(this.#MAX_ARC_LINES)
        .fill()
        .map(() => end)
        .flat(),
      this.#indexLines(index) * 3,
    )
    normals.array.set(
      Array(this.#MAX_ARC_LINES)
        .fill()
        .map(() => normal)
        .flat(),
      this.#indexLines(index) * 3,
    )
    ccws.array.set(
      Array(this.#MAX_ARC_LINES)
        .fill()
        .map(() => ccw)
        .flat(),
      this.#indexLines(index) * 1,
    )
    radii.array.set(
      Array(this.#MAX_ARC_LINES)
        .fill()
        .map(() => radius)
        .flat(),
      this.#indexLines(index) * 1,
    )
    centers.needsUpdate = true
    starts.needsUpdate = true
    ends.needsUpdate = true
    normals.needsUpdate = true
    ccws.needsUpdate = true
    radii.needsUpdate = true
  }
  remove(index) {
    let last = this.#count - 1
    if (index !== last) {
      // 把最后一个点挪过来
      const lineStart = this.impl.geometry.attributes.lineStart
      const lineEnd = this.impl.geometry.attributes.lineEnd
      const centers = this.impl.geometry.attributes.center
      const starts = this.impl.geometry.attributes.start
      const ends = this.impl.geometry.attributes.end
      const normals = this.impl.geometry.attributes.n
      const ccws = this.impl.geometry.attributes.ccw
      const radii = this.impl.geometry.attributes.radius

      lineStart.array.copyWithin(
        this.#indexLines(index) * 3,
        this.#indexLines(last) * 3,
        this.#indexLines(last + 1) * 3,
      )
      lineEnd.array.copyWithin(
        this.#indexLines(index) * 3,
        this.#indexLines(last) * 3,
        this.#indexLines(last + 1) * 3,
      )
      centers.array.copyWithin(
        this.#indexLines(index) * 3,
        this.#indexLines(last) * 3,
        this.#indexLines(last + 1) * 3,
      )
      starts.array.copyWithin(
        this.#indexLines(index) * 3,
        this.#indexLines(last) * 3,
        this.#indexLines(last + 1) * 3,
      )
      ends.array.copyWithin(
        this.#indexLines(index) * 3,
        this.#indexLines(last) * 3,
        this.#indexLines(last + 1) * 3,
      )
      normals.array.copyWithin(
        this.#indexLines(index) * 3,
        this.#indexLines(last) * 3,
        this.#indexLines(last + 1) * 3,
      )
      ccws.array.copyWithin(
        this.#indexLines(index) * 1,
        this.#indexLines(last) * 1,
        this.#indexLines(last + 1) * 1,
      )
      radii.array.copyWithin(
        this.#indexLines(index) * 1,
        this.#indexLines(last) * 1,
        this.#indexLines(last + 1) * 1,
      )

      lineStart.needsUpdate = true
      lineEnd.needsUpdate = true
      centers.needsUpdate = true
      starts.needsUpdate = true
      ends.needsUpdate = true
      normals.needsUpdate = true
      ccws.needsUpdate = true
      radii.needsUpdate = true
    }
    this.#count--
  }
  set resolution(resolution) {
    this.#resolution.set(...resolution)
  }
  get resolution() {
    return this.#resolution.toArray()
  }
  static shaderVertex = `
    attribute vec3 lineStart;
    attribute vec3 lineEnd;
    attribute vec3 center;
    attribute vec3 start;
    attribute vec3 end;
    attribute vec3 n;
    attribute float ccw;
    attribute float radius;
    uniform vec2 resolution;
    uniform float lineWidth;
    uniform float pointWidth;
    varying vec3 v_position;
    varying vec3 v_lineStart;
    varying vec3 v_lineEnd;
    varying vec3 v_center;
    varying vec3 v_start;
    varying vec3 v_end;
    varying vec3 v_normal;
    varying float v_ccw;

    varying vec3 abc;
    varying vec2 v_shrinkNDC;
    void main() {

      v_position = position;
      v_lineStart = lineStart;
      v_lineEnd = lineEnd;
      v_center = center;
      v_start = start;
      v_end = end;
      v_normal = n;
      v_ccw = ccw;
      abc = vec3(1.0);

      float t = position.y;
      float side = position.x;
      
      vec4 clipA = projectionMatrix * modelViewMatrix * vec4(lineStart * radius + center , 1.0);
      vec4 clipB = projectionMatrix * modelViewMatrix * vec4(lineEnd * radius + center, 1.0);
      
      vec2 ndcA = clipA.xy / clipA.w;
      vec2 ndcB = clipB.xy / clipB.w;
      vec2 dir = normalize(ndcB - ndcA);
      
      float shrinkPx = pointWidth * 0.5;
      vec2 shrinkNDC = shrinkPx / resolution * 2.0;
      v_shrinkNDC = shrinkNDC;

      vec2 shrinkNDCStart = vec2(0.0,0.0);
      // bool isEndpointStart= dot(start, lineStart) > 0.8 || dot(end, lineStart) > 0.8;
      // if(isEndpointStart){
      //   shrinkNDCStart = shrinkNDC;
      //   abc = vec3(1.0,0.0,0.0);
      // }
      vec2 shrinkNDCEnd = vec2(0.0,0.0);
      // bool isEndpointEnd= dot(end, lineEnd) > 0.8 || dot(start, lineEnd) > 0.8;
      // if(isEndpointEnd){
      //   shrinkNDCEnd = shrinkNDC;
      //   abc = vec3(1.0,0.0,0.0);
      // }
      vec2 ndcA2 = ndcA + dir * shrinkNDCStart;
      vec2 ndcB2 = ndcB - dir * shrinkNDCEnd;
      vec2 ndcP = mix(ndcA2, ndcB2, t);
      
      vec2 normal = vec2(-dir.y, dir.x);
      vec2 pixel = lineWidth / resolution * 2.0;
      
      float w = mix(clipA.w, clipB.w, t);
      vec4 clipP;
      clipP.xy = ndcP * w + normal * side * pixel * w;
      clipP.z  = mix(clipA.z, clipB.z, t);
      clipP.w  = w;
      
      gl_Position = clipP;
    }
  `
  static shaderFragment = `
    uniform vec4 color;
    varying vec3 v_position;
    varying vec3 v_lineStart;
    varying vec3 v_lineEnd;
    varying vec3 v_center;
    varying vec3 v_start;
    varying vec3 v_end;
    varying vec3 v_normal;
    varying float v_ccw;
    varying vec2 v_shrinkNDC;

    varying vec3 abc;
    bool isInRange(vec3 p){
      vec3 a = normalize(v_start);
      vec3 b = normalize(v_end);
      vec3 c = normalize(p);
      float cross_ab = dot(cross(a, b), v_normal);
      float cross_ac = dot(cross(a, c), v_normal);
      float dot_ab = dot(a, b);
      float dot_ac = dot(a, c);
      bool inRange = 
        cross_ab >= 0.0
        ?(cross_ac >= 0.0 && dot_ac >= dot_ab)
        :(cross_ac >= 0.0 || dot_ac <= dot_ab);
      return inRange;
    }

    void main() {
      float t = v_position.y;
      vec3 p = mix(v_lineStart, v_lineEnd, t);
      bool isComplete= all(equal(v_start, v_end));
      if(!isComplete){
        bool inRange = isInRange(p);
        if(int(v_ccw)==1) inRange = !inRange;
        if(!inRange){
          discard;
        }
      }
      // gl_FragColor = vec4(abc,1.0);
      gl_FragColor = color;
    }
  `
}

import TinySDF from '@mapbox/tiny-sdf'
const tinySdf = new TinySDF({
  fontSize: configUI['dimension-distance-numerical-font-size'], // Font size in pixels
  fontFamily: 'sans-serif', // CSS font-family
  fontWeight: 'normal', // CSS font-weight
  fontStyle: 'normal', // CSS font-style
  buffer: 0, // Whitespace buffer around a glyph in pixels
  radius: 0, // How many pixels around the glyph shape to use for encoding distance
  cutoff: 0.25, // How much of the radius (relative) is used for the inside part of the glyph
})

const dummy = new Object3D()

class Atlas {
  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    // let div = document.createElement('div')
    // document.body.append(div)
    // div.append(this.canvas)
    // div.style.position = 'fixed'
    // div.style.zIndex = 123
    // div.style.top = 0
    // div.style.right = 0
    // div.style.backgroundColor = '#000'

    this.width = 256
    this.height = configUI['dimension-distance-numerical-font-size']
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.x = 0
    this.y = 0
    this.map = new Map()
  }
  addText(text) {
    if (this.map.has(text)) return this.map.get(text)
    let bmp = tinySdf.draw(text)
    let imageData = this.ctx.createImageData(bmp.width, bmp.height)
    let data = imageData.data

    for (let i = 0; i < bmp.data.length; i++) {
      let v = bmp.data[i]
      let j = i * 4

      data[j] = 255
      data[j + 1] = 255
      data[j + 2] = 255
      data[j + 3] = v
    }
    this.ctx.putImageData(imageData, this.x, this.y + this.height - bmp.glyphTop)
    let glyph = {
      u0: this.x / this.width,
      v0: this.y / this.height,
      u1: (this.x + bmp.width) / this.width,
      v1: (this.y + bmp.height) / this.height,
      width: bmp.width,
      height: bmp.height,
      glyphTop: bmp.glyphTop,
    }
    this.map.set(text, glyph)

    this.x += bmp.width

    return glyph
  }
  indexOf(text) {
    return this.map.keys().toArray().indexOf(text)
  }
  getByIndex(index) {
    return this.map.values().toArray()[index]
  }
}

import { worldCoords2planeCoords } from '../utils/simple'
export class Texts {
  impl
  #resolution = new Vector2(500, 500)
  #MAX_TEXTS = 10000
  #atlas
  #texture
  constructor() {
    this.#atlas = new Atlas()
    this.#texture = new CanvasTexture(this.#atlas.canvas)
    const geometry = new PlaneGeometry(1, 1)
    const material = new ShaderMaterial({
      uniforms: {
        uMap: { value: this.#texture },
        uResolution: { value: this.#resolution },
      },
      transparent: true,
      vertexShader: Texts.shaderVertex,
      fragmentShader: Texts.shaderFragment,
      side: DoubleSide,
    })

    // const material = new MeshBasicMaterial()

    geometry.setAttribute(
      'aUv',
      new InstancedBufferAttribute(new Float32Array(this.#MAX_TEXTS * 4), 4),
    )
    geometry.setAttribute(
      'aSize',
      new InstancedBufferAttribute(new Float32Array(this.#MAX_TEXTS * 2), 2),
    )
    geometry.setAttribute(
      'aOffset',
      new InstancedBufferAttribute(new Float32Array(this.#MAX_TEXTS * 3), 3),
    )
    geometry.setAttribute(
      'aAtlaIndex',
      new InstancedBufferAttribute(new Float32Array(this.#MAX_TEXTS * 1), 1),
    )
    geometry.setAttribute(
      'aColor',
      new InstancedBufferAttribute(new Float32Array(this.#MAX_TEXTS * 4), 4),
    )
    geometry.setAttribute(
      'aAngle',
      new InstancedBufferAttribute(new Float32Array(this.#MAX_TEXTS * 1), 1),
    )
    const instancedMesh = new InstancedMesh(geometry, material, this.#MAX_TEXTS)
    instancedMesh.count = 0
    instancedMesh.frustumCulled = false
    this.impl = instancedMesh
    // console.log(instancedMesh)
  }
  set resolution(resolution) {
    this.#resolution.set(...resolution)
  }
  get resolution() {
    return this.#resolution.toArray()
  }
  color(indexs, value) {
    indexs.forEach((index) => {
      const attributeColor = this.impl.geometry.attributes.aColor
      attributeColor.array.set(value, index * 4)
      attributeColor.needsUpdate = true
    })
  }
  #angleFromPlaneDirection(d, p) {
    let [u, v] = worldCoords2planeCoords(d, p)
    return Math.atan2(v, u)
  }
  add(
    text,
    position,
    direction,
    plane,
    color = configUI['dimension-distance-numerical-font-color'],
  ) {
    let indexs = []
    text
      .split('')
      // .splice(0, configUI['dimension-distance-numerical-precision'])
      .forEach((text) => {
        let index = this.impl.count++
        let { u0, u1, v0, v1, width, height } = this.#atlas.addText(text)
        let atlaIndex = this.#atlas.indexOf(text)
        this.impl.geometry.attributes.aUv.array.set([u0, u1, v0, v1], index * 4)
        this.impl.geometry.attributes.aUv.needsUpdate = true
        this.impl.geometry.attributes.aSize.array.set([width, height], index * 2)
        this.impl.geometry.attributes.aSize.needsUpdate = true
        this.impl.geometry.attributes.aAtlaIndex.array.set([atlaIndex], index * 1)
        this.impl.geometry.attributes.aAtlaIndex.needsUpdate = true
        indexs.push(index)
      })
    this.#texture.needsUpdate = true
    this.color(indexs, color)
    this.translation(indexs, position, direction, plane)
    return { indexs }
  }
  translation(indexs, position, direction, plane) {
    let { normal } = plane
    let angle = this.#angleFromPlaneDirection(direction, plane)

    let axis = new Vector3(...normal).normalize()
    let quaternion = new Quaternion().setFromAxisAngle(axis, angle)
    let offsetX = 0
    indexs.forEach((index) => {
      /*
       * 基于字体宽度角度修改偏移
       */
      let atlaIndex = this.impl.geometry.attributes.aAtlaIndex.getX(index)
      let { width, glyphTop } = this.#atlas.getByIndex(atlaIndex)
      let offsetUV = new Vector2(offsetX, 0).divide(this.#resolution).multiplyScalar(2).toArray()
      let offset = planeCoords2worldCoords(offsetUV, plane)
      offset = new Vector3(...offset).applyQuaternion(quaternion).toArray()
      this.impl.geometry.attributes.aOffset.array.set(offset, index * 3)
      this.impl.geometry.attributes.aOffset.needsUpdate = true
      this.impl.geometry.attributes.aAngle.array.set([angle], index * 1)
      this.impl.geometry.attributes.aAngle.needsUpdate = true
      offsetX += width

      /*
       * 自旋和基于法向量朝向
       */
      this.impl.getMatrixAt(index, dummy.matrix)
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
      dummy.position.set(position[0], position[1], position[2])
      dummy.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...normal))
      dummy.quaternion.premultiply(quaternion)
      dummy.updateMatrix()
      this.impl.setMatrixAt(index, dummy.matrix)
      this.impl.instanceMatrix.needsUpdate = true
    })
  }
  remove(indexs) {
    let changeMap = new Map()
    indexs = [...indexs]
    indexs.sort((a, b) => b - a)
    indexs.forEach((index) => {
      let last = this.impl.count - 1
      if (index !== last) {
        changeMap.set(last, index)
        // 把最后一个点挪过来
        const aUv = this.impl.geometry.attributes.aUv
        aUv.array.copyWithin(index * 4, last * 4, last * 4 + 4)
        aUv.needsUpdate = true

        const aSize = this.impl.geometry.attributes.aSize
        aSize.array.copyWithin(index * 2, last * 2, last * 2 + 2)
        aSize.needsUpdate = true

        const aOffset = this.impl.geometry.attributes.aOffset
        aOffset.array.copyWithin(index * 3, last * 3, last * 3 + 3)
        aOffset.needsUpdate = true

        const aAtlaIndex = this.impl.geometry.attributes.aAtlaIndex
        aAtlaIndex.array.copyWithin(index * 1, last * 1, last * 1 + 1)
        aAtlaIndex.needsUpdate = true

        const aColor = this.impl.geometry.attributes.aColor
        aColor.array.copyWithin(index * 4, last * 4, last * 4 + 4)
        aColor.needsUpdate = true
        const aAngle = this.impl.geometry.attributes.aAngle
        aAngle.array.copyWithin(index * 1, last * 1, last * 1 + 1)
        aAngle.needsUpdate = true

        this.impl.getMatrixAt(last, dummy.matrix)
        this.impl.setMatrixAt(index, dummy.matrix)
      }
      this.impl.count--
    })
    this.impl.computeBoundingSphere()
    this.impl.computeBoundingBox()
    this.impl.instanceMatrix.needsUpdate = true
    return new Map([...changeMap].reverse())
  }

  static shaderVertex = `
    uniform vec2 uResolution;
    attribute vec2 aSize;
    attribute vec4 aUv;
    attribute vec3 aOffset;
    attribute vec4 aColor;
    attribute float aAngle;
    varying vec2 vUv;
    varying vec4 vAuv;
    varying vec4 vColor;
    void main() {
      vUv = uv;
      vAuv = aUv;
      vColor = aColor;

      mat3 m = mat3(instanceMatrix);
      vec3 x = normalize(m[0]);
      vec3 y = normalize(m[1]);
      vec3 z = normalize(m[2]);
      mat3 rotation = mat3(x, y, z);

      vec4 worldCenter = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      worldCenter.xyz+= (aOffset / projectionMatrix[0][0]);
      vec4 clipCenter = projectionMatrix * modelViewMatrix * worldCenter;

      vec3 rotated = rotation * position;

      //跟随视图矩阵
      vec4 clipPosition =  viewMatrix * vec4(rotated, 1.0);

      // float s = sin(aAngle);
      // float c = cos(aAngle);
      // clipPosition.xy = vec2(
      //   clipPosition.x * abs(c) + clipPosition.y * abs(s),
      //   clipPosition.x * abs(s) + clipPosition.y * abs(c)
      // );

      vec2 pixel = aSize / uResolution * 2.0;

      clipCenter.xy += clipPosition.xy * pixel * clipCenter.w;

      gl_Position = clipCenter;

    }
  `

  static shaderFragment = `
    uniform sampler2D uMap;
    varying vec2 vUv;
    varying vec4 vAuv;
    varying vec4 vColor;

    void main() {

      vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
      float au = mix(vAuv.x, vAuv.y, vUv.x);
      float av = mix(vAuv.z, vAuv.w, vUv.y);
      vec2 auv = vec2(au, av);
      vec4 tex = texture2D(uMap, auv);
      if(tex.r==0.0){
        discard;
      }
      float dist = tex.r;
      float alpha = smoothstep(0.5 - 0.1, 0.5 + 0.1, dist);
      gl_FragColor = vec4(vColor.xyz, vColor.w*dist);
      // gl_FragColor += vec4(1.0,.0,.0,0.5);
    }
  `
}
