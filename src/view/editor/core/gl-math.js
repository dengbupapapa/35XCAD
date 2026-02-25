import { Vector3 as ImplVector3, Vector2 as ImplVector2 } from 'three'

export class Vector3 {
  impl
  constructor(...args) {
    this.impl = new ImplVector3(...args)
  }
  set(...args) {
    this.impl.set(...args)
  }
  sub(...args) {
    return new Vector3(...this.impl.sub(...args.map(({ impl }) => impl)).toArray())
  }
  add(...args) {
    return new Vector3(...this.impl.add(...args.map(({ impl }) => impl)).toArray())
  }
  fromArray(...args) {
    this.impl.fromArray(...args)
  }
  toArray(...args) {
    return this.impl.toArray(...args)
  }
  clone(...args) {
    return new Vector3(...this.impl.clone(...args).toArray())
  }
  project(...args) {
    return new Vector3(...this.impl.project(...args.map(({ impl }) => impl)).toArray())
  }
  length(...args) {
    return this.impl.length(...args.map(({ impl }) => impl))
  }
  set x(x) {
    this.impl.x = x
  }
  get x() {
    return this.impl.x
  }
  set y(y) {
    this.impl.y = y
  }
  get y() {
    return this.impl.y
  }
  set z(z) {
    this.impl.z = z
  }
  get z() {
    return this.impl.z
  }
}
export class Vector2 {
  impl
  constructor(...args) {
    this.impl = new ImplVector2(...args)
  }
  set(...args) {
    this.impl.set(...args)
  }
  sub(...args) {
    return new Vector2(...this.impl.sub(...args.map(({ impl }) => impl)).toArray())
  }
  add(...args) {
    return new Vector2(...this.impl.add(...args.map(({ impl }) => impl)).toArray())
  }
  fromArray(...args) {
    this.impl.fromArray(...args)
  }
  toArray(...args) {
    return this.impl.toArray(...args)
  }
  clone(...args) {
    return new Vector2(...this.impl.clone(...args).toArray())
  }
  project(...args) {
    return new Vector2(...this.impl.project(...args.map(({ impl }) => impl)).toArray())
  }
  length(...args) {
    return this.impl.length(...args.map(({ impl }) => impl))
  }
  angle(...args) {
    return this.impl.angle(...args.map(({ impl }) => impl))
  }
  set x(x) {
    this.impl.x = x
  }
  get x() {
    return this.impl.x
  }
  set y(y) {
    this.impl.y = y
  }
  get y() {
    return this.impl.y
  }
}
