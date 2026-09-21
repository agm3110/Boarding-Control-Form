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
const performanceStars = document.querySelector('#performanceStars');
const performanceScore = document.querySelector('#performanceScore');
const trainingBadges = document.querySelector('#trainingBadges');
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
const editRecordButton = document.querySelector('#editRecordButton');
const deleteRecordButton = document.querySelector('#deleteRecordButton');
const evaluationFields = document.querySelector('#evaluationFields');
const historyType = document.querySelector('#historyType');
const sicknessDaysField = document.querySelector('#sicknessDaysField');
const sicknessDays = document.querySelector('#sicknessDays');
const trainingFields = document.querySelector('#trainingFields');
const trainingDepartment = document.querySelector('#trainingDepartment');
const trainingEndDate = document.querySelector('#trainingEndDate');
const trainingStatus = document.querySelector('#trainingStatus');
const historySummary = document.querySelector('#historySummary');
const historyDetails = document.querySelector('#historyDetails');
let currentEmployeeId = null;
let newPictureData = '';
let selectedRecordId = null;
let editingRecordId = null;

const seedEmployees = [
  {
    id: 'EMP-1001',
    firstName: 'Olivia',
    lastName: 'Carter',
    employeeId: 'EMP-1001',
    position: 'Senior Product Manager',
    email: 'olivia.carter@company.com',
    phone: '+1 (415) 555-0101',
    startDate: '2021-02-15',
    photo: '',
    history: [
      { id: 'r-1001', type: 'Evaluation', date: '2025-06-04', summary: 'Performance evaluation - overall rating 4.5/5', details: 'Strong leadership and excellent cross-functional collaboration.\n\nGoals and follow-up:\nContinue mentoring junior staff and improve delivery forecasting.', evaluation: { scores: { quality: '5', productivity: '4', reliability: '5', teamwork: '5', communication: '4', growth: '4' }, overallScore: '4.5', goals: 'Mentor two junior team members and improve roadmap forecasting.', comments: 'Olivia consistently leads high-impact work and remains highly reliable.' }, sickDays: 0 },
      { id: 'r-1002', type: 'Meeting with employee', date: '2025-03-18', summary: 'Quarterly coaching session', details: 'Reviewed roadmap priorities, stakeholder communication, and workload planning.', evaluation: null, sickDays: 0 }
    ]
  },
  {
    id: 'EMP-1002',
    firstName: 'Daniel',
    lastName: 'Nguyen',
    employeeId: 'EMP-1002',
    position: 'Frontend Developer',
    email: 'daniel.nguyen@company.com',
    phone: '+1 (415) 555-0102',
    startDate: '2022-04-19',
    photo: '',
    history: [
      { id: 'r-2001', type: 'Evaluation', date: '2025-01-10', summary: 'Performance evaluation - overall rating 4.2/5', details: 'Strong implementation quality and good initiative.\n\nGoals and follow-up:\nImprove release planning and communication with QA.', evaluation: { scores: { quality: '4', productivity: '5', reliability: '4', teamwork: '4', communication: '3', growth: '5' }, overallScore: '4.2', goals: 'Improve release planning and QA coordination.', comments: 'Daniel is dependable and highly productive, with good growth potential.' }, sickDays: 0 },
      { id: 'r-2002', type: 'Arrived late', date: '2025-02-11', summary: 'Late arrival due to delayed train', details: 'Employee arrived 18 minutes late and notified the manager in advance.', evaluation: null, sickDays: 0 }
    ]
  },
  {
    id: 'EMP-1003',
    firstName: 'Alicia',
    lastName: 'Patel',
    employeeId: 'EMP-1003',
    position: 'HR Specialist',
    email: 'alicia.patel@company.com',
    phone: '+1 (415) 555-0103',
    startDate: '2020-11-05',
    photo: '',
    history: [
      { id: 'r-3001', type: 'Sickness', date: '2025-04-12', summary: 'Two sick days recorded', details: 'Employee reported illness and submitted a medical note.', evaluation: null, sickDays: 2 },
      { id: 'r-3002', type: 'Meeting with employee', date: '2025-05-20', summary: 'Employee engagement discussion', details: 'Reviewed onboarding feedback and work-life balance needs.', evaluation: null, sickDays: 0 }
    ]
  },
  {
    id: 'EMP-1004',
    firstName: 'Marcus',
    lastName: 'Brown',
    employeeId: 'EMP-1004',
    position: 'Operations Analyst',
    email: 'marcus.brown@company.com',
    phone: '+1 (415) 555-0104',
    startDate: '2023-06-10',
    photo: '',
    history: [
      { id: 'r-4001', type: 'Evaluation', date: '2025-02-22', summary: 'Performance evaluation - overall rating 3.8/5', details: 'Strong analytical work with some communication gaps.\n\nGoals and follow-up:\nImprove presentation quality and decision documentation.', evaluation: { scores: { quality: '4', productivity: '4', reliability: '4', teamwork: '3', communication: '3', growth: '4' }, overallScore: '3.7', goals: 'Improve presentation quality and written communication.', comments: 'Marcus is analytical and reliable but should improve communication with stakeholders.' }, sickDays: 0 },
      { id: 'r-4002', type: 'Written warning', date: '2025-03-09', summary: 'Attendance compliance issue', details: 'Repeated late arrivals and missed start time were documented in writing.', evaluation: null, sickDays: 0 }
    ]
  },
  {
    id: 'EMP-1005',
    firstName: 'Sophia',
    lastName: 'Lewis',
    employeeId: 'EMP-1005',
    position: 'Marketing Coordinator',
    email: 'sophia.lewis@company.com',
    phone: '+1 (415) 555-0105',
    startDate: '2021-09-13',
    photo: '',
    history: [
      { id: 'r-5001', type: 'Evaluation', date: '2025-05-15', summary: 'Performance evaluation - overall rating 4.8/5', details: 'Excellent campaign performance and strong stakeholder support.\n\nGoals and follow-up:\nBuild deeper analytics ownership and mentor interns.', evaluation: { scores: { quality: '5', productivity: '5', reliability: '5', teamwork: '4', communication: '5', growth: '5' }, overallScore: '4.8', goals: 'Increase ownership of performance reporting and mentor interns.', comments: 'Sophia is a standout contributor with excellent quality and initiative.' }, sickDays: 0 },
      { id: 'r-5002', type: 'Meeting with employee', date: '2025-06-27', summary: 'Career development review', details: 'Discussed progression opportunities and leadership interests.', evaluation: null, sickDays: 0 }
    ]
  },
  {
    id: 'EMP-1006',
    firstName: 'Ethan',
    lastName: 'Kim',
    employeeId: 'EMP-1006',
    position: 'DevOps Engineer',
    email: 'ethan.kim@company.com',
    phone: '+1 (415) 555-0106',
    startDate: '2022-01-18',
    photo: '',
    history: [
      { id: 'r-6001', type: 'Sickness', date: '2025-03-06', summary: 'Medical leave recorded', details: 'Employee took one sick day due to illness.', evaluation: null, sickDays: 1 },
      { id: 'r-6002', type: 'Evaluation', date: '2025-04-28', summary: 'Performance evaluation - overall rating 4.4/5', details: 'Very strong technical reliability and deployment ownership.\n\nGoals and follow-up:\nContinue improving documentation and incident communication.', evaluation: { scores: { quality: '5', productivity: '4', reliability: '5', teamwork: '4', communication: '4', growth: '4' }, overallScore: '4.3', goals: 'Improve documentation quality and incident communication.', comments: 'Ethan is reliable and technically strong with a positive growth trajectory.' }, sickDays: 0 }
    ]
  },
  {
    id: 'EMP-1007',
    firstName: 'Nina',
    lastName: 'Martinez',
    employeeId: 'EMP-1007',
    position: 'Customer Success Manager',
    email: 'nina.martinez@company.com',
    phone: '+1 (415) 555-0107',
    startDate: '2020-08-22',
    photo: '',
    history: [
      { id: 'r-7001', type: 'Evaluation', date: '2025-02-18', summary: 'Performance evaluation - overall rating 4.6/5', details: 'Excellent customer retention and relationship growth.\n\nGoals and follow-up:\nContinue scaling onboarding playbooks and customer health reporting.', evaluation: { scores: { quality: '5', productivity: '4', reliability: '5', teamwork: '4', communication: '5', growth: '5' }, overallScore: '4.7', goals: 'Scale onboarding playbooks and improve customer health reporting.', comments: 'Nina is highly effective with customers and creates strong trust.' }, sickDays: 0 },
      { id: 'r-7002', type: 'Meeting with employee', date: '2025-05-09', summary: 'Customer success strategy review', details: 'Reviewed client retention risks and team growth opportunities.', evaluation: null, sickDays: 0 }
    ]
  },
  {
    id: 'EMP-1008',
    firstName: 'Liam',
    lastName: 'Scott',
    employeeId: 'EMP-1008',
    position: 'Sales Executive',
    email: 'liam.scott@company.com',
    phone: '+1 (415) 555-0108',
    startDate: '2023-02-14',
    photo: '',
    history: [
      { id: 'r-8001', type: 'Evaluation', date: '2025-01-27', summary: 'Performance evaluation - overall rating 3.9/5', details: 'Strong pipeline generation with occasional follow-up gaps.\n\nGoals and follow-up:\nImprove account planning and CRM discipline.', evaluation: { scores: { quality: '4', productivity: '5', reliability: '3', teamwork: '4', communication: '3', growth: '4' }, overallScore: '3.8', goals: 'Improve account planning and CRM consistency.', comments: 'Liam is effective in sales and shows strong energy but can improve consistency.' }, sickDays: 0 },
      { id: 'r-8002', type: 'Verbal warning', date: '2025-04-03', summary: 'Customer escalation concerns', details: 'Discussed missed follow-up commitments and communication expectations.', evaluation: null, sickDays: 0 }
    ]
  },
  {
    id: 'EMP-1009',
    firstName: 'Emma',
    lastName: 'Johnson',
    employeeId: 'EMP-1009',
    position: 'Finance Analyst',
    email: 'emma.johnson@company.com',
    phone: '+1 (415) 555-0109',
    startDate: '2021-07-08',
    photo: '',
    history: [
      { id: 'r-9001', type: 'Evaluation', date: '2025-03-12', summary: 'Performance evaluation - overall rating 4.1/5', details: 'Strong reporting accuracy and process improvements.\n\nGoals and follow-up:\nDeeper modeling support and stronger deadline communication.', evaluation: { scores: { quality: '4', productivity: '4', reliability: '4', teamwork: '4', communication: '4', growth: '4' }, overallScore: '4.1', goals: 'Deeper modeling support and stronger deadline communication.', comments: 'Emma is dependable and methodical in financial analysis.' }, sickDays: 0 },
      { id: 'r-9002', type: 'Sickness', date: '2025-06-14', summary: 'Two sick days approved', details: 'Employee was absent for two days due to illness and provided documentation.', evaluation: null, sickDays: 2 }
    ]
  },
  {
    id: 'EMP-1010',
    firstName: 'James',
    lastName: 'Wilson',
    employeeId: 'EMP-1010',
    position: 'QA Engineer',
    email: 'james.wilson@company.com',
    phone: '+1 (415) 555-0110',
    startDate: '2024-01-16',
    photo: '',
    history: [
      { id: 'r-10001', type: 'Evaluation', date: '2025-05-22', summary: 'Performance evaluation - overall rating 3.6/5', details: 'Good QA execution with a need for more independence.\n\nGoals and follow-up:\nImprove test automation ownership and defect triage speed.', evaluation: { scores: { quality: '3', productivity: '4', reliability: '4', teamwork: '3', communication: '3', growth: '4' }, overallScore: '3.5', goals: 'Improve test automation ownership and defect triage speed.', comments: 'James is improving steadily and has positive growth potential.' }, sickDays: 0 },
      { id: 'r-10002', type: 'Meeting with employee', date: '2025-06-08', summary: 'Performance coaching discussion', details: 'Reviewed testing priorities and support needs for role growth.', evaluation: null, sickDays: 0 }
    ]
  }
];

