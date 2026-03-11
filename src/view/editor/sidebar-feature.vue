<template>
  <a-tree
    v-model:expandedKeys="expandedKeys"
    v-model:selectedKeys="selectedKeys"
    v-model:checkedKeys="checkedKeys"
    :tree-data="treeData"
  >
    <template #title="{ title, icon,  id }">
      <SidebarFeaturePlane v-if="title === 'front'" :id="id">
        <Icon :type="icon" />
        {{ labelPlaneMap[title] }}
      </SidebarFeaturePlane>
    </template>
  </a-tree>
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import { usePlanes as usePlanesGeometryDerived } from './hooks/geometry-derived'
import SidebarFeaturePlane from './sidebar-feature-plane.vue'
import { createFromIconfontCN } from '@ant-design/icons-vue'
import {labelPlaneMap} from './locales/zh-CN/displayMap.js'
import iconfont from '@/assets/iconfont/iconfont.js?url'
let Icon = createFromIconfontCN({
  scriptUrl: iconfont, // 在 iconfont.cn 上生成
})

let planesGeometryDerived = usePlanesGeometryDerived()
let treeData = computed(() => {
  return planesGeometryDerived.value.map(({ normal, constant, id }) => {
    if (normal[0] === 0 && normal[1] === 0 && normal[2] === 1 && constant === 0) {
      return { title: 'front', icon: 'icon-jizhunmian', id }
    }
    return { title: 'default', icon: 'icon-jizhunmian', id }
  })
})

// let treeData = [
//   // {
//   //   title: 'parent 1',
//   //   key: '0-0',
//   //   children: [
//   //     {
//   //       title: 'parent 1-0',
//   //       key: '0-0-0',
//   //       disabled: true,
//   //       children: [
//   //         { title: 'leaf', key: '0-0-0-0', disableCheckbox: true },
//   //         { title: 'leaf', key: '0-0-0-1' },
//   //       ],
//   //     },
//   //     {
//   //       title: 'parent 1-1',
//   //       key: '0-0-1',
//   //       children: [{ key: '0-0-1-0', title: 'sss' }],
//   //     },
//   //   ],
//   // },

//   { title: '前视基准面', icon: 'icon-jizhunmian', key: "plane-front" },
//   // { title: '原点', icon:"icon-zuobiao", key: nanoid() },
//   // { title: '草图', icon:"icon-chuangjiancaotu", key: nanoid() },
// ]

const expandedKeys = ref([])
const selectedKeys = ref([])
const checkedKeys = ref([])
// watch(expandedKeys, () => {
//   console.log('expandedKeys', expandedKeys)
// })
// watch(selectedKeys, () => {
//   console.log('selectedKeys', selectedKeys)
// })
// watch(checkedKeys, () => {
//   console.log('checkedKeys', checkedKeys)
// })
</script>
