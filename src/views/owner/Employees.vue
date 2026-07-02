<template>
  <div class="employees-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Employees</h1>
        <p class="page-sub">Manage all drivers</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        Add Driver
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ employeeStore.totalEmployees }}</div>
        <div class="stat-label">Total Drivers</div>
      </div>
      <div class="stat-card active">
        <div class="stat-value">{{ employeeStore.activeEmployees.length }}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card inactive">
        <div class="stat-value">{{ employeeStore.inactiveEmployees.length }}</div>
        <div class="stat-label">Inactive</div>
      </div>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
      <input v-model="searchQuery" type="text" placeholder="Search drivers..." class="search-input" />
    </div>

    <!-- Loading -->
    <div v-if="employeeStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading employees...</p>
    </div>

    <!-- Table -->
    <div v-else-if="filteredEmployees.length > 0" class="table-container">
      <table class="employees-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>License</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in filteredEmployees" :key="employee.id">
            <td><strong>{{ employee.name }}</strong></td>
            <td>{{ employee.phone }}</td>
            <td>{{ employee.email }}</td>
            <td>{{ employee.license_number }}</td>
            <td>{{ employee.vehicle_name || '—' }}</td>
            <td>
              <span class="status-badge" :class="employee.status">
                {{ employee.status }}
              </span>
            </td>
            <td>
              <button @click="editEmployee(employee)" class="btn-icon" title="Edit">
                <font-awesome-icon icon="fa-solid fa-pen" />
              </button>
              <button @click="deleteEmployee(employee.id)" class="btn-icon danger" title="Delete">
                <font-awesome-icon icon="fa-solid fa-trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-solid fa-users" size="3x" />
      <h3>No Drivers</h3>
      <p>Start by adding your first driver.</p>
      <button class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" /> Add Driver
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/stores/employees'

const employeeStore = useEmployeeStore()
const searchQuery = ref('')
const showCreateModal = ref(false)

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employeeStore.employees
  const q = searchQuery.value.toLowerCase()
  return employeeStore.employees.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.phone.includes(q) ||
    e.email.toLowerCase().includes(q)
  )
})

function editEmployee(employee) { /* edit logic */ }
async function deleteEmployee(id) {
  if (confirm('Delete this employee?')) {
    await employeeStore.deleteEmployee(id)
  }
}

onMounted(() => { employeeStore.fetchEmployees() })
</script>

<style scoped>
.employees-page { animation: fadeIn 0.4s ease; padding: 0; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px 20px;
  text-align: center;
}
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
}
.stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
.stat-card.active .stat-value { color: #00E5FF; }
.stat-card.inactive .stat-value { color: #ff6b6b; }

.search-bar {
  position: relative;
  margin-bottom: 24px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.25);
}
.search-input {
  width: 100%;
  padding: 10px 16px 10px 44px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.search-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }

.table-container {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow-x: auto;
}
.employees-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}
.employees-table th {
  text-align: left;
  padding: 14px 16px;
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.employees-table td {
  padding: 14px 16px;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.employees-table tr:hover td { background: rgba(255,255,255,0.02); }
.employees-table tr:last-child td { border-bottom: none; }

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}
.status-badge.active { background: rgba(0,229,255,0.15); color: #00E5FF; }
.status-badge.inactive { background: rgba(255,107,107,0.15); color: #ff6b6b; }

.btn-icon {
  padding: 4px 8px;
  border: none;
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-icon.danger:hover { background: rgba(255,107,107,0.15); color: #ff6b6b; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
  color: rgba(255,255,255,0.3);
}
.spinner {
  width: 44px; height: 44px;
  border: 3px solid rgba(0,196,212,0.1);
  border-top-color: #00C4D4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>