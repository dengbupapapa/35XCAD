export function viewport2ndc(rect, pos) {
  let x = ((pos.x - rect.left) / rect.width) * 2 - 1
  let y = -((pos.y - rect.top) / rect.height) * 2 + 1
  return { x, y }
}

import { customAlphabet } from 'nanoid'
export const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)

export function assertIndexFormList(list, index, tag = '') {
  if (index < 0 || index >= list.length) {
    throw `[${tag}] not exist list by index:${index}!`
  }
}

/*
 * [问题]
 * 基于构建平面做会有精度问题，比如 0 ~~~~~~ 8.881784197001252e-16
 */
export function planeCoords2worldCoords([u, v], plane) {
  let {
    normal: [nx, ny, nz],
    constant: d,
  } = plane
  // XY 平面
  if (nx === 0 && ny === 0 && nz === 1) {
    return [u, v, -d]
  }
  // YZ 平面
  if (nx === 1 && ny === 0 && nz === 0) {
    return [-d, u, v]
  }
  // XZ 平面
  if (nx === 0 && ny === 1 && nz === 0) {
    return [u, -d, v]
  }

  let { origin, uDir, vDir } = buildPlaneBasis(plane)
  return add(origin, add(scale(uDir, u), scale(vDir, v)))
}

export function worldCoords2planeCoords([x, y, z], plane) {
  let {
    normal: [nx, ny, nz],
  } = plane
  // XY
  if (nx === 0 && ny === 0 && nz === 1) {
    return [x, y]
  }
  // YZ
  if (nx === 1 && ny === 0 && nz === 0) {
    return [y, z]
  }
  // XZ
  if (nx === 0 && ny === 1 && nz === 0) {
    return [x, z]
  }

  let { origin, uDir, vDir } = buildPlaneBasis(plane)
  let p = sub([x, y, z], origin)
  return [dot(p, uDir), dot(p, vDir)]
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2])
  return [v[0] / len, v[1] / len, v[2] / len]
}

function scale(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s]
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function buildPlaneBasis(plane) {
  let {
    normal: [nx, ny, nz],
    constant: d,
  } = plane
  const n = normalize([nx, ny, nz])

  // 选一个不平行于 n 的向量
  const tmp = Math.abs(n[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0]

  const uDir = normalize(cross(tmp, n))
  const vDir = cross(n, uDir)

  // 平面原点（世界原点到平面的垂足）
  const origin = scale(n, -d / dot(n, n))

  return { origin, uDir, vDir, n }
}
