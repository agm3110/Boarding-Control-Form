const form = document.querySelector('#evaluationForm');
const saveState = document.querySelector('#saveState');
const overallScore = document.querySelector('#overallScore');
const scoreMeter = document.querySelector('#scoreMeter');
const ratingStatus = document.querySelector('#ratingStatus');
const ratingDescription = document.querySelector('#ratingDescription');
const employeeList = document.querySelector('#employeeList');
const employeeCount = document.querySelector('#employeeCount');
const employeeStorageKey = 'employee-evaluation-dashboard-profiles';
const employeesListButton = document.querySelector('#employeesListButton');
const evaluationViewButton = document.querySelector('#evaluationViewButton');
const newEmployeeButton = document.querySelector('#newEmployeeButton');
const employeesPanel = document.querySelector('#employeesPanel');
const dashboardLayout = document.querySelector('#dashboardLayout');
const profileDrawer = document.querySelector('#profileDrawer');
const profileDrawerTitle = document.querySelector('#profileDrawerTitle');
const profileDrawerScore = document.querySelector('#profileDrawerScore');
const profileDrawerDetails = document.querySelector('#profileDrawerDetails');
const loadProfileButton = document.querySelector('#loadProfileButton');
const employeeModal = document.querySelector('#employeeModal');
const newEmployeeForm = document.querySelector('#newEmployeeForm');
const newProfilePicture = document.querySelector('#newProfilePicture');
const newPicturePreview = document.querySelector('#newPicturePreview');
let selectedProfile = null;
let newPictureData = '';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function numberValue(id) {
    return Number(document.querySelector(`#${id}`).value) || 0;
}

function averageScore(section) {
    const inputs = document.querySelectorAll(`[data-score-section="${section}"] [data-score]`);
    const values = [...inputs].map(input => clamp(Number(input.value) || 0, 0, 5));
    const ratedValues = values.filter(value => value > 0);
    return ratedValues.length ? ratedValues.reduce((sum, value) => sum + value, 0) / ratedValues.length : 0;
}

function percentage(numerator, denominator) {
    if (!denominator) return 0;
    return clamp((numerator / denominator) * 100, 0, 100);
}

function ratingForScore(score) {
    if (!score) return { label: 'Add ratings to begin', description: 'Complete the four sections to generate an evaluation status.' };
    if (score >= 4.5) return { label: 'Excellent', description: 'A standout review. Recognize the impact and keep the momentum going.' };
    if (score >= 3.5) return { label: 'Good', description: 'A solid review. Agree on one or two focused areas to build on.' };
    if (score >= 2.5) return { label: 'Needs Improvement', description: 'Set clear support, actions, and a follow-up date for progress.' };
    return { label: 'Unsatisfactory', description: 'Document the support plan and next steps with care and specificity.' };
}

function updateResults() {
    const competence = averageScore('competence');
    const compliance = averageScore('compliance');
    const attendance = percentage(numberValue('daysPresent'), numberValue('workingDays'));
    const punctuality = percentage(numberValue('onTimeArrivals'), numberValue('scheduledShifts'));
    const sections = [competence, compliance, attendance / 20, punctuality / 20].filter(value => value > 0);
    const overall = sections.length ? sections.reduce((sum, value) => sum + value, 0) / sections.length : 0;
    const rating = ratingForScore(overall);

    document.querySelector('[data-section-score="competence"]').textContent = `${competence.toFixed(1)} / 5`;
    document.querySelector('[data-section-score="compliance"]').textContent = `${compliance.toFixed(1)} / 5`;
    document.querySelector('[data-section-score="attendance"]').textContent = `${attendance.toFixed(0)}%`;
    document.querySelector('[data-section-score="punctuality"]').textContent = `${punctuality.toFixed(0)}%`;
    document.querySelector('#competenceResult').textContent = competence.toFixed(1);
    document.querySelector('#complianceResult').textContent = compliance.toFixed(1);
    document.querySelector('#attendanceResult').textContent = `${attendance.toFixed(0)}%`;
    document.querySelector('#punctualityResult').textContent = `${punctuality.toFixed(0)}%`;
    overallScore.textContent = overall.toFixed(1);
    scoreMeter.style.width = `${(overall / 5) * 100}%`;
    ratingStatus.textContent = rating.label;
    ratingDescription.textContent = rating.description;
}

