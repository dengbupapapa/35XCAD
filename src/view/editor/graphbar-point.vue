<template>
    <Icon type="icon-dian" style="font-size: 30px;" @click="onClick"/>
</template>
<script setup>
import { createFromIconfontCN } from '@ant-design/icons-vue';
const Icon = createFromIconfontCN({
  scriptUrl: './iconfont/iconfont.js', // 在 iconfont.cn 上生成
});

import useInteractions from './hooks/modes-manager-interactions.js'
const interactionsManager = useInteractions()
/*
 * 事件
 */
function onClick(){
  interactionsManager.activator.pointsAdd();
}
</script>