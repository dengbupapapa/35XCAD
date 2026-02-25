import { Raycaster as ImplRaycaster, Vector2, Vector3, MathUtils } from 'three'
import config from '../config.json'

export class Raycaster {
  impl
  #renderer
  #pointsHash
  #linesHash
  #pointsGeometry
  #linesGeometry
  constructor(...args) {
    this.impl = new ImplRaycaster(...args)
  }
  setPointsHash(pointsHash) {
    this.#pointsHash = pointsHash
  }
  setLinesHash(linesHash) {
    this.#linesHash = linesHash
  }
  setPointsGeometry(pointsGeometry) {
    this.#pointsGeometry = pointsGeometry
  }
  setLinesGeometry(linesGeometry) {
    this.#linesGeometry = linesGeometry
  }
  setOptions() {}

  setFromCamera(mouse, camera) {
    return this.impl.setFromCamera(new Vector2(...mouse), camera.impl)
  }

  setFromRenderer(renderer) {
    this.#renderer = renderer
  }
  intersectPlane(plane) {
    let p = new Vector3()
    if (this.impl.ray.intersectPlane(plane.impl, p)) {
      return p.toArray()
    }
  }
  #pickPoint2Project(point, mouse, radius = config['point-size'] + 2) {
    let [width, height] = this.#renderer.getSize()
    let projectPoint = new Vector3(point.x, point.y, point.z).project(this.impl.camera)
    // let projectMouse = new Vector3(...position).project(this.impl.camera)
    let dx = ((projectPoint.x - mouse.x) * width) / 2
    let dy = ((projectPoint.y - mouse.y) * height) / 2
    if (Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2)) {
      return projectPoint //projectMouse
    }
  }
  #intersectPoint(mouse, radius) {
    let select
    this.#pointsGeometry.forEach((point, index) => {
      let project = this.#pickPoint2Project(point, mouse, radius)
      if (project) {
        if (select) {
          if (project.z <= select.project.z) {
            select = { data: point, project, index }
          }
        } else {
          select = { data: point, project, index }
        }
      }
    })
    return select
  }
  intersectPoint(mouse, index = true, radius) {
    let select = this.#intersectPoint(mouse, radius)
    if (index) {
      return select?.index
    } else {
      return select
    }
  }
  #pickLine2Project(line, mouse, widthLine = config['line-width'] + 2) {
    let [width, height] = this.#renderer.getSize()
    let start = this.#pointsHash[line.start]
    let end = this.#pointsHash[line.end]
    let pointStartVector3 = new Vector3(start.x, start.y, start.z).project(this.impl.camera)
    let pointEndVector3 = new Vector3(end.x, end.y, end.z).project(this.impl.camera)
    let pointStart = new Vector2(pointStartVector3.x, pointStartVector3.y)
    let pointEnd = new Vector2(pointEndVector3.x, pointEndVector3.y)

    let dir = pointEnd.clone().sub(pointStart)
    // let shrinkPx = config['point-size'] * 0.5 ;
    // let shrinkNDC = new Vector2(shrinkPx / width * 2.0, shrinkPx / height * 2.0);
    // pointStart = pointStart.add(dir.clone().multiply(shrinkNDC))
    // pointEnd = pointEnd.sub(dir.clone().multiply(shrinkNDC))
    // dir = pointEnd.clone().sub(pointStart)

    // let projectMouse = new Vector3(...position).project(this.impl.camera)
    let point = new Vector2(mouse.x, mouse.y)
    let t = MathUtils.clamp(point.clone().sub(pointStart).dot(dir) / dir.lengthSq(), 0, 1)
    let p = pointStart.clone().add(dir.multiplyScalar(t))
    let dx = (Math.abs(p.x - point.x) * width) / 2
    let dy = (Math.abs(p.y - point.y) * height) / 2
    if (Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(widthLine, 2)) {
      let dir3 = pointEndVector3.clone().sub(pointStartVector3)
      let project = pointStartVector3.clone().add(dir3.multiplyScalar(t))
      return project //projectMouse
    }
  }
  #intersectLine(mouse, widthLine) {
    let select
    this.#linesGeometry.forEach((line, index) => {
      let project = this.#pickLine2Project(line, mouse, widthLine)
      if (project) {
        if (select) {
          if (project.z <= select.project.z) {
            select = { data: line, project, index }
          }
        } else {
          select = { data: line, project, index }
        }
      }
    })
    return select
  }
  intersectLine(mouse, index = true, widthLine) {
    let select = this.#intersectLine(mouse, widthLine)
    if (index) {
      return select?.index
    } else {
      return select
    }
  }
  intersectObject(mouse, type) {
    let pickPoint = this.intersectPoint(mouse, false)
    let pickLine = this.intersectLine(mouse, false)
    let pickObjects = {}
    if (pickPoint) pickObjects.point = { type: 'point', ...pickPoint }
    if (pickLine) pickObjects.line = { type: 'line', ...pickLine }
    if (!Object.keys(pickObjects).length) {
      return
    }
    let pickObject
    if (pickPoint && pickLine) {
      let point = pickPoint.data
      let line = pickLine.data
      if (line.start === point.id || line.end === point.id) {
        pickObject = pickObjects.point
      }
    }
    if (!pickObject) {
      pickObject = Object.values(pickObjects).reduce((target, current) => {
        if (!target) return current
        if (current.project.z < target.project.z) return current
        if (current.project.z > target.project.z) return target
        return Raycaster.priorityMap[current.type] < Raycaster.priorityMap[target.type]
          ? current
          : target
      }, null)
    }
    if (!type) {
      return pickObject
    }
    if (type === pickObject.type) {
      return pickObject
    }
  }
  static priorityMap = {
    point: 0,
    line: 1,
  }
}
/* [问题]
 * 实例太多了怎么做性能优化（利用帧缓冲结合当前算法）
 */

/* [优化]
 * 线与点的重叠部分 渲染阶段解决，拾取部分还可以优化——从intersectObject过滤调整到pickLine2Project
 */