function markChanged() {
    saveState.textContent = 'Unsaved changes';
    updateResults();
}

function readProfiles() {
    try {
        return JSON.parse(localStorage.getItem(employeeStorageKey)) || [];
    } catch {
        return [];
    }
}

function fieldValue(id) {
    return document.querySelector(`#${id}`)?.value.trim() || '';
}

function formData() {
    return {
        employeeName: fieldValue('employeeName'),
        employeeId: fieldValue('employeeId'),
        department: fieldValue('department'),
        position: fieldValue('position'),
        evaluationPeriod: fieldValue('evaluationPeriod'),
        evaluator: fieldValue('evaluator'),
        workingDays: fieldValue('workingDays'),
        daysPresent: fieldValue('daysPresent'),
        approvedAbsence: fieldValue('approvedAbsence'),
        unapprovedAbsence: fieldValue('unapprovedAbsence'),
        sickDays: fieldValue('sickDays'),
        scheduledShifts: fieldValue('scheduledShifts'),
        onTimeArrivals: fieldValue('onTimeArrivals'),
        lateArrivals: fieldValue('lateArrivals'),
        minutesLate: fieldValue('minutesLate'),
        notes: fieldValue('notes'),
        scores: [...document.querySelectorAll('[data-score]')].map(input => input.value),
        qualifications: [...document.querySelectorAll('[data-qualification-status]')].map(status => ({
            name: status.dataset.qualificationStatus,
            status: status.value,
            rate: document.querySelector(`[data-qualification-rate="${status.dataset.qualificationStatus}"]`).value
        }))
    };
}

function applyFormData(data) {
    Object.entries(data).forEach(([id, value]) => {
        const input = document.querySelector(`#${id}`);
        if (input && typeof value === 'string') input.value = value;
    });
    document.querySelectorAll('[data-score]').forEach((input, index) => { input.value = data.scores?.[index] || 0; });
    data.qualifications?.forEach(qualification => {
        const status = document.querySelector(`[data-qualification-status="${qualification.name}"]`);
        const rate = document.querySelector(`[data-qualification-rate="${qualification.name}"]`);
        if (status && rate) {
            status.value = qualification.status;
            rate.value = qualification.rate;
            syncQualificationRate(status);
        }
    });
    updateResults();
    saveState.textContent = `Loaded ${data.employeeName || 'employee'}`;
}

function profileDetail(label, value) {
    const detail = document.createElement('div');
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    const valueElement = document.createElement('strong');
    valueElement.textContent = value || 'Not provided';
    detail.append(labelElement, valueElement);
    return detail;
}

