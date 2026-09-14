let editor;

// Инициализация Monaco Editor (стиль VS Code)
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
  editor = monaco.editor.create(document.getElementById('editor-container'), {
    value: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; text-align: center; margin-top: 50px; }\n  </style>\n</head>\n<body>\n  <h1>Мой новый сайт на Ai-Craft</h1>\n</body>\n</html>",
    language: 'html',
    theme: 'vs-dark',
    automaticLayout: true
  });
});

// Настройки темы и интерфейса
function changeTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  if (editor) {
    monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  }
}

function changeNavPosition(pos) {
  const app = document.getElementById('app');
  app.className = `app-container nav-${pos}`;
}

function changeAccentColor(color) {
  document.documentElement.style.setProperty('--accent-color', color);
}

function toggleSettingsModal() {
  const modal = document.getElementById('settings-modal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

// Нейрочат
function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';

  setTimeout(() => {
    addMessage(`[Нейро]: Я получил ваш запрос "${text}". Готов помочь с разработкой или сгенерировать новый блок кода!`, 'neuro');
  }, 600);
}

function handleKeyPress(e) {
  if (e.key === 'Enter') sendMessage();
}

function addMessage(text, sender) {
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

// Генерация и создание временных ссылок
function generateSite() {
  if (!editor) return;
  const aiGeneratedCode = `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #111; color: #fff; font-family: sans-serif; text-align: center; padding: 50px; }\n    .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; }\n  </style>\n</head>\n<body>\n  <h1>Сгенерировано с помощью AI 🚀</h1>\n  <p>Ваш сайт полностью готов к работе.</p>\n  <button class="btn">Нажми меня</button>\n</body>\n</html>`;
  
  editor.setValue(aiGeneratedCode);
  addMessage("Нейро: Я сгенерировал новый шаблон сайта в редакторе!", "neuro");
}

function createPreviewLink() {
  if (!editor) return;
  const code = editor.getValue();
  const blob = new Blob([code], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
