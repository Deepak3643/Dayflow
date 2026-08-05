const score = document.getElementById('score-number');
const progressText = document.getElementById('progress-text');
const routineDialog = document.getElementById('routine-dialog');
const accountDialog = document.getElementById('account-dialog');
let selectedDate = new Date();

function toast(message) {
  const box = document.getElementById('toast');
  box.textContent = message;
  box.classList.add('visible');
  setTimeout(() => box.classList.remove('visible'), 2600);
}

function renderDate() {
  const weekday = selectedDate.toLocaleDateString(undefined, { weekday: 'long' });
  document.getElementById('today-label').textContent = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  document.getElementById('day-caption').textContent = `YOUR ${weekday.toUpperCase()}`;
}

function updateProgress() {
  const routines = [...document.querySelectorAll('.routine input')];
  const completed = routines.filter(item => item.checked).length;
  const percent = Math.round((completed / routines.length) * 100);
  score.textContent = percent;
  progressText.textContent = `${completed} of ${routines.length} complete`;
  document.querySelector('.score-ring').style.background = `conic-gradient(var(--green) ${percent}%, #c6d3c1 0)`;
}

function bindRoutine(input) {
  input.addEventListener('change', event => {
    event.currentTarget.closest('.routine').classList.toggle('done', event.currentTarget.checked);
    updateProgress();
  });
}

document.querySelectorAll('.routine input').forEach(bindRoutine);
document.getElementById('complete-all').addEventListener('click', () => {
  document.querySelectorAll('.routine input').forEach(input => { input.checked = true; input.closest('.routine').classList.add('done'); });
  updateProgress();
  toast('All routines complete — wonderful work!');
});

document.getElementById('add-routine').addEventListener('click', () => routineDialog.showModal());
routineDialog.addEventListener('close', () => {
  if (routineDialog.returnValue !== 'default') return;
  const name = document.getElementById('new-routine-name').value.trim();
  const time = document.getElementById('new-routine-time').value;
  if (!name) return;
  const item = document.createElement('label');
  item.className = 'routine';
  item.innerHTML = `<input type="checkbox"><span class="checkmark"></span><span class="routine-time">${time}</span><span class="routine-name"></span><span class="routine-tag focus">Focus</span>`;
  item.querySelector('.routine-name').textContent = name;
  bindRoutine(item.querySelector('input'));
  document.getElementById('routine-list').append(item);
  document.getElementById('new-routine-name').value = '';
  updateProgress();
  toast('Routine added to today.');
});

document.getElementById('set-focus').addEventListener('click', () => {
  const focus = prompt('What is your one focus for today?');
  if (focus) { document.querySelector('.focus-card p:last-child').textContent = focus; toast('Today’s focus saved.'); }
});

document.getElementById('previous-day').addEventListener('click', () => { selectedDate.setDate(selectedDate.getDate() - 1); renderDate(); });
document.getElementById('next-day').addEventListener('click', () => { selectedDate.setDate(selectedDate.getDate() + 1); renderDate(); });
renderDate();

const profileButton = document.getElementById('profile-button');
const profileMenu = document.getElementById('profile-menu');
profileButton.addEventListener('click', () => { const open = profileMenu.classList.toggle('open'); profileButton.setAttribute('aria-expanded', open); });
document.addEventListener('click', event => { if (!event.target.closest('.profile')) profileMenu.classList.remove('open'); });
profileMenu.addEventListener('click', event => {
  const action = event.target.dataset.action;
  if (!action) return;
  profileMenu.classList.remove('open');
  if (action === 'profile') accountDialog.showModal();
  else toast(action === 'settings' ? 'Settings are ready to customize next.' : 'You are signed out of this demo.');
});
document.getElementById('notification-button').addEventListener('click', () => toast('You are all caught up — great work!'));
accountDialog.addEventListener('close', () => {
  if (accountDialog.returnValue !== 'default') return;
  const name = document.getElementById('account-name').value.trim() || 'Deepak Kumar';
  document.querySelector('.profile-menu strong').textContent = name;
  profileButton.textContent = name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  toast('Profile saved.');
});

