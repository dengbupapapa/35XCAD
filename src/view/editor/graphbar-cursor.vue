<template>
    <Icon type="icon-zhizhen-cai" style="font-size: 22px;" @click="onClick"/>
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
  interactionsManager.activator.entitieSelect();
  interactionsManager.activator.entitieTranslation();
}
import hotkeys from 'hotkeys-js';
hotkeys('esc', function(event, handler){
  event.preventDefault()
  onClick()
});
</script>