function openProfile(profile) {
    selectedProfile = profile;
    const data = profile.data;
    profileDrawerTitle.textContent = profile.employeeName || 'Unnamed employee';
    profileDrawerScore.innerHTML = `${profile.score.toFixed(1)} <small>/ 5</small>`;
    profileDrawerDetails.replaceChildren();

    const employeeGroup = document.createElement('section');
    employeeGroup.className = 'profile-detail-group';
    const employeeHeading = document.createElement('h3');
    employeeHeading.textContent = 'Employee information';
    const employeeGrid = document.createElement('div');
    employeeGrid.className = 'profile-detail-grid';
    employeeGrid.append(
        profileDetail('First name', data.firstName || data.employeeName?.split(' ')[0]),
        profileDetail('Last name', data.lastName || data.employeeName?.split(' ').slice(1).join(' ')),
        profileDetail('Employee ID', data.employeeId),
        profileDetail('Work email', data.workEmail),
        profileDetail('Work phone', data.workPhone),
        profileDetail('Department', data.department),
        profileDetail('Position title', data.position || data.positionTitle),
        profileDetail('Commencement date', data.commencementDate),
        profileDetail('Evaluation period', data.evaluationPeriod),
        profileDetail('Evaluator', data.evaluator)
    );
    employeeGroup.append(employeeHeading, employeeGrid);
    if (data.photo) {
        const photo = document.createElement('img');
        photo.className = 'profile-photo';
        photo.src = data.photo;
        photo.alt = `${profile.employeeName || 'Employee'} profile picture`;
        employeeGroup.prepend(photo);
    }
    profileDrawerDetails.append(employeeGroup);

    const qualificationGroup = document.createElement('section');
    qualificationGroup.className = 'profile-detail-group';
    const qualificationHeading = document.createElement('h3');
    qualificationHeading.textContent = 'Job qualifications';
    const qualificationLabels = { 'check-in': 'Check-in', 'gate-support': 'Gate Support', 'gate-agent': 'Gate Agent', 'service-desk': 'Service Desk', arrival: 'Arrival', ops: 'Ops' };
    data.qualifications?.forEach(qualification => {
        const row = document.createElement('div');
        row.className = 'profile-qualification';
        const name = document.createElement('span');
        name.textContent = qualificationLabels[qualification.name] || qualification.name;
        const result = document.createElement('strong');
        result.textContent = qualification.status === 'yes' ? `Yes, ${qualification.rate || '-'} / 5` : 'No';
        row.append(name, result);
        qualificationGroup.append(row);
    });
    qualificationGroup.prepend(qualificationHeading);
    profileDrawerDetails.append(qualificationGroup);

    const notesGroup = document.createElement('section');
    notesGroup.className = 'profile-detail-group';
    const notesHeading = document.createElement('h3');
    notesHeading.textContent = 'Evaluator notes';
    const notes = document.createElement('p');
    notes.className = 'profile-notes';
    notes.textContent = data.notes || 'No notes saved.';
    notesGroup.append(notesHeading, notes);
    profileDrawerDetails.append(notesGroup);
    profileDrawer.hidden = false;
}

function closeProfile() {
    profileDrawer.hidden = true;
    selectedProfile = null;
}

function renderProfiles() {
    const profiles = readProfiles();
    employeeCount.textContent = `${profiles.length} saved`;
    employeeList.replaceChildren();
    if (!profiles.length) {
        const emptyState = document.createElement('p');
        emptyState.className = 'empty-employees';
        emptyState.textContent = 'No saved employees yet.';
        employeeList.append(emptyState);
        return;
    }
    profiles.forEach(profile => {
        const card = document.createElement('button');
        card.className = 'employee-card';
        card.type = 'button';
        card.innerHTML = `<span><strong></strong><small class="employee-position"></small><small>${profile.employeeId || 'Employee profile'}</small></span><b class="employee-score">${Number(profile.score || 0).toFixed(1)}</b>`;
        card.querySelector('strong').textContent = profile.employeeName || 'Unnamed employee';
        card.querySelector('.employee-position').textContent = profile.data?.position || profile.data?.positionTitle || 'Position not provided';
        card.addEventListener('click', () => openProfile(profile));
        employeeList.append(card);
    });
}

function openNewEmployeeModal() {
    newEmployeeForm.reset();
    newPictureData = '';
    newPicturePreview.hidden = true;
    employeeModal.hidden = false;
    document.querySelector('#newFirstName').focus();
}

function closeNewEmployeeModal() {
    employeeModal.hidden = true;
}

function syncQualificationRate(statusSelect) {
    const qualification = statusSelect.dataset.qualificationStatus;
    const rateInput = document.querySelector(`[data-qualification-rate="${qualification}"]`);
    const canRate = statusSelect.value === 'yes';
    rateInput.disabled = !canRate;
    if (!canRate) rateInput.value = '';
}

document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', markChanged);
    input.addEventListener('change', markChanged);
});

