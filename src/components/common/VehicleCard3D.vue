<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  vehicle: {
    type: Object,
    required: true,
    default: () => ({
      icon: 'car',
      title: 'Untitled Vehicle',
      description: 'No description available',
      tags: [],
      price: 'N/A',
      year: 'N/A',
      category: 'General'
    })
  }
})

const rotX = ref(0)
const rotY = ref(0)
const glareX = ref(50)
const glareY = ref(50)
const isHovered = ref(false)

function onMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  rotY.value = ((e.clientX - cx) / rect.width) * 18
  rotX.value = -((e.clientY - cy) / rect.height) * 18
  glareX.value = ((e.clientX - rect.left) / rect.width) * 100
  glareY.value = ((e.clientY - rect.top) / rect.height) * 100
}

function onLeave() {
  rotX.value = 0
  rotY.value = 0
  isHovered.value = false
}

function onEnter() {
  isHovered.value = true
}

function getIcon() {
  const categoryIcons = {
    'Motorcycle': 'fa-solid fa-motorcycle',
    'Bajaji': 'fa-solid fa-truck-front',
    'Car': 'fa-solid fa-car',
    'SUV': 'fa-solid fa-truck',
    'Luxury': 'fa-solid fa-car-side',
  }
  const cat = props.vehicle.type || props.vehicle.category
  return props.vehicle.icon || categoryIcons[cat] || 'fa-solid fa-car'
}

function getCategoryBadgeClass() {
  const classes = {
    'Motorcycle': 'motorcycle',
    'Bajaji': 'bajaji',
    'Car': 'car',
    'SUV': 'suv',
    'Luxury': 'luxury',
  }
  const cat = props.vehicle.type || props.vehicle.category
  return classes[cat] || 'car'
}

function hasValidLink(url) {
  return url && url !== '#' && url !== '' && url !== 'null'
}

const wrapperStyle = computed(() => ({
  perspective: '1000px',
  display: 'block',
}))

const cardStyle = computed(() => ({
  transform: `rotateX(${rotX.value}deg) rotateY(${rotY.value}deg) ${isHovered.value ? 'scale(1.04)' : 'scale(1)'}`,
  transition: isHovered.value ? 'transform 0.1s ease' : 'transform 0.5s ease',
  boxShadow: isHovered.value
    ? `0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(0,196,212,0.15), inset 0 0 0 1px rgba(0,229,255,0.3)`
    : `0 8px 32px rgba(0,0,0,0.3)`,
}))

const glareStyle = computed(() => ({
  opacity: isHovered.value ? 0.12 : 0,
  background: `radial-gradient(circle at ${glareX.value}% ${glareY.value}%, rgba(255,255,255,0.9) 0%, transparent 60%)`,
  transition: 'opacity 0.3s',
}))
</script>

