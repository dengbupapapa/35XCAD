<template>
    <Icon type="icon-xian5" style="font-size: 24px;" @click="onClick"/>
</template>
<script setup>
import { createFromIconfontCN } from '@ant-design/icons-vue';
import iconfont from "@/assets/iconfont/iconfont.js?url"
const Icon = createFromIconfontCN({
  scriptUrl: iconfont, // 在 iconfont.cn 上生成
});
import useInteractions from './hooks/modes-manager-interactions.js'
const interactionsManager = useInteractions()
/*
 * 事件
 */
function onClick(){
  interactionsManager.activator.linesAdd();
}
</script>