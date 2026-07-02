<!-- Hero3D.vue - Placeholder -->
<template>
  <div class="hero-3d-container">
    <div class="hero-3d">
      <div class="orb"></div>
      <div class="orb orb2"></div>
      <div class="orb orb3"></div>
    </div>
  </div>
</template>

<style scoped>
.hero-3d-container {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.hero-3d {
  position: absolute;
  top: 50%;
  right: -10%;
  transform: translateY(-50%);
  width: 600px;
  height: 600px;
}
.orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,196,212,0.08) 0%, transparent 70%);
}
.orb { width: 400px; height: 400px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
.orb2 { width: 300px; height: 300px; top: 20%; right: 20%; animation: float 8s ease-in-out infinite; }
.orb3 { width: 200px; height: 200px; bottom: 20%; right: 40%; animation: float 6s ease-in-out infinite reverse; }
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 20px); }
}
@media (max-width: 768px) { .hero-3d { width: 300px; height: 300px; right: -30%; } }
</style>