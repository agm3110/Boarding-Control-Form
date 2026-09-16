const employeeStorageKey = 'employee-evaluation-dashboard-employee-flow';
const homeView = document.querySelector('#homeView');
const listView = document.querySelector('#employeeListView');
const createView = document.querySelector('#employeeCreateView');
const detailView = document.querySelector('#employeeDetailView');
const navButtons = document.querySelectorAll('[data-view]');
const employeeList = document.querySelector('#employeeList');
const employeeCount = document.querySelector('#employeeCount');
const saveState = document.querySelector('#saveState');
const detailAvatar = document.querySelector('#detailAvatar');
const detailName = document.querySelector('#detailName');
const detailPosition = document.querySelector('#detailPosition');
const detailMeta = document.querySelector('#detailMeta');
const historyList = document.querySelector('#historyList');
const historyCount = document.querySelector('#historyCount');
const warningCount = document.querySelector('#warningCount');
const lateCount = document.querySelector('#lateCount');
const sickDaysCount = document.querySelector('#sickDaysCount');
const evaluationAverage = document.querySelector('#evaluationAverage');
const newEmployeeForm = document.querySelector('#newEmployeeForm');
const newProfilePicture = document.querySelector('#newProfilePicture');
const newPicturePreview = document.querySelector('#newPicturePreview');
const historyModal = document.querySelector('#historyModal');
const historyForm = document.querySelector('#historyForm');
const addHistoryButton = document.querySelector('#addHistoryButton');
const recordDetailsModal = document.querySelector('#recordDetailsModal');
const recordDetailsTitle = document.querySelector('#recordDetailsTitle');
const recordDetailsMeta = document.querySelector('#recordDetailsMeta');
const recordDetailsBody = document.querySelector('#recordDetailsBody');
const evaluationFields = document.querySelector('#evaluationFields');
const historyType = document.querySelector('#historyType');
const sicknessDaysField = document.querySelector('#sicknessDaysField');
const sicknessDays = document.querySelector('#sicknessDays');
const historySummary = document.querySelector('#historySummary');
const historyDetails = document.querySelector('#historyDetails');
let currentEmployeeId = null;
let newPictureData = '';

function readEmployees() {
  try {
    const saved = JSON.parse(localStorage.getItem(employeeStorageKey)) || [];
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function writeEmployees(employees) {
  localStorage.setItem(employeeStorageKey, JSON.stringify(employees));
}

function getInitials(firstName, lastName) {
  const first = (firstName || '').trim().charAt(0).toUpperCase();
  const last = (lastName || '').trim().charAt(0).toUpperCase();
  return first || last || 'E';
}

function setView(viewName) {
  const views = {
    home: homeView,
    list: listView,
    create: createView,
    profile: detailView
  };

  Object.entries(views).forEach(([name, view]) => {
    view.classList.toggle('active', name === viewName);
  });

  navButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });
}

function renderEmployeeList() {
  const employees = readEmployees();
  employeeCount.textContent = `${employees.length} saved`;
  employeeList.innerHTML = '';

  if (!employees.length) {
    employeeList.innerHTML = '<p class="empty-state">No employees created yet.</p>';
    return;
  }

  employees.forEach(employee => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'employee-card';
    card.addEventListener('click', () => openEmployeeDetail(employee.id));

    const historyRecords = employee.history || [];
    const alertCount = historyRecords.filter(entry => entry.type.includes('warning')).length;

    card.innerHTML = `
      <div class="employee-card-main">
        <div class="employee-avatar">${getInitials(employee.firstName, employee.lastName)}</div>
        <div class="employee-card-info">
          <strong>${employee.firstName} ${employee.lastName}</strong>
          <span>${employee.position || 'Position not provided'}</span>
          <small>${employee.employeeId || 'No employee ID'}</small>
        </div>
      </div>
      <div class="employee-pill">${alertCount} alert${alertCount === 1 ? '' : 's'}</div>
    `;

    employeeList.append(card);
  });
}

function getCurrentEmployee() {
  const employees = readEmployees();
  return employees.find(employee => employee.id === currentEmployeeId) || null;
}

function getRecordPresentation(type) {
  const presentations = {
    Evaluation: { className: 'record-evaluation', icon: '&#9733;' },
    'Meeting with employee': { className: 'record-meeting', icon: '&#128172;' },
    Sickness: { className: 'record-sickness', icon: '&#10010;' },
    'Verbal warning': { className: 'record-verbal-warning', icon: '&#9888;' },
    'Written warning': { className: 'record-written-warning', icon: '&#9888;' },
    Mistake: { className: 'record-mistake', icon: '&#10006;' },
    'Problems with colleagues': { className: 'record-colleagues', icon: '&#8646;' },
    'Personal problems at work': { className: 'record-personal', icon: '&#9673;' },
    'Arrived late': { className: 'record-late', icon: '&#8987;' },
    'Left before work was finished': { className: 'record-early-leave', icon: '&#8599;' }
  };

  return presentations[type] || { className: 'record-default', icon: '&#8226;' };
}

