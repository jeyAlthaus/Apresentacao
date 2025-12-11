// Funções auxiliares para controlar a interface HTML do portfólio 3D
const panel = document.getElementById('project-panel');
const titleEl = document.getElementById('project-title');
const descriptionEl = document.getElementById('project-description');
const tagsEl = document.getElementById('project-tags');
const openLinkBtn = document.getElementById('open-link');
const closeBtn = document.getElementById('close-panel');
const interactionHint = document.getElementById('interaction-hint');

let currentProject = null;
let onCloseCallback = null;

// Inicializa listeners da UI
export function initUI(closeCallback) {
  onCloseCallback = closeCallback;

  closeBtn.addEventListener('click', hideProject);
  openLinkBtn.addEventListener('click', () => {
    if (currentProject) window.open(currentProject.url, '_blank');
  });

  // Fecha com ESC
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideProject();
  });
}

// Mostra painel preenchendo os dados do projeto selecionado
export function showProject(project) {
  currentProject = project;
  titleEl.textContent = project.title;
  descriptionEl.textContent = project.description;

  // Monta tags/tecnologias
  tagsEl.innerHTML = '';
  project.tags.forEach((tag) => {
    const tagEl = document.createElement('span');
    tagEl.textContent = tag;
    tagsEl.appendChild(tagEl);
  });

  panel.classList.remove('hidden');
}

// Esconde painel e informa que o player pode voltar a se mover
export function hideProject() {
  panel.classList.add('hidden');
  currentProject = null;
  if (onCloseCallback) onCloseCallback();
}

// Atualiza o HUD de interação com a mensagem adequada
export function updateInteractionHint(message) {
  if (message) {
    interactionHint.textContent = message;
    interactionHint.classList.remove('hidden');
  } else {
    interactionHint.classList.add('hidden');
  }
}
