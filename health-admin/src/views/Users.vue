<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" placeholder="邮箱/昵称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable>
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.role !== 'admin'"
              type="warning"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              v-if="row.role !== 'admin'"
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const tableData = ref<any[]>([])

const queryForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 从 localStorage 加载注册用户
const loadData = () => {
  loading.value = true
  try {
    // 获取所有注册用户
    let users = JSON.parse(localStorage.getItem('registered_users') || '[]')

    // 添加超级管理员到列表
    const superAdmin = {
      id: 'super-admin-001',
      email: 'admin@health.com',
      nickname: '超级管理员',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString()
    }

    // 检查是否已有超级管理员
    if (!users.find((u: any) => u.email === 'admin@health.com')) {
      users.unshift(superAdmin)
    }

    // 关键词搜索
    if (queryForm.keyword) {
      users = users.filter((u: any) =>
        u.email?.toLowerCase().includes(queryForm.keyword.toLowerCase()) ||
        u.nickname?.toLowerCase().includes(queryForm.keyword.toLowerCase())
      )
    }

    // 状态筛选
    if (queryForm.status) {
      users = users.filter((u: any) => u.status === queryForm.status)
    }

    // 排序（按创建时间倒序）
    users.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 分页
    pagination.total = users.length
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = users.slice(start, end)
  } catch (err) {
    ElMessage.error('加载数据失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.status = ''
  handleQuery()
}

const handleView = (row: any) => {
  router.push(`/users/${row.id}`)
}

const handleToggleStatus = async (row: any) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'

  await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
    type: 'warning'
  })

  try {
    // 从 localStorage 获取用户列表
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]')
    const userIndex = users.findIndex((u: any) => u.id === row.id)

    if (userIndex !== -1) {
      // 更新用户状态
      users[userIndex].status = newStatus
      localStorage.setItem('registered_users', JSON.stringify(users))
      ElMessage.success(`${action}成功`)
      loadData()
    } else {
      ElMessage.error('用户不存在')
    }
  } catch (err) {
    ElMessage.error(`${action}失败`)
  }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除该用户吗？此操作不可恢复！', '警告', {
    type: 'error'
  })

  try {
    // 从 localStorage 获取用户列表
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]')
    const filteredUsers = users.filter((u: any) => u.id !== row.id)

    if (filteredUsers.length < users.length) {
      localStorage.setItem('registered_users', JSON.stringify(filteredUsers))
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error('用户不存在')
    }
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.users-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-form {
  margin-bottom: 20px;
}
</style>