<template>
  <div
    v-if="vehicle"
    class="card-3d-wrapper"
    @mousemove="onMove"
    @mouseleave="onLeave"
    @mouseenter="onEnter"
    :style="wrapperStyle"
  >
    <div class="vehicle-card-3d glass-card" :style="cardStyle">
      <div class="glare" :style="glareStyle"></div>

      <div class="vehicle-icon">
        <font-awesome-icon :icon="getIcon()" size="2x" />
      </div>

      <span v-if="vehicle.type || vehicle.category" class="category-badge" :class="getCategoryBadgeClass()">
        {{ vehicle.type || vehicle.category }}
      </span>

      <h3 class="vehicle-title">{{ vehicle.name || vehicle.title || $t('vehicle.untitled') }}</h3>

      <p class="vehicle-desc">{{ vehicle.description || $t('vehicle.noDescription') }}</p>

      <div class="vehicle-tags">
        <span v-for="tag in (vehicle.tags || [])" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <div class="vehicle-footer">
        <span class="price">
          <font-awesome-icon icon="fa-solid fa-tag" size="xs" />
          {{ vehicle.price || $t('vehicle.contactPrice') }}
        </span>
        <span class="year">{{ vehicle.year || 'N/A' }}</span>
      </div>

      <div class="vehicle-links">
        <a 
          v-if="hasValidLink(vehicle.booking_url)"
          :href="vehicle.booking_url" 
          class="vehicle-link book"
          target="_blank"
          rel="noopener noreferrer"
        >
          <font-awesome-icon icon="fa-solid fa-calendar-check" size="xs" />
          {{ $t('vehicle.bookNow') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" size="xs" />
        </a>

        <a 
          v-if="hasValidLink(vehicle.details_url)"
          :href="vehicle.details_url" 
          class="vehicle-link details"
          target="_blank"
          rel="noopener noreferrer"
        >
          <font-awesome-icon icon="fa-solid fa-info-circle" size="xs" />
          {{ $t('vehicle.details') }}
        </a>

        <span v-if="!hasValidLink(vehicle.booking_url) && !hasValidLink(vehicle.details_url)" class="vehicle-link coming-soon">
          <font-awesome-icon icon="fa-solid fa-clock" size="xs" />
          {{ $t('vehicle.comingSoon') }}
        </span>
      </div>

      <div class="card-accent-line"></div>
    </div>
  </div>
</template>

<style scoped>
.card-3d-wrapper {
  display: block;
  cursor: pointer;
}

.vehicle-card-3d {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 28px 24px;
  transition: all 0.3s ease;
  overflow: hidden;
  transform-style: preserve-3d;
  will-change: transform;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.glass-card {
  backdrop-filter: blur(12px);
}

.vehicle-card-3d:hover {
  border-color: rgba(0, 229, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

.glare {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  z-index: 10;
}

.vehicle-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 196, 212, 0.15), rgba(0, 229, 255, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00c4d4;
  flex-shrink: 0;
  font-size: 1.5rem;
}

.vehicle-icon svg {
  width: 24px;
  height: 24px;
}

.category-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  align-self: flex-start;
}

.category-badge.motorcycle {
  background: rgba(0, 196, 212, 0.15);
  color: #00C4D4;
}

.category-badge.bajaji {
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
}

.category-badge.car {
  background: rgba(37, 99, 196, 0.15);
  color: #2563C4;
}

.category-badge.suv {
  background: rgba(45, 43, 127, 0.15);
  color: #6C63FF;
}

.category-badge.luxury {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}

.vehicle-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.vehicle-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.vehicle-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 0.65rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.vehicle-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.price {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #00E5FF;
}

.vehicle-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.vehicle-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.vehicle-link.book {
  background: linear-gradient(90deg, rgba(0, 196, 212, 0.15), rgba(0, 229, 255, 0.05));
  border: 1px solid rgba(0, 229, 255, 0.25);
  color: #00e5ff;
}

.vehicle-link.book:hover {
  background: linear-gradient(90deg, rgba(0, 196, 212, 0.3), rgba(0, 229, 255, 0.15));
  border-color: rgba(0, 229, 255, 0.5);
  transform: translateX(4px);
  box-shadow: 0 0 25px rgba(0, 229, 255, 0.1);
}

.vehicle-link.details {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.6);
}

.vehicle-link.details:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
  color: #fff;
}

.vehicle-link.coming-soon {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.25);
  cursor: not-allowed;
}

.vehicle-link svg {
  font-size: 0.7rem;
}

.vehicle-link.book:hover svg,
.vehicle-link.details:hover svg {
  transform: translateX(2px);
}

.card-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00C4D4, #00E5FF, transparent);
  opacity: 0.4;
}

@media (max-width: 768px) {
  .vehicle-card-3d {
    padding: 20px 16px;
    min-height: 240px;
  }

  .vehicle-title {
    font-size: 1rem;
  }

  .vehicle-desc {
    font-size: 0.8rem;
  }

  .vehicle-link {
    font-size: 0.7rem;
    padding: 4px 12px;
  }

  .vehicle-links {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .vehicle-links {
    flex-direction: column;
  }
  
  .vehicle-link {
    width: 100%;
    justify-content: center;
  }
}
</style>
