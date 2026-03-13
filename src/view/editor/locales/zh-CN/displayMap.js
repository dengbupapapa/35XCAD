export const labelBasicMap = {
  hidden: '隐藏',
  visible: '显示',
  'front-view': '正视',
}

export const labelPlaneMap = {
  front: '前视基准面',
  top: '上视基准面',
  right: '右视基准面',
  default: '基准面',
}

export const labelGeometryMap = {
  point: '点',
  line: '线',
  arc: '圆弧',
  polyline: '多段线',
  plane: '基准面',
}

export const labelConstraintMap = {
  addConstraintP2PDistance: '距离',
  addConstraintHorizontal: '水平',
  addConstraintCoordinate: '固定',
  addConstraintCoordinateX: '垂直固定',
  addConstraintCoordinateY: '水平固定',
  addConstraintP2PCoincident: '重合',
  addConstraintPointOnLine: '点在线上',
  addConstraintPointOnLine2: '点在线上2',
  addConstraintPointOnPerpBisector: '点在线垂直平分线上',
  addConstraintParallel: '线平行',
  addConstraintPerpendicular: '线垂直',
  addConstraintEqualLength: '线长度相等',
}

export const tipSolverResultStatus = {
  0: '约束求解找到使误差函数最小化为0的解',
  1: '约束求解找到使误差函数最小化的解,但不是0',
  2: '约束求解未能找到任何解',
  3: '约束求解成功但解无效',
}
export const tipSolverResultDiagnose = {
  hasRedundant: '存在求解冗余项',
  hasConflicting: '存在求解冲突项',
}
