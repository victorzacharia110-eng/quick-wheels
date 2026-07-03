import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public Routes ──────────────────────────────────────────────────────
    { 
      path: '/', 
      component: Home,
      meta: { title: 'Home', public: true }
    },
    { 
      path: '/vehicles', 
      component: () => import('../views/Vehicles.vue'),
      meta: { title: 'Vehicles', public: true }
    },
    { 
      path: '/about', 
      component: () => import('../views/About.vue'),
      meta: { title: 'About', public: true }
    },
    { 
      path: '/contact', 
      component: () => import('../views/Contact.vue'),
      meta: { title: 'Contact', public: true }
    },
    
    // ── Auth Routes ──────────────────────────────────────────────────────
    { 
      path: '/auth/login', 
      component: () => import('../views/auth/Login.vue'),
      meta: { guest: true, title: 'Login' }
    },
    { 
      path: '/auth/register', 
      component: () => import('../views/auth/Register.vue'),
      meta: { guest: true, title: 'Register' }
    },
    
    // ── Owner Routes ─────────────────────────────────────────────────────
    {
      path: '/owner',
      component: () => import('../views/owner/OwnerLayout.vue'),
      meta: { requiresAuth: true, role: 'owner' },
      children: [
        { path: '', component: () => import('../views/owner/OwnerDashboard.vue'), meta: { title: 'Dashboard' } },
        { path: 'contracts', component: () => import('../views/owner/Contracts.vue'), meta: { title: 'Contracts' } },
        { path: 'vehicles', component: () => import('../views/owner/Vehicles.vue'), meta: { title: 'Vehicles' } },
        { path: 'employees', component: () => import('../views/owner/Employees.vue'), meta: { title: 'Employees' } },
        { path: 'payments', component: () => import('../views/owner/Payments.vue'), meta: { title: 'Payments' } },
        { path: 'reports', component: () => import('../views/owner/Reports.vue'), meta: { title: 'Reports' } },
        { path: 'settings', component: () => import('../views/owner/Settings.vue'), meta: { title: 'Settings' } },
        { path: 'gps', component: () => import('../views/owner/GpsTracking.vue'), meta: { title: 'GPS Tracking' } },
        { path: 'site-content', component: () => import('../views/owner/SiteContent.vue'), meta: { title: 'Site Content', role: 'owner' } },
      ]
    },
    
    // ── Customer Routes ─────────────────────────────────────────────────
    {
      path: '/customer',
      component: () => import('../views/customer/CustomerLayout.vue'),
      meta: { requiresAuth: true, role: 'customer' },
      children: [
        { path: '', component: () => import('../views/customer/CustomerDashboard.vue'), meta: { title: 'Dashboard' } },
        { path: 'book', component: () => import('../views/customer/RideBooking.vue'), meta: { title: 'Book a Ride' } },
        { path: 'my-rides', component: () => import('../views/customer/MyRides.vue'), meta: { title: 'My Rides' } },
        { path: 'nearby', component: () => import('../views/customer/NearbyDrivers.vue'), meta: { title: 'Nearby Drivers' } },
      ]
    },
    
    // ── Employee Routes ──────────────────────────────────────────────────
    {
      path: '/employee',
      component: () => import('../views/employee/EmployeeLayout.vue'),
      meta: { requiresAuth: true, role: 'employee' },
      children: [
        { path: '', component: () => import('../views/employee/EmployeeDashboard.vue'), meta: { title: 'Dashboard' } },
        { path: 'my-contract', component: () => import('../views/employee/MyContract.vue'), meta: { title: 'My Contract' } },
        { path: 'payments', component: () => import('../views/employee/Payments.vue'), meta: { title: 'My Payments' } },
        { path: 'profile', component: () => import('../views/employee/EmployeeProfile.vue'), meta: { title: 'Profile' } },
      ]
    },
    
    // ── 404 ──────────────────────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', component: () => import('../views/NotFound.vue'), meta: { title: 'Not Found' } },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

// ── Navigation Guard ──────────────────────────────────────────────────────
router.beforeEach(async (to, from) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  
  if (!authStore.isInitialized) {
    await authStore.init()
  }
  
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  if (isAuthenticated && to.meta.guest) {
    if (userRole === 'owner') return '/owner'
    if (userRole === 'employee') return '/employee'
    if (userRole === 'customer') return '/customer'
    return '/'
  }

  if (!isAuthenticated && to.meta.requiresAuth) {
    return { path: '/auth/login', query: { redirect: to.fullPath } }
  }

  if (isAuthenticated && to.meta.role && to.meta.role !== userRole) {
    if (userRole === 'owner') return '/owner'
    if (userRole === 'employee') return '/employee'
    if (userRole === 'customer') return '/customer'
    return '/'
  }

  return true
})

export default router