const habitKey = 'dayflow-habits-v2';
const savedHabits = JSON.parse(localStorage.getItem(habitKey) || '{}');
const todayKey = new Date().toISOString().slice(0, 10);
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayKey = yesterday.toISOString().slice(0, 10);

function normaliseHabits() {
  document.querySelectorAll('.habit').forEach(habit => {
    const name = habit.dataset.habit;
    const data = savedHabits[name];
    if (!data) return;
    if (data.lastCheckIn === todayKey) data.checked = true;
    else if (data.lastCheckIn === yesterdayKey) data.checked = false;
    else { data.streak = 0; data.checked = false; }
  });
  localStorage.setItem(habitKey, JSON.stringify(savedHabits));
}
normaliseHabits();
function renderHabit(habit) {
  const data = savedHabits[habit.dataset.habit];
  const streak = data?.streak ?? 0;
  const checked = data?.checked ?? false;
  habit.classList.toggle('checked', checked);
  habit.querySelector('small strong').textContent = streak;
  habit.querySelector('.habit-status').textContent = checked ? 'Checked in today' : 'Check in';
  habit.querySelector('.mini-progress i').style.width = `${Math.min(100, 28 + streak * 3)}%`;
}
document.querySelectorAll('.habit').forEach(habit => {
  renderHabit(habit);
  habit.addEventListener('click', () => {
    const name = habit.dataset.habit;
    const current = savedHabits[name] || { streak: 0, checked: false, lastCheckIn: null };
    if (current.checked) return toast(`${name} is already checked in today.`);
    current.checked = true; current.streak++; current.lastCheckIn = todayKey;
    savedHabits[name] = current;
    localStorage.setItem(habitKey, JSON.stringify(savedHabits));
    renderHabit(habit);
    toast(`${name}: ${current.streak}-day streak!`);
  });
});
document.getElementById('reset-habits').addEventListener('click', () => {
  Object.keys(savedHabits).forEach(name => { savedHabits[name].checked = false; savedHabits[name].streak = 0; savedHabits[name].lastCheckIn = null; });
  localStorage.setItem(habitKey, JSON.stringify(savedHabits));
  document.querySelectorAll('.habit').forEach(renderHabit);
  toast('Habit check-ins reset for today.');
});

const activity = [
  { steps: 5240, minutes: 29, kcal: 1870 }, { steps: 6980, minutes: 37, kcal: 2015 },
  { steps: 6105, minutes: 31, kcal: 1940 }, { steps: 7842, minutes: 42, kcal: 2180 },
  { steps: 5820, minutes: 26, kcal: 1905 }, { steps: 7210, minutes: 39, kcal: 2090 }, { steps: 4380, minutes: 21, kcal: 1760 }
];
const bars = [...document.querySelectorAll('.bars i')];
const days = [...document.querySelectorAll('.week span')];
function selectActivity(index) {
  bars.forEach((bar, i) => bar.classList.toggle('today', i === index));
  days.forEach((day, i) => day.classList.toggle('selected', i === index));
  const item = activity[index];
  document.querySelector('.activity-summary').innerHTML = `<span><b>${item.steps.toLocaleString()}</b> steps</span><span><b>${item.minutes}</b> active mins</span><span><b>${item.kcal.toLocaleString()}</b> kcal</span>`;
}
bars.forEach((bar, index) => bar.addEventListener('click', () => selectActivity(index)));
days.forEach((day, index) => day.addEventListener('click', () => selectActivity(index)));
document.querySelector('.more').addEventListener('click', () => {
  const value = prompt('Update today’s step count:', activity[3].steps);
  if (value === null) return;
  const steps = Number(value.replace(/[^0-9]/g, ''));
  if (!steps) return toast('Please enter a valid step count.');
  activity[3] = { steps, minutes: Math.round(steps / 185), kcal: Math.round(1600 + steps / 13) };
  bars[3].style.setProperty('--h', `${Math.min(100, Math.max(12, Math.round(steps / 100)))}%`);
  selectActivity(3);
  toast('Today’s activity has been updated.');
});
