const form = document.getElementById('auth-form');
const identity = document.getElementById('identity');
const fullName = document.getElementById('full-name');
const password = document.getElementById('password');
const message = document.getElementById('form-message');
let mode = 'signin';

function showMessage(text, isError = true) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

function setMode(nextMode) {
  mode = nextMode;
  const isSignup = mode === 'signup';
  document.body.classList.toggle('signup-mode', isSignup);
  document.querySelectorAll('.auth-tab').forEach(tab => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active);
  });
  document.getElementById('form-eyebrow').textContent = isSignup ? 'START YOUR JOURNEY' : 'WELCOME BACK';
  document.getElementById('form-title').innerHTML = isSignup ? 'Build a routine that <em>sticks.</em>' : 'Make today <em>count.</em>';
  document.getElementById('form-subtext').textContent = isSignup ? 'Create your Dayflow account in a few seconds.' : 'Sign in to continue building your daily rhythm.';
  document.getElementById('identity-label').firstChild.textContent = isSignup ? 'Email address' : 'Username or email';
  identity.type = isSignup ? 'email' : 'text';
  identity.placeholder = isSignup ? 'you@example.com' : 'Your username or email';
  identity.autocomplete = isSignup ? 'email' : 'username';
  fullName.required = isSignup;
  password.autocomplete = isSignup ? 'new-password' : 'current-password';
  document.getElementById('submit-button').innerHTML = isSignup ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  showMessage('', false);
  form.reset();
}

function getAccounts() {
  return JSON.parse(localStorage.getItem('dayflow-accounts') || '[]');
}

function startSession(account) {
  localStorage.setItem('dayflow-user', JSON.stringify({ name: account.name, email: account.email, signedIn: true }));
  window.location.href = 'index.html';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const accounts = getAccounts();
  const enteredIdentity = identity.value.trim().toLowerCase();

  if (mode === 'signup') {
    const name = fullName.value.trim();
    const email = identity.value.trim().toLowerCase();
    if (!name) return showMessage('Please enter your full name.');
    if (accounts.some(account => account.email === email)) return showMessage('An account with this email already exists. Please sign in.');
    const account = { name, email, password: password.value };
    accounts.push(account);
    localStorage.setItem('dayflow-accounts', JSON.stringify(accounts));
    startSession(account);
    return;
  }

  const account = accounts.find(item => item.email === enteredIdentity || item.name.toLowerCase() === enteredIdentity);
  if (!account || account.password !== password.value) return showMessage('Incorrect username/email or password.');
  startSession(account);
});

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});
