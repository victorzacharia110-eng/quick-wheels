<template>
  <div class="about-page">
    <div class="page-header">
      <h1 class="page-title">About <span class="gradient-text">Quick-Wheels</span></h1>
      <p class="page-sub">Your trusted partner for vehicle rentals in Tanzania</p>
    </div>

    <div class="about-content">
      <div class="about-section">
        <h2>Our Mission</h2>
        <p>To provide affordable and reliable vehicle rental solutions for individuals and businesses across Tanzania, empowering mobility and economic growth.</p>
      </div>

      <div class="about-section">
        <h2>Our Vision</h2>
        <p>To become the leading vehicle rental and hire purchase provider in East Africa, recognized for quality service and customer satisfaction.</p>
      </div>

      <div class="about-grid">
        <div class="about-card glass-card">
          <font-awesome-icon icon="fa-solid fa-motorcycle" size="2x" />
          <h3>Motorcycles</h3>
          <p>Affordable daily and weekly rentals for personal and business use.</p>
        </div>
        <div class="about-card glass-card">
          <font-awesome-icon icon="fa-solid fa-truck-front" size="2x" />
          <h3>Bajajis</h3>
          <p>Perfect for urban transport, deliveries, and small cargo.</p>
        </div>
        <div class="about-card glass-card">
          <font-awesome-icon icon="fa-solid fa-car" size="2x" />
          <h3>Cars</h3>
          <p>From economy to luxury, we have the right car for every journey.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page { min-height: 100vh; padding: 80px 32px; }
.page-header { text-align: center; margin-bottom: 48px; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 1.1rem; }

.about-content { max-width: 800px; margin: 0 auto; }
.about-section { margin-bottom: 32px; }
.about-section h2 {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #00E5FF;
  margin-bottom: 12px;
}
.about-section p { color: rgba(255,255,255,0.6); line-height: 1.8; }

.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
}
.about-card {
  text-align: center;
  padding: 32px 24px;
}
.about-card svg { color: #00C4D4; margin-bottom: 12px; }
.about-card h3 { color: #fff; font-size: 1.1rem; margin-bottom: 8px; }
.about-card p { color: rgba(255,255,255,0.4); font-size: 0.9rem; line-height: 1.6; }

@media (max-width: 768px) {
  .about-grid { grid-template-columns: 1fr; }
  .about-page { padding: 60px 20px; }
}
</style>