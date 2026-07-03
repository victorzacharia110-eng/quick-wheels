<template>
  <div class="fleet-slider-section">
    <div class="fleet-header">
      <p class="fleet-label">{{ $t('home.ourFleet') }}</p>
      <h2 class="fleet-title">{{ $t('vehicle.title') }} <span class="gradient-text">{{ $t('vehicle.inMotion') }}</span></h2>
      <p class="fleet-sub">{{ $t('vehicle.watchFleet') }}</p>
    </div>

    <div class="slider-container">
      <div class="car-track">
        <div class="moving-vehicle">
          <div class="vehicle-name">{{ $t('vehicle.reliableFast') }}</div>
          <div class="vehicle-circle">
            <font-awesome-icon icon="fa-solid fa-motorcycle" class="bike-icon" />
          </div>
        </div>
        
        <div class="speed-lines-horizontal">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="motion-lines">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="vehicle-types">
        <div v-for="(vehicle, i) in vehicles" :key="i" class="type-item">
          <div class="type-icon">
            <font-awesome-icon :icon="vehicle.icon" />
          </div>
          <span class="type-name">{{ vehicle.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const vehicles = [
  { name: t('status.motorcycle'), icon: 'fa-solid fa-motorcycle' },
  { name: t('status.bajaji'), icon: 'fa-solid fa-truck-front' },
  { name: t('status.car'), icon: 'fa-solid fa-car' }
]
</script>

<style scoped>
.fleet-slider-section {
  padding: 80px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at center, rgba(0, 196, 212, 0.03) 0%, transparent 70%);
}

.fleet-header {
  margin-bottom: 60px;
}
.fleet-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #00C4D4;
  font-weight: 600;
}
.fleet-title {
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 800;
  margin: 12px 0 8px;
  color: #fff;
}
.gradient-text {
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.fleet-sub {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
}

.slider-container {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.car-track {
  position: relative;
  width: 100%;
  height: 120px;
  background: rgba(0, 196, 212, 0.03);
  border-radius: 60px;
  border: 2px solid rgba(0, 229, 255, 0.06);
  overflow: hidden;
  margin-bottom: 50px;
  box-shadow: 0 0 60px rgba(0, 196, 212, 0.05);
}

.moving-vehicle {
  position: absolute;
  top: 50%;
  left: -100px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  animation: driveAcross 7s linear infinite;
  z-index: 3;
}

.vehicle-circle {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, rgba(0, 196, 212, 0.15), rgba(0, 229, 255, 0.05));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 229, 255, 0.2);
  box-shadow: 0 0 40px rgba(0, 196, 212, 0.15);
  animation: bikeBounce 0.4s ease-in-out infinite alternate;
  flex-shrink: 0;
}

.bike-icon {
  font-size: 2.8rem;
  color: #00C4D4;
  animation: bikeGlow 1.5s ease-in-out infinite;
}

.vehicle-name {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  text-shadow: 0 0 40px rgba(0, 196, 212, 0.2);
  opacity: 0.7;
}

@keyframes driveAcross {
  0% {
    left: -300px;
  }
  100% {
    left: calc(100% + 100px);
  }
}

@keyframes bikeBounce {
  0% {
    transform: translateY(-10px) rotate(-2deg);
  }
  100% {
    transform: translateY(10px) rotate(2deg);
  }
}

@keyframes bikeGlow {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(0, 196, 212, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(0, 229, 255, 0.8));
  }
}

.speed-lines-horizontal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
  pointer-events: none;
  z-index: 1;
}

.speed-lines-horizontal span {
  display: block;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, rgba(0, 229, 255, 0.1), rgba(0, 229, 255, 0.4), rgba(0, 229, 255, 0.1));
  animation: speedLineHorizontal 0.8s linear infinite;
  border-radius: 2px;
}

.speed-lines-horizontal span:nth-child(2) { animation-delay: 0.1s; width: 20px; }
.speed-lines-horizontal span:nth-child(3) { animation-delay: 0.2s; width: 40px; }
.speed-lines-horizontal span:nth-child(4) { animation-delay: 0.3s; width: 25px; }
.speed-lines-horizontal span:nth-child(5) { animation-delay: 0.4s; width: 35px; }
.speed-lines-horizontal span:nth-child(6) { animation-delay: 0.5s; width: 20px; }
.speed-lines-horizontal span:nth-child(7) { animation-delay: 0.6s; width: 30px; }
.speed-lines-horizontal span:nth-child(8) { animation-delay: 0.7s; width: 40px; }
.speed-lines-horizontal span:nth-child(9) { animation-delay: 0.8s; width: 25px; }
.speed-lines-horizontal span:nth-child(10) { animation-delay: 0.9s; width: 35px; }

