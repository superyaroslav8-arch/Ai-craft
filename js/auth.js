document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});

function checkAuthStatus() {
  const currentUser = localStorage.getItem('ai_craft_user');
  const authModal = document.getElementById('auth-modal');
  const userProfile = document.getElementById('user-profile');
  const usernameDisplay = document.getElementById('username-display');

  if (currentUser) {
    if (authModal) authModal.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    if (usernameDisplay) usernameDisplay.textContent = currentUser;
  } else {
    if (authModal) authModal.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
  }
}

function handleAuth(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('auth-username').value.trim();
  
  if (usernameInput) {
    localStorage.setItem('ai_craft_user', usernameInput);
    checkAuthStatus();
  }
}

function logout() {
  localStorage.removeItem('ai_craft_user');
  checkAuthStatus();
}