function renderEmployeeDetail() {
  const employee = getCurrentEmployee();
  if (!employee) {
    setView('list');
    return;
  }

  const history = employee.history || [];
  const warningTotal = history.filter(record => /warning/i.test(record.type)).length;
  const lateTotal = history.filter(record => record.type === 'Arrived late').length;
  const currentYear = String(new Date().getFullYear());
  const sickDaysTotal = history
    .filter(record => record.type === 'Sickness' && record.date?.slice(0, 4) === currentYear)
    .reduce((total, record) => total + Number(record.sickDays || 0), 0);
  const evaluationScores = history
    .filter(record => record.type === 'Evaluation' && record.evaluation?.overallScore)
    .map(record => Number(record.evaluation.overallScore))
    .filter(score => Number.isFinite(score));
  const averageEvaluation = evaluationScores.length
    ? (evaluationScores.reduce((total, score) => total + score, 0) / evaluationScores.length).toFixed(1)
    : '-';

  detailAvatar.textContent = getInitials(employee.firstName, employee.lastName);
  detailName.textContent = `${employee.firstName} ${employee.lastName}`;
  detailPosition.textContent = employee.position || 'Position not provided';
  historyCount.textContent = String(history.length);
  warningCount.textContent = String(warningTotal);
  lateCount.textContent = String(lateTotal);
  sickDaysCount.textContent = String(sickDaysTotal);
  evaluationAverage.textContent = averageEvaluation;

  detailMeta.innerHTML = `
    <div class="meta-item"><span>Employee ID</span><strong>${employee.employeeId || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Position</span><strong>${employee.position || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Work email</span><strong>${employee.email || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Work phone</span><strong>${employee.phone || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Date of commencement</span><strong>${employee.startDate || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Profile status</span><strong>${history.length ? 'History available' : 'No records yet'}</strong></div>
  `;

  if (!history.length) {
    historyList.innerHTML = '<p class="empty-state">No employee history yet. Add the first record to begin.</p>';
    return;
  }

  historyList.innerHTML = history.map(record => {
    const presentation = getRecordPresentation(record.type);
    const warningClass = /warning/i.test(record.type) ? 'warning' : '';
    return `
      <article class="history-item ${presentation.className} ${warningClass}" role="button" tabindex="0" data-record-id="${record.id}">
        <div class="history-item-header">
          <div class="history-type-group">
            <span class="record-icon" aria-hidden="true">${presentation.icon}</span>
            <span class="history-type">${record.type}</span>
          </div>
          <span class="history-date">${record.date}</span>
        </div>
        <p class="history-summary">${record.summary}</p>
      </article>
    `;
  }).join('');
}

function closeRecordDetails() {
  recordDetailsModal.classList.add('hidden');
}

function openRecordDetails(recordId) {
  const employee = getCurrentEmployee();
  const record = employee?.history?.find(item => item.id === recordId);
  if (!record) return;

  recordDetailsModal.classList.remove('hidden');
  recordDetailsTitle.textContent = record.type;
  recordDetailsMeta.innerHTML = `
    <div class="meta-item"><span>Type of record</span><strong>${record.type}</strong></div>
    <div class="meta-item"><span>Date</span><strong>${record.date}</strong></div>
    <div class="meta-item"><span>Short summary</span><strong>${record.summary}</strong></div>
  `;
  recordDetailsBody.textContent = record.details || 'No additional details provided.';
}

function openEmployeeDetail(employeeId) {
  currentEmployeeId = employeeId;
  setView('profile');
  renderEmployeeDetail();
  saveState.textContent = 'Employee profile open';
}

function updateHistoryTypeFields() {
  const isEvaluation = historyType.value === 'Evaluation';
  const isSickness = historyType.value === 'Sickness';
  evaluationFields.hidden = !isEvaluation;
  sicknessDaysField.hidden = !isSickness;
  sicknessDays.required = isSickness;
  historySummary.required = !isEvaluation;
  historyDetails.required = !isEvaluation;
  evaluationFields.querySelectorAll('select, textarea').forEach(field => {
    field.required = isEvaluation;
  });
}

function closeHistoryModal() {
  historyModal.classList.add('hidden');
  historyForm.reset();
  document.querySelector('#historyDate').value = new Date().toISOString().split('T')[0];
  updateHistoryTypeFields();
}

function openHistoryModal() {
  if (!currentEmployeeId) return;
  historyModal.classList.remove('hidden');
  document.querySelector('#historyDate').value = new Date().toISOString().split('T')[0];
  updateHistoryTypeFields();
  document.querySelector('#historyType').focus();
}