@keyframes speedLineHorizontal {
  0% {
    opacity: 0;
    transform: scaleX(0.3) translateX(-20px);
  }
  50% {
    opacity: 1;
    transform: scaleX(1) translateX(0);
  }
  100% {
    opacity: 0;
    transform: scaleX(0.3) translateX(20px);
  }
}

.motion-lines {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  transform: translateY(-50%);
}

.motion-lines span {
  position: absolute;
  top: 50%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.15), transparent);
  border-radius: 2px;
  animation: motionLine 1s linear infinite;
}

.motion-lines span:nth-child(1) {
  width: 60px;
  left: 10%;
  animation-delay: 0s;
  top: 30%;
}
.motion-lines span:nth-child(2) {
  width: 80px;
  left: 25%;
  animation-delay: 0.3s;
  top: 70%;
}
.motion-lines span:nth-child(3) {
  width: 50px;
  left: 50%;
  animation-delay: 0.6s;
  top: 25%;
}
.motion-lines span:nth-child(4) {
  width: 70px;
  left: 65%;
  animation-delay: 0.2s;
  top: 75%;
}
.motion-lines span:nth-child(5) {
  width: 90px;
  left: 80%;
  animation-delay: 0.5s;
  top: 40%;
}

@keyframes motionLine {
  0% {
    opacity: 0;
    transform: translateX(-50px) scaleX(0.5);
  }
  50% {
    opacity: 1;
    transform: translateX(0) scaleX(1);
  }
  100% {
    opacity: 0;
    transform: translateX(50px) scaleX(0.5);
  }
}

.vehicle-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 10px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  background: rgba(0, 196, 212, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(0, 229, 255, 0.05);
  transition: all 0.3s ease;
  cursor: default;
}

.type-item:hover {
  background: rgba(0, 196, 212, 0.08);
  border-color: rgba(0, 229, 255, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 196, 212, 0.05);
}

.type-icon {
  font-size: 2rem;
  color: #00C4D4;
  transition: all 0.3s ease;
}

.type-item:hover .type-icon {
  color: #00E5FF;
  transform: scale(1.1);
}

.type-name {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.slider-container::after {
  content: '';
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 60px;
  background: radial-gradient(ellipse, rgba(0, 229, 255, 0.05), transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}

@media (max-width: 768px) {
  .fleet-slider-section { padding: 60px 16px; }
  
  .car-track { 
    height: 90px;
    border-radius: 45px;
  }
  
  .vehicle-circle {
    width: 55px;
    height: 55px;
  }
  
  .bike-icon {
    font-size: 2.2rem;
  }
  
  .vehicle-name {
    font-size: 1.4rem;
  }
  
  .vehicle-types {
    gap: 12px;
    max-width: 400px;
  }
  
  .type-icon {
    font-size: 1.6rem;
  }
  
  .type-name {
    font-size: 0.7rem;
  }
  
  .type-item {
    padding: 16px 12px;
  }
  
  .speed-lines-horizontal span {
    width: 20px !important;
  }
}

@media (max-width: 480px) {
  .fleet-slider-section { padding: 40px 12px; }
  
  .car-track { 
    height: 70px;
    border-radius: 35px;
  }
  
  .vehicle-circle {
    width: 45px;
    height: 45px;
  }
  
  .bike-icon {
    font-size: 1.8rem;
  }
  
  .vehicle-name {
    font-size: 1rem;
  }
  
  .moving-vehicle {
    gap: 12px;
  }
  
  .vehicle-types {
    gap: 10px;
    max-width: 300px;
  }
  
  .type-item {
    padding: 12px 8px;
  }
  
  .type-icon {
    font-size: 1.4rem;
  }
  
  .type-name {
    font-size: 0.6rem;
  }
  
  .speed-lines-horizontal span {
    width: 15px !important;
    height: 1.5px;
  }
  
  .fleet-title {
    font-size: 1.3rem;
  }
}
</style>
