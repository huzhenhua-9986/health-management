<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>系统设置</span>
          </template>

          <el-form label-width="100px">
            <el-form-item label="系统名称">
              <el-input v-model="settings.systemName" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
              >
                <img v-if="settings.logoUrl" :src="settings.logoUrl" class="logo" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="settings.contactPhone" />
            </el-form-item>
            <el-form-item label="联系邮箱">
              <el-input v-model="settings.contactEmail" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>预警设置</span>
          </template>

          <el-form label-width="120px">
            <el-form-item label="高血压预警">
              <el-input-number v-model="thresholds.highBP" :min="90" :max="200" />
              <span class="unit">mmHg</span>
            </el-form-item>
            <el-form-item label="低血压预警">
              <el-input-number v-model="thresholds.lowBP" :min="40" :max="100" />
              <span class="unit">mmHg</span>
            </el-form-item>
            <el-form-item label="高血糖预警">
              <el-input-number v-model="thresholds.highBS" :min="5" :max="30" :step="0.1" />
              <span class="unit">mmol/L</span>
            </el-form-item>
            <el-form-item label="低血糖预警">
              <el-input-number v-model="thresholds.lowBS" :min="1" :max="5" :step="0.1" />
              <span class="unit">mmol/L</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveThresholds">保存阈值</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <span>角色权限管理</span>
          </template>

          <div class="role-list">
            <div v-for="role in roles" :key="role.id" class="role-item">
              <div class="role-name">{{ role.name }}</div>
              <div>
                <el-button type="primary" link size="small" @click="handleEditRole(role)">
                  编辑权限
                </el-button>
              </div>
            </div>
            <el-button type="primary" style="width: 100%; margin-top: 10px">
              添加角色
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const settings = reactive({
  systemName: '健康管理系统',
  logoUrl: '',
  contactPhone: '',
  contactEmail: ''
})

const thresholds = reactive({
  highBP: 140,
  lowBP: 90,
  highBS: 11.1,
  lowBS: 3.9
})

const roles = ref([
  { id: 1, name: '管理员', permissions: ['all'] },
  { id: 2, name: '普通用户', permissions: ['view', 'edit'] }
])

const handleSaveSettings = () => {
  ElMessage.success('设置保存成功')
}

const handleSaveThresholds = () => {
  ElMessage.success('预警阈值保存成功')
}

const handleEditRole = (role: any) => {
  ElMessage.info(`编辑角色：${role.name}`)
}
</script>

<style scoped>
.settings-page {
  height: 100%;
}

.avatar-uploader {
  display: flex;
  align-items: center;
}

.logo {
  width: 60px;
  height: 60px;
  border-radius: 6px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 60px;
  height: 60px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unit {
  margin-left: 8px;
  color: #999;
  font-size: 14px;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.role-name {
  font-weight: 500;
}
</style>
