<template>
  <Icon type="icon-tianjiaZpingmian" style="font-size: 16px" @click="onClick" title="正视" />
</template>
<script setup>
import { createFromIconfontCN } from '@ant-design/icons-vue'
import iconfont from '@/assets/iconfont/iconfont.js?url'
const Icon = createFromIconfontCN({
  scriptUrl: iconfont, // 在 iconfont.cn 上生成
})

/*
 * 正视操作
 */
import { useCamera, useControls } from './hooks/viewport-provide-context'
import { usePlanes as usePlanesGeometryQuery } from './hooks/geometry-query'
let planesGeometryQuery = usePlanesGeometryQuery()
let camera = useCamera()
let controls = useControls()
function onClick() {
  let { constant, normal } = planesGeometryQuery.getByIndex(0)
  let center = {
    x: -normal[0] * constant,
    y: -normal[1] * constant,
    z: -normal[2] * constant,
  }
  let distance = 5
  camera.position.set(
    center.x + normal[0] * distance,
    center.y + normal[1] * distance,
    center.z + normal[2] * distance,
  )
  camera.zoom=1
  camera.lookAt(center.x, center.y, center.z)
  camera.updateProjectionMatrix()
  controls.target.set(center.x, center.y, center.z)
  controls.update()
}
</script>
<style scoped lang="less"></style>
