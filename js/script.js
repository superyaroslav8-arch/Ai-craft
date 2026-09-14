let editor;

window.onload = function() {
  // 1. Инициализация Monaco Editor
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

  // 2. Обработчики событий чата
  const sendBtn = document.getElementById('send-btn');
  const chatInput = document.getElementById('chat-input');

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
  }
};

// Переключение темы
function changeTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  if (editor && typeof monaco !== 'undefined') {
    monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
  }
}

// Расположение панели (наверху / внизу)
function changeNavPosition(pos) {
  const app = document.getElementById('app');
  if (app) app.className = `app-container nav-${pos}`;
}

// Изменение акцентного цвета
function changeAccentColor(color) {
  document.documentElement.style.setProperty('--accent-color', color);
}

// Переключение модального окна настроек
function toggleSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
  }
}

// Отправка сообщений в Нейрочат
function sendMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  
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
  if (!container) return;
  
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

// ИИ Генерация и создание предпросмотра
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
