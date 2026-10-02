lucide.createIcons();
document.getElementById('year').textContent = new Date().getFullYear();

// Loading screen
window.addEventListener('load', () => {
  const loader = document.querySelector('.loading');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 500);
  }
});

// Mobile menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// Scroll reveal
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '-50px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Active nav link on scroll
const sections = document.querySelectorAll('.section');
const navLinkItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 200) {
      current = section.getAttribute('id');
    }
  });
  navLinkItems.forEach((link) => {
    link.style.color = link.getAttribute('href') === `#${current}` ? '#00ff41' : '';
  });
}, { passive: true });

// Contact form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="check"></i> Envoyé !';
    btn.style.background = 'var(--neon-green)';
    btn.style.color = 'var(--bg)';
    lucide.createIcons();

    setTimeout(() => {
      contactForm.reset();
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.style.color = '';
      lucide.createIcons();
    }, 3000);
  });
}

// =============================================
// Three.js — Optimized Particle Neural Network
// =============================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const PARTICLE_COUNT = 250;
const CONNECT_DISTANCE = 1.8;
let frameCount = 0;
const positions = new Float32Array(PARTICLE_COUNT * 3);
const velocities = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 14;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  velocities.push({
    x: (Math.random() - 0.5) * 0.004,
    y: (Math.random() - 0.5) * 0.004,
    z: (Math.random() - 0.5) * 0.003,
  });
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0x00ff41,
  size: 0.05,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const particles = new THREE.Points(geometry, particleMaterial);
scene.add(particles);

// Line connections
const maxConnections = PARTICLE_COUNT * PARTICLE_COUNT;
const linePositions = new Float32Array(maxConnections * 6);
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x00ff41,
  transparent: true,
  opacity: 0.1,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

// Mouse & scroll state
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let scrollY = 0;

document.addEventListener('mousemove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
}, { passive: true });

function updateConnections() {
  const pos = geometry.attributes.position.array;
  const lp = lineGeometry.attributes.position.array;
  let idx = 0;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < CONNECT_DISTANCE * CONNECT_DISTANCE) {
        lp[idx++] = pos[i * 3];
        lp[idx++] = pos[i * 3 + 1];
        lp[idx++] = pos[i * 3 + 2];
        lp[idx++] = pos[j * 3];
        lp[idx++] = pos[j * 3 + 1];
        lp[idx++] = pos[j * 3 + 2];
      }
    }
  }

  lineGeometry.setDrawRange(0, idx / 3);
  lineGeometry.attributes.position.needsUpdate = true;
}

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);

  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  const scrollFactor = scrollY * 0.0003;
  camera.position.z = 5 + scrollFactor * 3;
  camera.position.x = mouse.x * 0.8;
  camera.position.y = -mouse.y * 0.5;
  camera.lookAt(0, 0, 0);

  const pos = geometry.attributes.position.array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3] += velocities[i].x + mouse.x * 0.0008;
    pos[i * 3 + 1] += velocities[i].y + mouse.y * 0.0008;
    pos[i * 3 + 2] += velocities[i].z;

    for (let axis = 0; axis < 3; axis++) {
      const limit = axis === 2 ? 6 : 8;
      const idx = i * 3 + axis;
      if (Math.abs(pos[idx]) > limit) velocities[i][['x', 'y', 'z'][axis]] *= -1;
    }
  }

  geometry.attributes.position.needsUpdate = true;
  particles.rotation.y += 0.0004;
  particles.rotation.x += 0.0002;

  if (frameCount++ % 3 === 0) updateConnections();
  renderer.render(scene, camera);
}

animate();

// Visibility API - pause when tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationId);
  } else {
    animate();
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
