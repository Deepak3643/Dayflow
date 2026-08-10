const score = document.getElementById('score-number');
const progressText = document.getElementById('progress-text');
const routineDialog = document.getElementById('routine-dialog');
const accountDialog = document.getElementById('account-dialog');
let selectedDate = new Date();
let user = JSON.parse(localStorage.getItem('dayflow-user') || 'null');
let routineBeingEdited = null;
let selectedRoutineCategory = '';
let routineCategoryTouched = false;

if (!user?.signedIn) window.location.replace('login.html');

function setAvatar(name, photo = user?.photo) {
  const button = document.getElementById('profile-button');
  button.replaceChildren();
  if (photo) {
    const image = document.createElement('img');
    image.src = photo;
    image.alt = `${name}'s profile picture`;
    button.append(image);
  } else button.textContent = name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
}

if (user) {
  document.querySelector('.profile-menu strong').textContent = user.name;
  document.querySelector('.profile-menu span').textContent = user.email;
  document.getElementById('account-name').value = user.name;
  document.getElementById('account-email').value = user.email;
  setAvatar(user.name);
}

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
  const percent = routines.length ? Math.round((completed / routines.length) * 100) : 0;
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

function addRoutineMenu(routine) {
  if (routine.querySelector('.routine-actions')) return;
  const actions = document.createElement('span');
  actions.className = 'routine-actions';
  actions.innerHTML = `<button class="routine-more" type="button" aria-label="Routine options" aria-haspopup="true" aria-expanded="false">•••</button><span class="routine-menu"><button type="button" data-routine-action="edit">Edit</button><button type="button" data-routine-action="delete">Delete</button></span>`;
  routine.append(actions);
}

function setupRoutine(routine) {
  bindRoutine(routine.querySelector('input'));
  addRoutineMenu(routine);
}

function setRoutineCategory(category = '', touched = false) {
  if (touched) routineCategoryTouched = true;
  selectedRoutineCategory = category;
  document.querySelectorAll('.category-options button').forEach(button => button.classList.toggle('selected', button.dataset.category === category));
}

document.querySelectorAll('.routine').forEach(setupRoutine);
document.getElementById('complete-all').addEventListener('click', () => {
  document.querySelectorAll('.routine input').forEach(input => { input.checked = true; input.closest('.routine').classList.add('done'); });
  updateProgress();
  toast('All routines complete — wonderful work!');
});

document.getElementById('add-routine').addEventListener('click', () => {
  routineBeingEdited = null;
  routineCategoryTouched = false;
  setRoutineCategory();
  document.querySelector('#routine-dialog .eyebrow').textContent = 'NEW ROUTINE';
  document.querySelector('#routine-dialog h2').textContent = 'Add a mindful moment';
  document.querySelector('#routine-dialog .save-routine').textContent = 'Add to today';
  routineDialog.showModal();
});
document.getElementById('close-routine-dialog').addEventListener('click', () => {
  routineBeingEdited = null;
  routineDialog.close('cancel');
});
document.querySelector('.category-options').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  setRoutineCategory(selectedRoutineCategory === button.dataset.category ? '' : button.dataset.category, true);
});
routineDialog.addEventListener('close', () => {
  if (routineDialog.returnValue !== 'default') return;
  const name = document.getElementById('new-routine-name').value.trim();
  const time = document.getElementById('new-routine-time').value;
  if (!name) return;
  if (routineBeingEdited) {
    routineBeingEdited.querySelector('.routine-name').textContent = name;
    routineBeingEdited.querySelector('.routine-time').textContent = time;
    const existingTag = routineBeingEdited.querySelector('.routine-tag');
    if (routineCategoryTouched) {
      if (selectedRoutineCategory) {
        if (existingTag) existingTag.textContent = selectedRoutineCategory;
        else {
          const tag = document.createElement('span');
          tag.className = 'routine-tag focus';
          tag.textContent = selectedRoutineCategory;
          routineBeingEdited.querySelector('.routine-actions').before(tag);
        }
      } else existingTag?.remove();
    }
    routineBeingEdited = null;
    toast('Routine updated.');
    return;
  }
  const item = document.createElement('label');
  item.className = 'routine';
  item.innerHTML = `<input type="checkbox"><span class="checkmark"></span><span class="routine-time">${time}</span><span class="routine-name"></span>`;
  item.querySelector('.routine-name').textContent = name;
  if (selectedRoutineCategory) {
    const tag = document.createElement('span');
    tag.className = 'routine-tag focus';
    tag.textContent = selectedRoutineCategory;
    item.append(tag);
  }
  setupRoutine(item);
  document.getElementById('routine-list').append(item);
  document.getElementById('new-routine-name').value = '';
  setRoutineCategory();
  updateProgress();
  toast('Routine added to today.');
});

document.getElementById('routine-list').addEventListener('click', event => {
  const button = event.target.closest('.routine-more, [data-routine-action]');
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const routine = button.closest('.routine');
  const actions = routine.querySelector('.routine-actions');
  if (button.classList.contains('routine-more')) {
    const isOpen = actions.classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen);
    document.querySelectorAll('.routine-actions.open').forEach(item => {
      if (item !== actions) { item.classList.remove('open'); item.querySelector('.routine-more').setAttribute('aria-expanded', 'false'); }
    });
    return;
  }
  if (button.dataset.routineAction === 'delete') {
    routine.remove();
    updateProgress();
    toast('Routine deleted.');
    return;
  }
  routineBeingEdited = routine;
  routineCategoryTouched = false;
  document.getElementById('new-routine-name').value = routine.querySelector('.routine-name').textContent;
  document.getElementById('new-routine-time').value = routine.querySelector('.routine-time').textContent;
  setRoutineCategory(routine.querySelector('.routine-tag')?.textContent || '');
  document.querySelector('#routine-dialog .eyebrow').textContent = 'EDIT ROUTINE';
  document.querySelector('#routine-dialog h2').textContent = 'Update your routine';
  document.querySelector('#routine-dialog .save-routine').textContent = 'Save changes';
  routineDialog.showModal();
});

document.addEventListener('click', event => {
  if (!event.target.closest('.routine-actions')) document.querySelectorAll('.routine-actions.open').forEach(item => item.classList.remove('open'));
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
  else if (action === 'settings') toast('Settings are ready to customize next.');
  else { localStorage.removeItem('dayflow-user'); window.location.href = 'login.html'; }
});
document.getElementById('notification-button').addEventListener('click', () => toast('You are all caught up — great work!'));
accountDialog.addEventListener('close', () => {
  if (accountDialog.returnValue !== 'default') return;
  const name = document.getElementById('account-name').value.trim() || 'Deepak Kumar';
  const email = document.getElementById('account-email').value.trim();
  const photo = document.getElementById('account-photo').files[0];
  document.querySelector('.profile-menu strong').textContent = name;
  document.querySelector('.profile-menu span').textContent = email;
  user = { ...user, name, email, signedIn: true };
  if (photo) {
    const reader = new FileReader();
    reader.addEventListener('load', () => { user.photo = reader.result; localStorage.setItem('dayflow-user', JSON.stringify(user)); setAvatar(name); toast('Profile and picture saved.'); });
    reader.readAsDataURL(photo);
  } else { localStorage.setItem('dayflow-user', JSON.stringify(user)); setAvatar(name); toast('Profile saved.'); }
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
