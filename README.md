# Portfólio Interestelar

Experiência 3D em Three.js para navegar por portais de projetos em um cenário de espaço sideral. Basta abrir `index.html` em um servidor estático e explorar com WASD + E.

## Estrutura
- `index.html`: ponto de entrada com overlays de HUD e painel de projetos.
- `styles/style.css`: estilo escuro para HUD e painel.
- `src/main.js`: cena 3D, player, estrelas, portais e controles.
- `src/projectsConfig.js`: lista de projetos editável.
- `src/ui.js`: lógica do painel HTML e mensagens de interação.

## Como rodar
Use qualquer servidor estático para abrir `index.html`, por exemplo:

```bash
npx serve .
```

Ou abra o arquivo diretamente em um navegador moderno que suporte módulos ES.
