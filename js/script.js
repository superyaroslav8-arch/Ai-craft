let editor;

// Правильная инициализация Monaco Editor
window.onload = function() {
  if (typeof require !== 'undefined') {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {
      editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: "<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; text-align: center; margin-top: 50px; }\n  </style>\n</head>\n<body>\n  <h1>Мой новый сайт на Ai-Craft</h1>\n</body>\n</html>",
        language: 'html',
        theme: 'vs-dark',
        automaticLayout: true
      });
    });
  }

  // Навешиваем события для чата
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
  });
};

function changeTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  if (editor && typeof monaco !== 'undefined') {
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

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';

  setTimeout(() => {
    addMessage(`[Нейро]: Я получил ваш запрос "${text}". Напишите подробнее, какой блок или код сгенерировать!`, 'neuro');
  }, 600);
}

function addMessage(text, sender) {
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function generateSite() {
  if (!editor) return;
  const aiGeneratedCode = `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #111; color: #fff; font-family: sans-serif; text-align: center; padding: 50px; }\n    .btn { background: #238636; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }\n  </style>\n</head>\n<body>\n  <h1>Сгенерировано с помощью AI 🚀</h1>\n  <p>Ваш сайт полностью готов к работе.</p>\n  <button class="btn">Нажми меня</button>\n</body>\n</html>`;
  
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
