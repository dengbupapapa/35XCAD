<template>
  <div class="sidebar-property">
    <div class="title"><ProfileTwoTone /><b>属性</b></div>
    <div class="content">
      <a-collapse :bordered="false" v-model:activeKey="activeKey">
        <a-collapse-panel key="1" header="所选实体" v-if="selectGeometrysStrict.length > 1">
          <SidebarPropertyGeometrys/>
        </a-collapse-panel>
        <a-collapse-panel key="2" header="现有几何关系">
          <SidebarPropertyConstraints/>
        </a-collapse-panel>
        <a-collapse-panel key="3" header="添加几何关系">
          <SidebarPropertyConstraintAdd />
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ProfileTwoTone } from '@ant-design/icons-vue'
import {
  useSelectGeometrysStrict,
} from './hooks/select-derived'
import SidebarPropertyGeometrys from "./sidebar-property-geometrys.vue"
import SidebarPropertyConstraints from "./sidebar-property-constraints.vue"
import SidebarPropertyConstraintAdd from "./sidebar-property-constraint-add.vue"
let activeKey = ref([1, 2, 3])
let selectGeometrysStrict = useSelectGeometrysStrict()
</script>
<style scoped lang="less">
.sidebar-property {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  .title {
    display: flex;
    align-items: center;
    padding-left: 10px;
    b {
      margin-left: 5px;
      color: #444;
    }
  }
  .content {
    flex: 1;
    overflow-y: auto;
    border-top: 1px solid #d9d9d9;
    margin-top: 15px;
    .select {
      width: 100%;
      outline-color: #0e76e1;
    }
  }
}
</style>
