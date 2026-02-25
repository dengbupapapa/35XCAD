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
} from 'three'
import config from '../config.json'

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
    let { normal, constant } = this.impl.children[this.#activated]?.plane
    return new Plane(normal.toArray(), constant)
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
    const activeds = new Float32Array(this.#MAX_POINTS)
    const geometry = new InstancedBufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.setAttribute('center', new InstancedBufferAttribute(centers, 3))
    geometry.setAttribute('actived', new InstancedBufferAttribute(activeds, 1))
    const material = new ShaderMaterial({
      vertexShader: Points.shaderVertex,
      fragmentShader: Points.shaderFragment,
      // depthTest: true,
      // transparent: true,
      side: DoubleSide,
      uniforms: {
        size: { value: config['point-size'] },
        resolution: { value: this.#resolution },
        color: { value: new Vector4(...config['point-color']) },
        colorActived: { value: new Vector4(...config['point-color-actived']) },
      },
    })

    this.impl = new InstancedMesh(geometry, material, this.#MAX_POINTS)
    this.impl.count = 0
    this.impl.frustumCulled = false
  }
  active(index, enabled = true) {
    const actived = this.impl.geometry.attributes.actived
    if (enabled) {
      actived.array.set([1], index * 1)
    } else {
      actived.array.set([0], index * 1)
    }
    actived.needsUpdate = true
  }
  add(position) {
    let index = this.impl.count++
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
    attribute float actived;
    uniform float size;
    uniform vec2 resolution;
    varying float v_actived;
    void main() {
      vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(center, 1.0);
      vec2 pixel = size / resolution * 2.0;
      clipPos.xy += position.xy * pixel * clipPos.w;
      // clipPos.z -= 0.0005 * clipPos.w;
      gl_Position = clipPos;
      v_actived = actived;
    }
  `

  static shaderFragment = `
    uniform vec4 color;
    uniform vec4 colorActived;
    varying float v_actived;
    void main() {
      if(int(v_actived)==1){
        gl_FragColor = colorActived;
        return;
      }
      gl_FragColor = color;
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
    const activeds = new Float32Array(this.#MAX_LINES)
    const geometry = new InstancedBufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.setAttribute('lineStart', new InstancedBufferAttribute(starts, 3))
    geometry.setAttribute('lineEnd', new InstancedBufferAttribute(ends, 3))
    geometry.setAttribute('actived', new InstancedBufferAttribute(activeds, 1))
    const material = new ShaderMaterial({
      vertexShader: Lines.shaderVertex,
      fragmentShader: Lines.shaderFragment,
      // depthTest: true,
      side: DoubleSide,
      uniforms: {
        lineWidth: { value: config['line-width'] },
        pointWidth: { value: config['point-size'] },
        resolution: { value: this.#resolution },
        color: { value: new Vector4(...config['line-color']) },
        colorActived: { value: new Vector4(...config['line-color-actived']) },
      },
    })
    this.impl = new InstancedMesh(geometry, material, this.#MAX_LINES)
    this.impl.count = 0
    this.impl.frustumCulled = false
  }  
  active(index, enabled = true) {
    const actived = this.impl.geometry.attributes.actived
    if (enabled) {
      actived.array.set([1], index * 1)
    } else {
      actived.array.set([0], index * 1)
    }
    actived.needsUpdate = true
  }
  add(start, end) {
    let index = this.impl.count++
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
    attribute float actived;
    uniform vec2 resolution;
    uniform float lineWidth;
    uniform float pointWidth;
    varying float v_actived;
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
      v_actived = actived;
    }
  `
  static shaderFragment = `
    uniform vec4 color;
    uniform vec4 colorActived;
    varying float v_actived;
    void main() {
      if(int(v_actived)==1){
        gl_FragColor = colorActived;
        return;
      }
      gl_FragColor = color;
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
        lineWidth: { value: config['line-width'] },
        pointWidth: { value: config['point-size'] },
        resolution: { value: this.#resolution },
        color: { value: new Vector4(...config['line-color']) },
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
        color: { value: new Vector4(...config['line-color']) },
        lineWidth: { value: config['line-width'] },
        pointWidth: { value: config['point-size'] },
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
