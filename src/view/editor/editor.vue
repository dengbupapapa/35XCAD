<template>
  <div class="editor" v-if="status === 'resolve'">
    <!-- <TestLocalStorage /> -->
    <!-- <TestModesInteractionButton /> -->
    <div class="head">
      <div class="logo"></div>
      <div class="toolbar">
        <Toolbar />
      </div>
    </div>
    <div class="graphbar">
      <Graphbar />
    </div>
    <div class="body">
      <div class="sidebar">
        <Sidebar />
      </div>
      <div class="viewport">
        <!-- <TestConstraintsButton /> -->
        <Viewport />
      </div>
    </div>
  </div>
  <template v-else-if="status === 'reject'">
    <div style="display: flex; height: 100%; justify-content: center; align-items: center">
      <a-result status="error" title="加载失败">
        <template #extra>
          <a-button type="primary" @click="onReload">刷新</a-button>
        </template>
      </a-result>
    </div>
  </template>
  <template v-else>
    <div style="display: flex; height: 100%; justify-content: center; align-items: center">
      <a-spin tip="Loading..." />
    </div>
  </template>
</template>
<script setup>
import { onMounted, onUnmounted } from 'vue'
import Toolbar from './toolbar.vue'
import Graphbar from './graphbar.vue'
import Sidebar from './sidebar.vue'
import Viewport from './viewport.vue'
import TestModesInteractionButton from './test-modes-interaction-button.vue'
import TestConstraintsButton from './test-constraints-button.vue'
import TestLocalStorage from './test-local-storage.vue'
import useRegistryGeometryProvideContext from './hooks/geometry-provide-context.js'
import useRegistryViewportProvideContext from './hooks/viewport-provide-context.js'
import useRegistryModesProvideContext from './hooks/modes-provide-context.js'
import useRegistryInteractionProvideContext from './hooks/interaction-provide-context.js'
import useRegistrySolverProvideContext from './hooks/solver-gcs-provide-context.js'
/*
 * 注册provide上下文
 */
useRegistryGeometryProvideContext()
useRegistryViewportProvideContext()
useRegistryModesProvideContext()
useRegistryInteractionProvideContext()
let { status } = useRegistrySolverProvideContext()

/*
 * 移除事件默认行为
 */
function preventDefaultFn(e) {
  e.preventDefault()
}
onMounted(() => {
  document.addEventListener('contextmenu', preventDefaultFn)
})
onUnmounted(() => {
  document.removeEventListener('contextmenu', preventDefaultFn)
})

/*
 * 其他事件
 */
function onReload() {
  window.location.reload(true)
}

/*
 * 1、射线->几何算法——现在的mesh不是threejs的标准对象了 （ko）
 * 2、自定义几何算法性能解决方法 （ko）
 * 3、事件绑定时机有问题 (ko)
 */

/*
 * 1、共用点问题，到底是约束求解还是，就真的是共用点
 */

/*
 * 后续要使用数学的方法计算，而不是使用Raycaster通过三角面计算 (ko)
 * 1、后续中的1个图形不等于一个实例（如曲线）
 */
</script>
<style scoped lang="less">
.editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  .head {
    display: flex;
    height: 50px;
    align-items: stretch;
    .logo {
      background-color: #555;
      width: 110px;
      display: flex;
      justify-content: center;
      align-items: center;
      &::after {
        content: '35XCAD';
        color: #fff;
      }
    }
    .toolbar {
      display: flex;
      align-items: center;
      margin-left: 10px;
      > * {
        font-size: 12px;
        color: #333;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 0 5px;
        padding: 5px;
        user-select: none;
        cursor: pointer;
        &:hover {
          background-color: #eee;
        }
        &:active {
          background-color: #ddd;
        }
      }
    }
    border-bottom: #eee 1px solid;
  }
  .graphbar {
    height: 50px;
    background-color: #ccc;
    display: flex;
    align-items: center;
    padding-left: 10px;
    > * {
      margin: 0 2px;
      padding: 2px;
      line-height: 30px;
      cursor: pointer;
      &:hover {
        background-color: #eee;
      }
      &:active {
        background-color: #ddd;
      }
    }
  }
  .body {
    display: flex;
    flex: 1;
    overflow: hidden;
    .sidebar {
      width: 240px;
      margin-top: 15px;
    }
    .viewport {
      // margin-top: 10px;
      // margin-left: 10px;
      // margin-bottom: 10px;
      // margin-right: 10px;
      flex: 1;
      box-sizing: border-box;
      overflow: hidden;
      background-color: #eee;
      display: flex;
    }
  }
}
</style>