function readEmployees() {
  try {
    const saved = JSON.parse(localStorage.getItem(employeeStorageKey));

    if (saved === null) {
      writeEmployees(seedEmployees);
      return [...seedEmployees];
    }

    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [...seedEmployees];
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

function getTrainingCode(training) {
  if (!training || String(training.status).trim().toLowerCase() !== 'successful') return '';

  const departmentCodes = {
    operation: 'OP',
    checkin: 'CI',
    'boarding support': 'BS',
    'boarding agent': 'BA',
    arrival: 'AR',
    'team leader': 'TL',
    supervisor: 'SV'
  };

  return departmentCodes[String(training.department).trim().toLowerCase()] || 'TR';
}

function getEmployeeTrainings(employee, history) {
  const trainingRecords = history.filter(record => record.type === 'Training');
  if (!trainingRecords.length) return employee.training ? [employee.training] : [];

  return trainingRecords
    .map(record => record.training || employee.training)
    .filter(Boolean);
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

  const ratingValue = Number(averageEvaluation);
  const filledStars = Number.isFinite(ratingValue) ? Math.round(ratingValue) : 0;
  const stars = Array.from({ length: 5 }, (_, index) => index < filledStars ? '★' : '☆').join('');
  const training = employee.training || null;
  const trainingCodes = getEmployeeTrainings(employee, history)
    .map(getTrainingCode)
    .filter(Boolean);

  detailAvatar.textContent = getInitials(employee.firstName, employee.lastName);
  detailName.textContent = `${employee.firstName} ${employee.lastName}`;
  detailPosition.textContent = employee.position || 'Position not provided';
  trainingBadges.innerHTML = trainingCodes.map(code => `<span class="training-badge">${code}</span>`).join('');
  trainingBadges.classList.toggle('hidden', !trainingCodes.length);
  performanceStars.textContent = Number.isFinite(ratingValue) ? stars : '☆☆☆☆☆';
  performanceScore.textContent = Number.isFinite(ratingValue) ? `${averageEvaluation}/5` : 'No evaluation';
  historyCount.textContent = String(history.length);
  warningCount.textContent = String(warningTotal);
  lateCount.textContent = String(lateTotal);
  sickDaysCount.textContent = String(sickDaysTotal);

  const trainingMeta = training ? `
    <div class="meta-item"><span>Training department</span><strong>${training.department || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Training start</span><strong>${training.startDate || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Training end</span><strong>${training.endDate || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Training status</span><strong>${String(training.status).trim().toLowerCase() === 'successful' ? 'Successful' : 'Not successful'}</strong></div>
  ` : `
    <div class="meta-item"><span>Training</span><strong>No training added yet</strong></div>
  `;

  detailMeta.innerHTML = `
    <div class="meta-item"><span>Employee ID</span><strong>${employee.employeeId || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Position</span><strong>${employee.position || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Work email</span><strong>${employee.email || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Work phone</span><strong>${employee.phone || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Date of commencement</span><strong>${employee.startDate || 'Not provided'}</strong></div>
    <div class="meta-item"><span>Profile status</span><strong>${history.length ? 'History available' : 'No records yet'}</strong></div>
    ${trainingMeta}
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
  selectedRecordId = null;
}

function openRecordDetails(recordId) {
  const employee = getCurrentEmployee();
  const record = employee?.history?.find(item => item.id === recordId);
  if (!record) return;

  selectedRecordId = recordId;
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
  const isTraining = historyType.value === 'Training';
  evaluationFields.hidden = !isEvaluation;
  sicknessDaysField.hidden = !isSickness;
  trainingFields.hidden = !isTraining;
  sicknessDays.required = isSickness;
  trainingDepartment.required = isTraining;
  trainingEndDate.required = isTraining;
  trainingStatus.required = isTraining;
  historySummary.required = !isEvaluation && !isTraining;
  historyDetails.required = !isEvaluation && !isTraining;
  evaluationFields.querySelectorAll('select, textarea').forEach(field => {
    field.required = isEvaluation;
  });
}

function closeHistoryModal() {
  historyModal.classList.add('hidden');
  historyForm.reset();
  editingRecordId = null;
  const today = new Date().toISOString().split('T')[0];
  document.querySelector('#historyDate').value = today;
  trainingEndDate.value = today;
  updateHistoryTypeFields();
}

function openHistoryModal(record = null) {
  if (!currentEmployeeId) return;
  const savedTraining = record?.training || (record?.type === 'Training' ? getCurrentEmployee()?.training : null);
  editingRecordId = record?.id || null;
  historyModal.classList.remove('hidden');
  const today = new Date().toISOString().split('T')[0];
  historyForm.reset();
  document.querySelector('#historyDate').value = record?.date || today;
  trainingEndDate.value = record?.training?.endDate || record?.date || today;
  historyType.value = record?.type || 'Evaluation';
  sicknessDays.value = record?.sickDays || '';
  historySummary.value = record?.summary || '';
  historyDetails.value = record?.details || '';

  if (record?.evaluation) {
    Object.entries(record.evaluation.scores || {}).forEach(([key, value]) => {
      const field = document.querySelector(`#evaluation${key.charAt(0).toUpperCase()}${key.slice(1)}`);
      if (field) field.value = value;
    });
    document.querySelector('#evaluationGoals').value = record.evaluation.goals || '';
    document.querySelector('#evaluationComments').value = record.evaluation.comments || '';
  }

  if (savedTraining) {
    trainingDepartment.value = savedTraining.department || '';
    trainingEndDate.value = savedTraining.endDate || record.date || today;
    trainingStatus.value = savedTraining.status || 'successful';
  }

  document.querySelector('#historyModalTitle').textContent = record ? 'Edit record' : 'Add record';
  historyForm.querySelector('button[type="submit"]').textContent = record ? 'Save changes' : 'Save record';
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
    history: [],
    training: null
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

