// Cena principal em Three.js com personagem, estrelas e portais de projetos
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
import { projects } from './projectsConfig.js';
import { initUI, showProject, hideProject, updateInteractionHint } from './ui.js';

// Variáveis principais de Three.js
let scene, camera, renderer;
let player;
let portals = [];
let activePortal = null;
let canMove = true;
const keysPressed = {};

const clock = new THREE.Clock();

// Configurações gerais
const bounds = 25; // limita a movimentação em x/z
const interactDistance = 3;

init();

// Inicializa cena, player e eventos básicos
function init() {
  createScene();
  createLights();
  createStars();
  createPlayer();
  createPortals();
  initUI(() => (canMove = true));

  // Eventos de teclado
  window.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
  });

  window.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
  });

  window.addEventListener('resize', onWindowResize);

  animate();
}

// Cria cena, câmera e renderer em tela cheia
function createScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000010);

  document.body.appendChild(renderer.domElement);
}

// Luzes básicas para clima espacial
function createLights() {
  const ambient = new THREE.AmbientLight(0x335577, 0.35);
  scene.add(ambient);

  const colors = [0x4facfe, 0x00f5d4, 0xff6fd8];
  colors.forEach((color, idx) => {
    const light = new THREE.PointLight(color, 1.5, 80);
    light.position.set(20 * Math.cos(idx * 2), 10 + idx * 4, 20 * Math.sin(idx * 2));
    scene.add(light);
  });
}

// Gera partículas de estrelas e constelações leves
function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1200;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Distribui em casca esférica
    const radius = THREE.MathUtils.randFloat(120, 300);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = THREE.MathUtils.randFloat(0, Math.PI);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Cores variadas
    const color = new THREE.Color();
    color.setHSL(THREE.MathUtils.randFloat(0.55, 0.75), 0.7, 0.8);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 1.4,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

// Monta personagem "ser interestelar" com primitivas simples
function createPlayer() {
  player = new THREE.Group();

  const emissiveMaterial = new THREE.MeshStandardMaterial({
    color: 0x7ef6ff,
    emissive: 0x7ef6ff,
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.3,
    transparent: true,
    opacity: 0.9
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.6, 6, 12), emissiveMaterial);
  body.position.y = 1.2;
  player.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 16), emissiveMaterial);
  head.position.y = 2.5;
  player.add(head);

  player.position.set(0, 0, 8);
  scene.add(player);

  // Câmera em terceira pessoa seguindo o player
  camera.position.set(0, 2, 6);
  player.add(camera);
}

// Cria portais a partir da configuração de projetos
function createPortals() {
  const portalGroup = new THREE.Group();

  projects.forEach((project) => {
    const portal = new THREE.Group();
    portal.position.set(project.position.x, project.position.y, project.position.z);
    portal.userData.projectId = project.id;

    // Moldura do portal
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: project.color,
      emissive: project.color,
      emissiveIntensity: 0.4,
      metalness: 0.1,
      roughness: 0.35
    });

    const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 0.3), frameMaterial);
    const frameInner = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.2, 0.35), new THREE.MeshBasicMaterial({ color: 0x000010 }));
    frameInner.position.z = -0.02;

    // Miolo emissivo
    const portalCore = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 4),
      new THREE.MeshStandardMaterial({
        color: project.color,
        emissive: project.color,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      })
    );

    portalCore.position.z = -0.16;

    portal.add(frameOuter);
    portal.add(frameInner);
    portal.add(portalCore);

    portalGroup.add(portal);
    portals.push(portal);
  });

  scene.add(portalGroup);
}

// Atualiza dimensão do viewport
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Aplica movimentação do player com base nas teclas pressionadas
function updatePlayer(delta) {
  if (!canMove) return;

  const speed = 6;
  const rotationSpeed = 2;

  if (keysPressed['a']) {
    player.rotation.y += rotationSpeed * delta;
  }
  if (keysPressed['d']) {
    player.rotation.y -= rotationSpeed * delta;
  }

  const direction = new THREE.Vector3();
  player.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();

  if (keysPressed['w']) {
    player.position.addScaledVector(direction, speed * delta);
  }
  if (keysPressed['s']) {
    player.position.addScaledVector(direction, -speed * delta);
  }

  // Limita área de navegação
  player.position.x = THREE.MathUtils.clamp(player.position.x, -bounds, bounds);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -bounds, bounds);
}

// Detecta porta próxima e atualiza feedback de HUD
function detectActivePortal() {
  let nearest = null;
  let nearestDistance = Infinity;

  portals.forEach((portal) => {
    const distance = portal.position.distanceTo(player.position);
    if (distance < nearestDistance && distance < interactDistance) {
      nearestDistance = distance;
      nearest = portal;
    }
    // Reset de escala para caso não esteja ativa
    portal.scale.set(1, 1, 1);
  });

  activePortal = nearest;

  if (activePortal) {
    activePortal.scale.set(1.05, 1.05, 1.05);
    updateInteractionHint('Pressione E para abrir o projeto');
  } else {
    updateInteractionHint(null);
  }
}

// Animação sutil dos portais para parecerem vivos
function animatePortals(delta) {
  portals.forEach((portal, index) => {
    const float = Math.sin(clock.elapsedTime + index) * 0.05;
    portal.position.y = float;
    portal.rotation.y += delta * 0.2;
  });
}

// Loop de animação principal
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  updatePlayer(delta);
  animatePortals(delta);
  detectActivePortal();

  renderer.render(scene, camera);
}

// Listener para interação com portais
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'e' && activePortal && canMove) {
    const project = projects.find((p) => p.id === activePortal.userData.projectId);
    if (project) {
      canMove = false;
      showProject(project);
    }
  }
});

// Se painel fechar por ESC ou botão, permitir movimentação novamente
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    canMove = true;
  }
});

