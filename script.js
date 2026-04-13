document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Update date and time in header
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    // Function to format current time as HH:MM
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Function to update time status
    function updateTimeStatus(timeInput, statusElement) {
        if (timeInput.value) {
            statusElement.textContent = '';
            statusElement.classList.add('has-time');
        } else {
            statusElement.textContent = 'TL';
            statusElement.classList.remove('has-time');
        }
    }
    
    // Function to handle time button clicks
    function handleTimeButtonClick(button) {
        let timeInput;
        let statusElement;
        
        // Find the parent time-input-group or agent-time input-group
        const timeInputGroup = button.closest('.time-input-group') || button.closest('.agent-time');
        if (timeInputGroup) {
            timeInput = timeInputGroup.querySelector('input[type="time"]');
            statusElement = timeInputGroup.querySelector('.time-status');
        }
        
        if (timeInput && statusElement) {
            timeInput.value = getCurrentTime();
            
            // Visual feedback
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-success');
            setTimeout(() => {
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-secondary');
            }, 1000);
        }
    }
    
    // Add event listeners to all time buttons
    document.querySelectorAll('.current-time-btn').forEach(button => {
        button.addEventListener('click', function() {
            handleTimeButtonClick(this);
        });
    });
    
    // Add event listeners to all time inputs to update status
    document.querySelectorAll('input[type="time"]').forEach(input => {
        input.addEventListener('input', function() {
            const timeInputGroup = this.closest('.time-input-group') || this.closest('.input-group');
            if (timeInputGroup) {
                const statusElement = timeInputGroup.querySelector('.time-status');
                if (statusElement) {
                    updateTimeStatus(this, statusElement);
                }
            }
        });
    });

    function getFieldLabel(field) {
        if (field.id) {
            const label = document.querySelector(`label[for="${field.id}"]`);
            if (label) {
                return label.textContent.trim();
            }
        }

        if (field.placeholder) {
            return field.placeholder.trim();
        }

        const groupLabel = field.closest('.time-input-group')?.querySelector('.form-label');
        if (groupLabel) {
            return groupLabel.textContent.trim();
        }

        return 'Required field';
    }

    function getMissingRequiredFields(form) {
        const missing = [];

        form.querySelectorAll('[required]').forEach(field => {
            const value = (field.value || '').trim();
            if (!value) {
                missing.push(getFieldLabel(field));
            }
        });

        return [...new Set(missing)];
    }

    // Add agent functionality
    document.getElementById('addAgentBtn').addEventListener('click', function() {
        const agentsContainer = document.getElementById('agentsContainer');
        const agentItem = document.createElement('div');
        agentItem.className = 'agent-item';
        agentItem.innerHTML = `
            <input type="text" class="form-control agent-name" placeholder="Agent name" required>
            <div class="time-input-group agent-time">
                <input type="time" class="form-control" placeholder="Arrived time" required>
                <span class="time-status">TL</span>
                <button type="button" class="btn btn-outline-secondary current-time-btn" title="Set current time">
                    <i class="bi bi-clock"></i>
                </button>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm btn-remove">
                <i class="bi bi-trash"></i>
            </button>
        `;
        agentsContainer.appendChild(agentItem);
        
        // Add event listener to the new remove button
        agentItem.querySelector('.btn-remove').addEventListener('click', function() {
            agentItem.remove();
        });
        
        // Add event listener to the new time button
        const newTimeButton = agentItem.querySelector('.current-time-btn');
        newTimeButton.addEventListener('click', function() {
            handleTimeButtonClick(this);
        });
        
        // Add event listener to the new time input
        const newTimeInput = agentItem.querySelector('input[type="time"]');
        const newStatusElement = agentItem.querySelector('.time-status');
        newTimeInput.addEventListener('input', function() {
            updateTimeStatus(this, newStatusElement);
        });
        
        // Focus on the new name field
        agentItem.querySelector('.agent-name').focus();
    });
    
    // Remove agent functionality
    document.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.agent-item').remove();
        });
    });
    
    // Special Services toggle functionality
    const servicesSwitch = document.getElementById('servicesSwitch');
    const servicesContent = document.getElementById('servicesContent');

    servicesSwitch.addEventListener('change', function() {
        if (this.checked) {
            servicesContent.classList.remove('hidden');
            servicesContent.classList.add('visible');
            return;
        }

        servicesContent.classList.remove('hidden');
        servicesContent.classList.remove('visible');
        servicesContent.classList.add('hidden');

        // Clear all service data when hiding
        document.getElementById('specialServicesContainer').innerHTML = '';
        document.getElementById('serviceSelect').value = '';
    });
    
    // Service data for dropdown
    const serviceData = {
        'WCHR': {
            name: 'Wheelchair (Ramp)',
            icon: 'bi-person-wheelchair',
            description: 'Passenger requiring wheelchair service to/from aircraft ramp'
        },
        'WCHS': {
            name: 'Wheelchair (Steps)',
            icon: 'bi-person-wheelchair',
            description: 'Passenger requiring wheelchair service to/from aircraft steps'
        },
        'WCHC': {
            name: 'Wheelchair (Cabin)',
            icon: 'bi-person-wheelchair',
            description: 'Passenger requiring wheelchair service to/from aircraft cabin seat'
        },
        'UM': {
            name: 'Unaccompanied Minor',
            icon: 'bi-person-badge',
            description: 'Child traveling without a parent or guardian'
        },
        'PETS': {
            name: 'Pets in Cabin',
            icon: 'bi-heart',
            description: 'Passenger traveling with pets in the cabin'
        },
        'AVIH': {
            name: 'Live Animals in Hold',
            icon: 'bi-box',
            description: 'Passenger traveling with live animals in cargo hold'
        },
        'PRM': {
            name: 'Passenger with Reduced Mobility',
            icon: 'bi-person-standing',
            description: 'Passenger requiring special assistance due to reduced mobility'
        }
    };
    
    // Add service functionality
    document.getElementById('addServiceBtn').addEventListener('click', function() {
        const serviceSelect = document.getElementById('serviceSelect');
        const serviceCode = serviceSelect.value;
        
        if (!serviceCode) {
            // Show warning if no service is selected
            serviceSelect.classList.add('is-invalid');
            setTimeout(() => {
                serviceSelect.classList.remove('is-invalid');
            }, 2000);
            return;
        }
        
        // Check if service already added
        const existingService = document.getElementById(`service-${serviceCode}`);
        if (existingService) {
            // Service already added, focus on it
            existingService.scrollIntoView({ behavior: 'smooth' });
            existingService.classList.add('border-warning');
            setTimeout(() => {
                existingService.classList.remove('border-warning');
            }, 2000);
            return;
        }
        
        const service = serviceData[serviceCode];
        const servicesContainer = document.getElementById('specialServicesContainer');
        
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.id = `service-${serviceCode}`;
        
        serviceItem.innerHTML = `
            <div class="service-header">
                <div class="service-title">
                    <i class="bi ${service.icon}"></i>
                    <span>${serviceCode} - ${service.name}</span>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm btn-remove-service">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="service-description">${service.description}</div>
            <div class="service-controls">
                <div class="service-count-group">
                    <label for="count-${serviceCode}" class="form-label">Count</label>
                    <input type="number" class="form-control service-count" id="count-${serviceCode}" min="0" placeholder="0">
                </div>
                <div class="service-seats-group">
                    <label class="form-label">Seat Numbers</label>
                    <div class="service-seats" id="seats-${serviceCode}">
                        <!-- Seat inputs will be added here based on count -->
                    </div>
                </div>
            </div>
        `;
        
        servicesContainer.appendChild(serviceItem);
        
        // Add event listener to the remove button
        serviceItem.querySelector('.btn-remove-service').addEventListener('click', function() {
            serviceItem.remove();
        });
        
        // Add event listener to the count input
        const countInput = document.getElementById(`count-${serviceCode}`);
        countInput.addEventListener('input', function() {
            const count = parseInt(this.value) || 0;
            updateSeatInputs(serviceCode, count);
        });
        
        // Reset the dropdown
        serviceSelect.value = '';
        
        // Focus on the count input
        countInput.focus();
    });
    
    // Function to update seat inputs
    function updateSeatInputs(serviceCode, count) {
        const seatsContainer = document.getElementById(`seats-${serviceCode}`);
        seatsContainer.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const seatInput = document.createElement('input');
            seatInput.type = 'text';
            seatInput.className = 'form-control seat-input';
            seatInput.placeholder = `Seat ${i + 1}`;
            seatInput.setAttribute('data-service', serviceCode);
            seatInput.setAttribute('data-seat-index', i);
            seatsContainer.appendChild(seatInput);
        }
    }
    
    // Bus Gate toggle functionality
    const busGateSwitch = document.getElementById('busGateSwitch');
    const busGateContent = document.getElementById('busGateContent');

    busGateSwitch.addEventListener('change', function() {
        if (this.checked) {
            busGateContent.classList.remove('hidden');
            busGateContent.classList.add('visible');
            return;
        }

        busGateContent.classList.remove('visible');
        busGateContent.classList.add('hidden');

        // Clear all bus data when hiding
        document.querySelectorAll('.bus-arrived-time, .bus-departed-time').forEach(input => {
            input.value = '';
        });

        // Reset all status elements
        document.querySelectorAll('#busGateContent .time-status').forEach(status => {
            status.textContent = 'TL';
            status.classList.remove('has-time');
        });

        // Reset to just one bus
        const busesContainer = document.getElementById('busesContainer');
        busesContainer.innerHTML = `
            <div class="bus-item">
                <div class="bus-number">Bus 1</div>
                <div class="bus-times">
                    <div class="bus-time-group">
                        <label class="form-label">Arrived Time</label>
                        <div class="time-input-group">
                            <input type="time" class="form-control bus-arrived-time">
                            <span class="time-status">TL</span>
                            <button type="button" class="btn btn-outline-secondary current-time-btn bus-time-btn" title="Set current time">
                                <i class="bi bi-clock"></i>
                            </button>
                        </div>
                    </div>
                    <div class="bus-time-group">
                        <label class="form-label">Departed Time</label>
                        <div class="time-input-group">
                            <input type="time" class="form-control bus-departed-time">
                            <span class="time-status">TL</span>
                            <button type="button" class="btn btn-outline-secondary current-time-btn bus-time-btn" title="Set current time">
                                <i class="bi bi-clock"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm btn-remove" style="visibility: hidden;">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        // Re-add event listeners to the new bus
        const newBusItem = busesContainer.querySelector('.bus-item');
        const newRemoveBtn = newBusItem.querySelector('.btn-remove');
        newRemoveBtn.addEventListener('click', function() {
            newBusItem.remove();
            updateBusNumbers();
        });
        
        newBusItem.querySelectorAll('.bus-time-btn').forEach(button => {
            button.addEventListener('click', function() {
                handleBusTimeButtonClick(this);
            });
        });
        
        newBusItem.querySelectorAll('input[type="time"]').forEach(input => {
            input.addEventListener('input', function() {
                const timeInputGroup = this.closest('.time-input-group');
                if (timeInputGroup) {
                    const statusElement = timeInputGroup.querySelector('.time-status');
                    if (statusElement) {
                        updateTimeStatus(this, statusElement);
                    }
                }
            });
        });
    });
    
    // Add bus functionality
    document.getElementById('addBusBtn').addEventListener('click', function() {
        const busesContainer = document.getElementById('busesContainer');
        const busCount = busesContainer.querySelectorAll('.bus-item').length + 1;
        
        const busItem = document.createElement('div');
        busItem.className = 'bus-item';
        busItem.innerHTML = `
            <div class="bus-number">Bus ${busCount}</div>
            <div class="bus-times">
                <div class="bus-time-group">
                    <label class="form-label">Arrived Time</label>
                    <div class="time-input-group">
                        <input type="time" class="form-control bus-arrived-time">
                        <span class="time-status">TL</span>
                        <button type="button" class="btn btn-outline-secondary current-time-btn bus-time-btn" title="Set current time">
                            <i class="bi bi-clock"></i>
                        </button>
                    </div>
                </div>
                <div class="bus-time-group">
                    <label class="form-label">Departed Time</label>
                    <div class="time-input-group">
                        <input type="time" class="form-control bus-departed-time">
                        <span class="time-status">TL</span>
                        <button type="button" class="btn btn-outline-secondary current-time-btn bus-time-btn" title="Set current time">
                            <i class="bi bi-clock"></i>
                        </button>
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm btn-remove">
                <i class="bi bi-trash"></i>
            </button>
        `;
        
        busesContainer.appendChild(busItem);
        
        // Show remove button for the first bus if there are now multiple buses
        const firstBusRemoveBtn = busesContainer.querySelector('.bus-item:first-child .btn-remove');
        if (firstBusRemoveBtn) {
            firstBusRemoveBtn.style.visibility = 'visible';
        }
        
        // Add event listener to the new remove button
        busItem.querySelector('.btn-remove').addEventListener('click', function() {
            busItem.remove();
            updateBusNumbers();
            
            // Hide remove button for the first bus if there's only one left
            if (busesContainer.querySelectorAll('.bus-item').length === 1) {
                busesContainer.querySelector('.bus-item:first-child .btn-remove').style.visibility = 'hidden';
            }
        });
        
        // Add event listeners to the new time buttons
        busItem.querySelectorAll('.bus-time-btn').forEach(button => {
            button.addEventListener('click', function() {
                handleBusTimeButtonClick(this);
            });
        });
        
        // Add event listeners to the new time inputs
        busItem.querySelectorAll('input[type="time"]').forEach(input => {
            input.addEventListener('input', function() {
                const timeInputGroup = this.closest('.time-input-group');
                if (timeInputGroup) {
                    const statusElement = timeInputGroup.querySelector('.time-status');
                    if (statusElement) {
                        updateTimeStatus(this, statusElement);
                    }
                }
            });
        });
        
        // Focus on the first time input of the new bus
        busItem.querySelector('.bus-arrived-time').focus();
    });
    
    // Function to handle bus time button clicks
    function handleBusTimeButtonClick(button) {
        const timeInputGroup = button.closest('.time-input-group');
        if (timeInputGroup) {
            const timeInput = timeInputGroup.querySelector('input[type="time"]');
            const statusElement = timeInputGroup.querySelector('.time-status');
            
            if (timeInput && statusElement) {
                timeInput.value = getCurrentTime();
                updateTimeStatus(timeInput, statusElement);
                
                // Visual feedback
                button.classList.remove('btn-outline-secondary');
                button.classList.add('btn-success');
                setTimeout(() => {
                    button.classList.remove('btn-success');
                    button.classList.add('btn-outline-secondary');
                }, 1000);
            }
        }
    }
    
    // Function to update bus numbers after removal
    function updateBusNumbers() {
        const busItems = document.querySelectorAll('#busesContainer .bus-item');
        busItems.forEach((item, index) => {
            item.querySelector('.bus-number').textContent = `Bus ${index + 1}`;
        });
    }
    
    // Remove bus functionality
    document.querySelectorAll('#busesContainer .btn-remove').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.bus-item').remove();
            updateBusNumbers();
            
            // Hide remove button for the first bus if there's only one left
            const busesContainer = document.getElementById('busesContainer');
            if (busesContainer.querySelectorAll('.bus-item').length === 1) {
                busesContainer.querySelector('.bus-item:first-child .btn-remove').style.visibility = 'hidden';
            }
        });
    });
    
    // Add event listeners to existing bus time buttons
    document.querySelectorAll('.bus-time-btn').forEach(button => {
        button.addEventListener('click', function() {
            handleBusTimeButtonClick(this);
        });
    });

    // Flight Crew Change toggle functionality
    const crewChangeSwitch = document.getElementById('crewChangeSwitch');
    const flightCrewChangeContent = document.getElementById('flightCrewChangeContent');
    const crewArrivedTimeInput = document.getElementById('crewArrivedTime');

    function setCrewChangeState(hasChange) {
        if (hasChange) {
            flightCrewChangeContent.classList.remove('hidden');
            flightCrewChangeContent.classList.add('visible');
            crewArrivedTimeInput.focus();
            return;
        }

        flightCrewChangeContent.classList.remove('visible');
        flightCrewChangeContent.classList.add('hidden');
        crewArrivedTimeInput.value = '';

        const crewStatus = flightCrewChangeContent.querySelector('.time-status');
        if (crewStatus) {
            crewStatus.textContent = 'TL';
            crewStatus.classList.remove('has-time');
        }
    }

    crewChangeSwitch.addEventListener('change', function() {
        setCrewChangeState(this.checked);
    });
    
    // Comments toggle functionality
    const commentsSwitch = document.getElementById('commentsSwitch');
    const commentsContent = document.getElementById('commentsContent');

    commentsSwitch.addEventListener('change', function() {
        if (this.checked) {
            commentsContent.classList.remove('hidden');
            commentsContent.classList.add('visible');

            // Focus on the comments textarea when shown
            document.getElementById('comments').focus();
            return;
        }

        commentsContent.classList.remove('hidden');
        commentsContent.classList.remove('visible');
        commentsContent.classList.add('hidden');

        // Clear comments when hiding
        document.getElementById('comments').value = '';
    });

    // Delay Codes toggle functionality
    const delayCodesSwitch = document.getElementById('delayCodesSwitch');
    const delayCodesContent = document.getElementById('delayCodesContent');
    const delayCodeSelect = document.getElementById('delayCodeSelect');
    const delayCodeNumberSelect = document.getElementById('delayCodeNumberSelect');
    const delayCodesContainer = document.getElementById('delayCodesContainer');
    let delayCodeItemCounter = 0;

    const delayCodeData = {
        '11': 'Aircraft damage/inspection',
        '31': 'Passenger handling delay',
        '32': 'Baggage handling delay',
        '33': 'Cargo/mail delay',
        '41': 'Ramp handling delay',
        '51': 'Fueling delay',
        '71': 'Weather at departure',
        '83': 'Air traffic flow restrictions'
    };

    delayCodesSwitch.addEventListener('change', function() {
        if (this.checked) {
            delayCodesContent.classList.remove('hidden');
            delayCodesContent.classList.add('visible');
            return;
        }

        delayCodesContent.classList.remove('visible');
        delayCodesContent.classList.add('hidden');

        // Clear all delay code data when hiding
        delayCodesContainer.innerHTML = '';
        delayCodeSelect.value = '';
        delayCodeNumberSelect.value = '';
    });

    delayCodeNumberSelect.addEventListener('change', function() {
        delayCodeSelect.value = this.value;
    });

    delayCodeSelect.addEventListener('change', function() {
        delayCodeNumberSelect.value = this.value;
    });

    document.getElementById('addDelayCodeBtn').addEventListener('click', function() {
        const code = delayCodeSelect.value;

        if (!code) {
            delayCodeSelect.classList.add('is-invalid');
            setTimeout(() => {
                delayCodeSelect.classList.remove('is-invalid');
            }, 2000);
            return;
        }

        delayCodeItemCounter += 1;
        const itemId = `delay-code-${delayCodeItemCounter}`;
        const description = delayCodeData[code] || 'Delay code';

        const delayItem = document.createElement('div');
        delayItem.className = 'delay-code-item';
        delayItem.id = itemId;
        delayItem.setAttribute('data-code', code);

        delayItem.innerHTML = `
            <div class="delay-code-header">
                <div class="delay-code-title">
                    <i class="bi bi-hourglass-split"></i>
                    <span>${code} - ${description}</span>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm btn-remove-delay-code">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="delay-code-controls">
                <label for="minutes-${itemId}" class="form-label">Minutes</label>
                <input type="number" class="form-control delay-code-minutes" id="minutes-${itemId}" min="0" placeholder="0">
            </div>
        `;

        delayCodesContainer.appendChild(delayItem);

        delayItem.querySelector('.btn-remove-delay-code').addEventListener('click', function() {
            delayItem.remove();
        });

        delayCodeSelect.value = '';
        delayCodeNumberSelect.value = '';
        delayItem.querySelector('.delay-code-minutes').focus();
    });
    
    // Form submission
    document.getElementById('boardingControlForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const form = document.getElementById('boardingControlForm');
        const formStatusMessage = document.getElementById('formStatusMessage');

        formStatusMessage.textContent = '';
        formStatusMessage.classList.remove('error', 'success', 'visible');

        const missingFields = getMissingRequiredFields(form);
        if (missingFields.length > 0) {
            formStatusMessage.textContent = `Missing required fields: ${missingFields.join(', ')}.`;
            formStatusMessage.classList.add('error', 'visible');
            return;
        }
        
        // Collect agent data
        const agents = [];
        document.querySelectorAll('#agentsContainer .agent-item').forEach(item => {
            const name = item.querySelector('.agent-name').value.trim();
            const time = item.querySelector('.agent-time input[type="time"]').value;
            
            if (name) {
                agents.push({
                    name: name,
                    arrivedTime: time || 'TL'
                });
            }
        });
        
        // Collect bus gate data
        const busGateData = {
            hasBusGate: !busGateContent.classList.contains('hidden'),
            buses: []
        };
        
        if (busGateData.hasBusGate) {
            document.querySelectorAll('#busesContainer .bus-item').forEach(item => {
                const busNumber = item.querySelector('.bus-number').textContent;
                const arrivedTime = item.querySelector('.bus-arrived-time').value;
                const departedTime = item.querySelector('.bus-departed-time').value;
                
                busGateData.buses.push({
                    busNumber: busNumber,
                    arrivedTime: arrivedTime || 'TL',
                    departedTime: departedTime || 'TL'
                });
            });
        }
        
        // Collect special services data
        const specialServices = {};
        const servicesVisible = !servicesContent.classList.contains('hidden');
        
        if (servicesVisible) {
            document.querySelectorAll('.service-item').forEach(item => {
                const serviceCode = item.id.replace('service-', '');
                const countInput = document.getElementById(`count-${serviceCode}`);
                const count = parseInt(countInput.value) || 0;
                
                if (count > 0) {
                    const seats = [];
                    document.querySelectorAll(`#seats-${serviceCode} .seat-input`).forEach(seatInput => {
                        if (seatInput.value.trim()) {
                            seats.push(seatInput.value.trim());
                        }
                    });
                    
                    specialServices[serviceCode] = {
                        count: count,
                        seats: seats
                    };
                }
            });
        }
        
        // Collect comments data
        const commentsVisible = !commentsContent.classList.contains('hidden');
        const commentsText = commentsVisible ? document.getElementById('comments').value.trim() : '';

        // Collect flight crew change data
        const hasFlightCrewChange = crewChangeSwitch.checked;
        const crewArrivedTime = hasFlightCrewChange ? (crewArrivedTimeInput.value || 'TL') : 'TL';

        // Collect delay codes data
        const delayCodesVisible = !delayCodesContent.classList.contains('hidden');
        const delayCodes = [];

        if (delayCodesVisible) {
            document.querySelectorAll('#delayCodesContainer .delay-code-item').forEach(item => {
                const code = item.getAttribute('data-code');
                const minutesInput = item.querySelector('.delay-code-minutes');
                const minutes = parseInt(minutesInput.value, 10);

                delayCodes.push({
                    code: code,
                    description: delayCodeData[code] || '',
                    minutes: Number.isNaN(minutes) ? 0 : minutes
                });
            });
        }
        
        // Collect form data
        const formData = {
            flightInfo: {
                flightNumber: document.getElementById('flightNumber').value,
                destination: document.getElementById('destination').value,
                gate: document.getElementById('gate').value,
                date: document.getElementById('date').value,
                aircraft: document.getElementById('aircraft') ? document.getElementById('aircraft').value : ''
            },
            scheduledActualTimes: {
                sta: document.getElementById('sta').value || 'TL',
                std: document.getElementById('std').value || 'TL',
                ata: document.getElementById('ata').value || 'TL',
                atd: document.getElementById('atd').value || 'TL'
            },
            agents: agents,
            times: {
                boardingStart: document.getElementById('boardingStart').value || 'TL',
                boardingClose: document.getElementById('boardingClose').value || 'TL',
                gateOpen: document.getElementById('gateOpen').value || 'TL',
                gateClose: document.getElementById('gateClose').value || 'TL',
                lastCall: document.getElementById('lastCall').value || 'TL',
                doorsClosed: document.getElementById('doorsClosed').value || 'TL'
            },
            bagsData: {
                totalBags: document.getElementById('totalBags').value,
                offloadBagsRequest: document.getElementById('offloadBagsRequest').value,
                gateBagsCharged: document.getElementById('gateBagsCharged').value,
                totalChargedAmount: document.getElementById('totalChargedAmount').value,
                gateBagsTagged: document.getElementById('gateBagsTagged').value
            },
            passengerData: {
                paxAcceptedAdult: document.getElementById('paxAcceptedAdult').value,
                paxAcceptedInfant: document.getElementById('paxAcceptedInfant').value,
                paxBoardedAdult: document.getElementById('paxBoardedAdult').value,
                paxBoardedInfant: document.getElementById('paxBoardedInfant').value,
                paxOffloaded: document.getElementById('paxOffloaded').value,
                noShow: document.getElementById('noShow').value
            },
            specialServices: {
                hasServices: servicesVisible,
                services: specialServices
            },
            busGate: busGateData,
            flightCrewChange: {
                hasCrewChange: hasFlightCrewChange,
                crewArrivedTime: crewArrivedTime
            },
            delayCodes: {
                hasDelayCodes: delayCodesVisible,
                codes: delayCodes
            },
            comments: {
                hasComments: commentsVisible,
                text: commentsText
            },
            delivery: {
                recipientEmail: document.getElementById('recipientEmail').value.trim()
            }
        };
        
        // POST to server — server generates PDF and sends email with it as attachment
        console.log('Form Data:', formData);

        formStatusMessage.textContent = 'Sending…';
        formStatusMessage.classList.remove('error', 'success');
        formStatusMessage.classList.add('visible');

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                formStatusMessage.textContent = `Success! Email with PDF sent to ${formData.delivery.recipientEmail}.`;
                formStatusMessage.classList.remove('error');
                formStatusMessage.classList.add('success');
            } else {
                formStatusMessage.textContent = `Error: ${result.message || 'Failed to submit form.'}`;
                formStatusMessage.classList.remove('success');
                formStatusMessage.classList.add('error');
            }
        } catch (err) {
            console.error('Submit error:', err);
            formStatusMessage.textContent = 'Network error: Could not reach the server. Make sure server.js is running (npm start).';
            formStatusMessage.classList.remove('success');
            formStatusMessage.classList.add('error');
        }

        // Auto-remove the alert after 7 seconds
        setTimeout(() => {
            formStatusMessage.textContent = '';
            formStatusMessage.classList.remove('error', 'success', 'visible');
        }, 7000);
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form?')) {
            document.getElementById('boardingControlForm').reset();
            
            // Reset all time status elements
            document.querySelectorAll('.time-status').forEach(status => {
                status.textContent = 'TL';
                status.classList.remove('has-time');
            });
            
            // Reset today's date
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date').value = today;
            
            // Reset agents to just one
            const agentsContainer = document.getElementById('agentsContainer');
            agentsContainer.innerHTML = `
                <div class="agent-item">
                    <input type="text" class="form-control agent-name" placeholder="Agent name" required>
                    <div class="time-input-group agent-time">
                        <input type="time" class="form-control" placeholder="Arrived time" required>
                        <span class="time-status">TL</span>
                        <button type="button" class="btn btn-outline-secondary current-time-btn" title="Set current time">
                            <i class="bi bi-clock"></i>
                        </button>
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm btn-remove">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            
            // Reset bus gate to hidden state
            busGateSwitch.checked = false;
            busGateSwitch.dispatchEvent(new Event('change'));

            // Reset special services to hidden state
            servicesSwitch.checked = false;
            servicesSwitch.dispatchEvent(new Event('change'));

            // Reset comments to hidden state
            commentsSwitch.checked = false;
            commentsSwitch.dispatchEvent(new Event('change'));

            // Reset delay codes to hidden state
            delayCodesSwitch.checked = false;
            delayCodesSwitch.dispatchEvent(new Event('change'));

            // Reset flight crew change to "No"
            crewChangeSwitch.checked = false;
            setCrewChangeState(false);
            
            // Re-add event listeners for the newly created agent
            const newAgentItem = agentsContainer.querySelector('.agent-item');
            newAgentItem.querySelector('.btn-remove').addEventListener('click', function() {
                this.closest('.agent-item').remove();
            });
            newAgentItem.querySelector('.current-time-btn').addEventListener('click', function() {
                handleTimeButtonClick(this);
            });
            const resetAgentTimeInput = newAgentItem.querySelector('input[type="time"]');
            const resetAgentStatusEl = newAgentItem.querySelector('.time-status');
            resetAgentTimeInput.addEventListener('input', function() {
                updateTimeStatus(this, resetAgentStatusEl);
            });

            const formStatusMessage = document.getElementById('formStatusMessage');
            formStatusMessage.textContent = '';
            formStatusMessage.classList.remove('error', 'success', 'visible');
        }
    });
});