newEmployeeForm.addEventListener('submit', event => {
  event.preventDefault();

  const firstName = document.querySelector('#newFirstName').value.trim();
  const lastName = document.querySelector('#newLastName').value.trim();
  const employeeId = document.querySelector('#newEmployeeId').value.trim();
  const position = document.querySelector('#newPositionTitle').value.trim();
  const email = document.querySelector('#newWorkEmail').value.trim();
  const phone = document.querySelector('#newWorkPhone').value.trim();
  const startDate = document.querySelector('#newCommencementDate').value;

  const employee = {
    id: employeeId || `emp-${Date.now()}`,
    firstName,
    lastName,
    employeeId,
    position,
    email,
    phone,
    startDate,
    photo: newPictureData || '',
    history: []
  };

  const employees = readEmployees();
  const existingIndex = employees.findIndex(item => item.id === employee.id || (item.employeeId && item.employeeId.toLowerCase() === employeeId.toLowerCase()));

  if (existingIndex >= 0) {
    employees[existingIndex] = { ...employees[existingIndex], ...employee };
  } else {
    employees.unshift(employee);
  }

  writeEmployees(employees);
  renderEmployeeList();
  newEmployeeForm.reset();
  newPictureData = '';
  newPicturePreview.hidden = true;
  saveState.textContent = `${firstName} ${lastName} created`;
  openEmployeeDetail(employee.id);
});

newProfilePicture.addEventListener('change', () => {
  const file = newProfilePicture.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = event => {
    newPictureData = event.target.result;
    newPicturePreview.src = newPictureData;
    newPicturePreview.hidden = false;
  };
  reader.readAsDataURL(file);
});

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const viewName = button.dataset.view;
    currentEmployeeId = null;
    setView(viewName);
    if (viewName === 'list') renderEmployeeList();
    saveState.textContent = viewName === 'home' ? 'Ready' : `${button.textContent} open`;
  });
});

addHistoryButton.addEventListener('click', openHistoryModal);

historyList.addEventListener('click', event => {
  const recordItem = event.target.closest('[data-record-id]');
  if (recordItem) openRecordDetails(recordItem.dataset.recordId);
});

historyList.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const recordItem = event.target.closest('[data-record-id]');
  if (!recordItem) return;
  event.preventDefault();
  openRecordDetails(recordItem.dataset.recordId);
});

historyType.addEventListener('change', updateHistoryTypeFields);

document.querySelectorAll('[data-close-history]').forEach(button => {
  button.addEventListener('click', closeHistoryModal);
});

document.querySelectorAll('[data-close-record-details]').forEach(button => {
  button.addEventListener('click', closeRecordDetails);
});

historyForm.addEventListener('submit', event => {
  event.preventDefault();
  const employee = getCurrentEmployee();
  if (!employee) return;

  const isEvaluation = historyType.value === 'Evaluation';
  const sickDays = historyType.value === 'Sickness' ? Number(sicknessDays.value) : 0;
  const scoreFields = {
    quality: document.querySelector('#evaluationQuality').value,
    productivity: document.querySelector('#evaluationProductivity').value,
    reliability: document.querySelector('#evaluationReliability').value,
    teamwork: document.querySelector('#evaluationTeamwork').value,
    communication: document.querySelector('#evaluationCommunication').value,
    growth: document.querySelector('#evaluationGrowth').value
  };
  const scoreValues = Object.values(scoreFields).map(Number);
  const overallScore = isEvaluation ? (scoreValues.reduce((total, score) => total + score, 0) / scoreValues.length).toFixed(1) : '';
  const evaluation = isEvaluation ? {
    scores: scoreFields,
    overallScore,
    goals: document.querySelector('#evaluationGoals').value.trim(),
    comments: document.querySelector('#evaluationComments').value.trim()
  } : null;

  const record = {
    id: `record-${Date.now()}`,
    type: historyType.value,
    date: document.querySelector('#historyDate').value,
    summary: isEvaluation ? `Performance evaluation - overall rating ${overallScore}/5` : historySummary.value.trim(),
    details: isEvaluation ? `${evaluation.comments}\n\nGoals and follow-up:\n${evaluation.goals}` : historyDetails.value.trim(),
    evaluation,
    sickDays
  };

  const employees = readEmployees();
  const index = employees.findIndex(item => item.id === employee.id);

  if (index >= 0) {
    employees[index].history = [record, ...(employees[index].history || [])];
    writeEmployees(employees);
    renderEmployeeList();
    renderEmployeeDetail();
    saveState.textContent = `${record.type} saved`;
  }

  closeHistoryModal();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !historyModal.classList.contains('hidden')) {
    closeHistoryModal();
  }
  if (event.key === 'Escape' && !recordDetailsModal.classList.contains('hidden')) {
    closeRecordDetails();
  }
});

renderEmployeeList();
setView('home');
document.querySelector('#historyDate').value = new Date().toISOString().split('T')[0];