document.querySelectorAll('[data-qualification-status]').forEach(statusSelect => {
    statusSelect.addEventListener('change', () => syncQualificationRate(statusSelect));
    syncQualificationRate(statusSelect);
});

function resetEvaluation() {
    form.reset();
    document.querySelectorAll('[data-score]').forEach(input => { input.value = 0; });
    document.querySelectorAll('[data-attendance], [data-punctuality]').forEach(input => { input.value = 0; });
    document.querySelectorAll('[data-qualification-status]').forEach(syncQualificationRate);
    saveState.textContent = 'Ready to review';
    updateResults();
}

form.addEventListener('submit', event => {
    event.preventDefault();
    const data = formData();
    const profiles = readProfiles();
    const profileKey = data.employeeId.toLowerCase() || data.employeeName.toLowerCase();
    const profile = { id: profileKey || `profile-${Date.now()}`, employeeName: data.employeeName, employeeId: data.employeeId, score: Number(overallScore.textContent), data };
    const existingIndex = profiles.findIndex(item => item.id === profile.id);
    if (existingIndex >= 0) profiles[existingIndex] = profile;
    else profiles.unshift(profile);
    localStorage.setItem(employeeStorageKey, JSON.stringify(profiles));
    renderProfiles();
    updateResults();
    saveState.textContent = `Saved ${data.employeeName || 'employee'} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
});

document.querySelector('#resetButton').addEventListener('click', resetEvaluation);
employeesListButton.addEventListener('click', () => {
    dashboardLayout.classList.add('employees-list-view');
    employeesPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
evaluationViewButton.addEventListener('click', () => {
    dashboardLayout.classList.remove('employees-list-view');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
newEmployeeButton.addEventListener('click', () => {
    openNewEmployeeModal();
});
document.querySelectorAll('[data-close-profile]').forEach(button => button.addEventListener('click', closeProfile));
loadProfileButton.addEventListener('click', () => {
    if (!selectedProfile) return;
    applyFormData(selectedProfile.data);
    closeProfile();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !profileDrawer.hidden) closeProfile();
    if (event.key === 'Escape' && !employeeModal.hidden) closeNewEmployeeModal();
});

newProfilePicture.addEventListener('change', () => {
    const file = newProfilePicture.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        newPictureData = reader.result;
        newPicturePreview.src = newPictureData;
        newPicturePreview.hidden = false;
    });
    reader.readAsDataURL(file);
});

document.querySelectorAll('[data-close-employee-modal]').forEach(button => button.addEventListener('click', closeNewEmployeeModal));
newEmployeeForm.addEventListener('submit', event => {
    event.preventDefault();
    const firstName = document.querySelector('#newFirstName').value.trim();
    const lastName = document.querySelector('#newLastName').value.trim();
    const employeeId = document.querySelector('#newEmployeeId').value.trim();
    const data = {
        employeeName: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        employeeId,
        workEmail: document.querySelector('#newWorkEmail').value.trim(),
        workPhone: document.querySelector('#newWorkPhone').value.trim(),
        position: document.querySelector('#newPositionTitle').value.trim(),
        commencementDate: document.querySelector('#newCommencementDate').value,
        photo: newPictureData,
        evaluationPeriod: '2025',
        scores: [...document.querySelectorAll('[data-score]')].map(() => '0'),
        qualifications: []
    };
    const profiles = readProfiles();
    const profile = { id: employeeId.toLowerCase(), employeeName: data.employeeName, employeeId, score: 0, data };
    const existingIndex = profiles.findIndex(item => item.id === profile.id);
    if (existingIndex >= 0) profiles[existingIndex] = { ...profiles[existingIndex], ...profile };
    else profiles.unshift(profile);
    localStorage.setItem(employeeStorageKey, JSON.stringify(profiles));
    renderProfiles();
    closeNewEmployeeModal();
    saveState.textContent = `Created ${data.employeeName}`;
});

updateResults();
renderProfiles();
