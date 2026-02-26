<template>
    <a-tree
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      v-model:checkedKeys="checkedKeys"
      :tree-data="treeData"
    >
      <template #title="{ title, icon }">
          <Icon :type="icon"/>
          {{ title }}
      </template>
    </a-tree>
  </template>
  <script setup>
  import { ref, watch } from 'vue'
  import { nanoid } from './utils/simple'
  import { createFromIconfontCN } from '@ant-design/icons-vue';
  import iconfont from "@/assets/iconfont/iconfont.js?url"
  const Icon = createFromIconfontCN({
    scriptUrl: iconfont, // 在 iconfont.cn 上生成
  });
  
  const treeData = [
    // {
    //   title: 'parent 1',
    //   key: '0-0',
    //   children: [
    //     {
    //       title: 'parent 1-0',
    //       key: '0-0-0',
    //       disabled: true,
    //       children: [
    //         { title: 'leaf', key: '0-0-0-0', disableCheckbox: true },
    //         { title: 'leaf', key: '0-0-0-1' },
    //       ],
    //     },
    //     {
    //       title: 'parent 1-1',
    //       key: '0-0-1',
    //       children: [{ key: '0-0-1-0', title: 'sss' }],
    //     },
    //   ],
    // },
  
    { title: '前视基准面', icon:"icon-jizhunmian", key: nanoid() },
    // { title: '原点', icon:"icon-zuobiao", key: nanoid() },
    // { title: '草图', icon:"icon-chuangjiancaotu", key: nanoid() },
  ]
  
  const expandedKeys = ref([])
  const selectedKeys = ref([])
  const checkedKeys = ref([])
  watch(expandedKeys, () => {
    console.log('expandedKeys', expandedKeys)
  })
  watch(selectedKeys, () => {
    console.log('selectedKeys', selectedKeys)
  })
  watch(checkedKeys, () => {
    console.log('checkedKeys', checkedKeys)
  })
  </script>
  