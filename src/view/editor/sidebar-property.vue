<template>
  <div class="sidebar-property">
    <div class="title"><ProfileTwoTone /><b>属性</b></div>
    <div class="content">
      <a-collapse :bordered="false" v-model:activeKey="activeKey">
        <a-collapse-panel key="1" header="所选实体">
          <select size="5" class="select">
            <option value="1">选项一</option>
            <option value="2">选项二</option>
            <option value="3">选项三</option>
            <option value="4">选项四</option>
            <option value="5">选项五</option>
          </select>
        </a-collapse-panel>
        <a-collapse-panel key="2" header="现有几何关系">
          <select size="5" class="select">
            <option value="1">选项一</option>
            <option value="2">选项二</option>
            <option value="3">选项三</option>
            <option value="4">选项四</option>
            <option value="5">选项五</option>
          </select>
        </a-collapse-panel>
        <a-collapse-panel key="3" header="添加几何关系">
          <div style="display: flex; flex-direction: column; margin-left: -16px; margin-right: -16px;">
            <a-button type="text" style="text-align: left">
              <template #icon>
                <DownloadOutlined />
              </template>
              Text Button
            </a-button>
            <a-button type="text" style="text-align: left">
              <template #icon>
                <DownloadOutlined />
              </template>
              Text Button
            </a-button>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { ProfileTwoTone, DownloadOutlined } from '@ant-design/icons-vue'
let activeKey = ref([1, 2, 3])
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