addHistoryButton.addEventListener('click', () => openHistoryModal());

editRecordButton.addEventListener('click', () => {
  const employee = getCurrentEmployee();
  const record = employee?.history?.find(item => item.id === selectedRecordId);
  if (!record) return;

  closeRecordDetails();
  openHistoryModal(record);
});

deleteRecordButton.addEventListener('click', () => {
  const employee = getCurrentEmployee();
  const record = employee?.history?.find(item => item.id === selectedRecordId);
  if (!record || !confirm(`Delete the ${record.type} record dated ${record.date}?`)) return;

  const employees = readEmployees();
  const index = employees.findIndex(item => item.id === employee.id);
  if (index < 0) return;

  employees[index].history = (employees[index].history || []).filter(item => item.id !== record.id);
  writeEmployees(employees);
  closeRecordDetails();
  renderEmployeeList();
  renderEmployeeDetail();
  saveState.textContent = `${record.type} deleted`;
});

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
  const recordIdToUpdate = editingRecordId;

  const isEvaluation = historyType.value === 'Evaluation';
  const isTraining = historyType.value === 'Training';
  const trainingStartDate = document.querySelector('#historyDate').value;
  const trainingEndDateValue = trainingEndDate.value;
  if (isTraining && trainingEndDateValue < trainingStartDate) {
    alert('Training end date must be after the starting date.');
    return;
  }

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
  const training = isTraining ? {
    department: trainingDepartment.value,
    startDate: trainingStartDate,
    endDate: trainingEndDateValue,
    status: trainingStatus.value
  } : null;

  const record = {
    id: `record-${Date.now()}`,
    type: historyType.value,
    date: trainingStartDate,
    summary: isEvaluation
      ? `Performance evaluation - overall rating ${overallScore}/5`
      : isTraining
        ? `${training.department} training - ${training.status === 'successful' ? 'successful' : 'not successful'}`
        : historySummary.value.trim(),
    details: isEvaluation
      ? `${evaluation.comments}\n\nGoals and follow-up:\n${evaluation.goals}`
      : isTraining
        ? `Training department: ${training.department}\nStart date: ${training.startDate}\nEnd date: ${training.endDate}\nStatus: ${training.status === 'successful' ? 'Successful' : 'Not successful'}`
        : historyDetails.value.trim(),
    evaluation,
      training,
    sickDays
  };

  const employees = readEmployees();
  const index = employees.findIndex(item => item.id === employee.id);

  if (index >= 0) {
    if (training) employees[index].training = training;
    const history = employees[index].history || [];
    employees[index].history = recordIdToUpdate
      ? history.map(item => item.id === recordIdToUpdate ? { ...record, id: recordIdToUpdate } : item)
      : [record, ...history];
    writeEmployees(employees);
    renderEmployeeList();
    renderEmployeeDetail();
    saveState.textContent = `${record.type} ${recordIdToUpdate ? 'updated' : 'saved'}`;
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
const today = new Date().toISOString().split('T')[0];
document.querySelector('#historyDate').value = today;
trainingEndDate.value = today;
