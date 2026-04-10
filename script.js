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
        
        // Find the parent time-input-group
        const timeInputGroup = button.closest('.time-input-group');
        if (timeInputGroup) {
            timeInput = timeInputGroup.querySelector('input[type="time"]');
            statusElement = timeInputGroup.querySelector('.time-status');
        }
        
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
    
    // Add event listeners to all time buttons
    document.querySelectorAll('.current-time-btn').forEach(button => {
        button.addEventListener('click', function() {
            handleTimeButtonClick(this);
        });
    });
    
    // Add event listeners to all time inputs to update status
    document.querySelectorAll('input[type="time"]').forEach(input => {
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
    
    // Add agent functionality
    document.getElementById('addAgentBtn').addEventListener('click', function() {
        const agentsContainer = document.getElementById('agentsContainer');
        const agentItem = document.createElement('div');
        agentItem.className = 'agent-item';
        agentItem.innerHTML = `
            <input type="text" class="form-control agent-name" placeholder="Agent name" required>
            <div class="input-group agent-time">
                <input type="time" class="form-control" placeholder="Arrived time">
                <span class="input-group-text time-status">TL</span>
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
    const servicesYesBtn = document.getElementById('servicesYesBtn');
    const servicesNoBtn = document.getElementById('servicesNoBtn');
    const servicesContent = document.getElementById('servicesContent');
    
    servicesYesBtn.addEventListener('click', function() {
        servicesYesBtn.classList.add('active');
        servicesNoBtn.classList.remove('active');
        servicesContent.classList.remove('hidden');
        servicesContent.classList.add('visible');
    });
    
    servicesNoBtn.addEventListener('click', function() {
        servicesNoBtn.classList.add('active');
        servicesYesBtn.classList.remove('active');
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
    const busGateYesBtn = document.getElementById('busGateYesBtn');
    const busGateNoBtn = document.getElementById('busGateNoBtn');
    const busGateContent = document.getElementById('busGateContent');
    
    busGateYesBtn.addEventListener('click', function() {
        busGateYesBtn.classList.add('active');
        busGateNoBtn.classList.remove('active');
        busGateContent.classList.remove('hidden');
        busGateContent.classList.add('visible');
    });
    
    busGateNoBtn.addEventListener('click', function() {
        busGateNoBtn.classList.add('active');
        busGateYesBtn.classList.remove('active');
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
    
    // Comments toggle functionality
    const commentsYesBtn = document.getElementById('commentsYesBtn');
    const commentsNoBtn = document.getElementById('commentsNoBtn');
    const commentsContent = document.getElementById('commentsContent');
    
    commentsYesBtn.addEventListener('click', function() {
        commentsYesBtn.classList.add('active');
        commentsNoBtn.classList.remove('active');
        commentsContent.classList.remove('hidden');
        commentsContent.classList.add('visible');
        
        // Focus on the comments textarea when shown
        document.getElementById('comments').focus();
    });
    
    commentsNoBtn.addEventListener('click', function() {
        commentsNoBtn.classList.add('active');
        commentsYesBtn.classList.remove('active');
        commentsContent.classList.remove('visible');
        commentsContent.classList.add('hidden');
        
        // Clear comments when hiding
        document.getElementById('comments').value = '';
    });
    
    // Form submission
    document.getElementById('boardingControlForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
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
        
        // Collect form data
        const formData = {
            flightInfo: {
                flightNumber: document.getElementById('flightNumber').value,
                destination: document.getElementById('destination').value,
                gate: document.getElementById('gate').value,
                date: document.getElementById('date').value,
                aircraft: document.getElementById('aircraft').value
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
            comments: {
                hasComments: commentsVisible,
                text: commentsText
            }
        };
        
        // Here you would typically send the data to a server
        console.log('Form Data:', formData);
        
        // Show success message
        const servicesText = servicesVisible ? `with ${Object.keys(specialServices).length} special service(s)` : 'without special services';
        const busGateText = busGateData.hasBusGate ? `with ${busGateData.buses.length} bus(es)` : 'without bus gate';
        const commentsTextDisplay = commentsVisible ? (commentsText ? 'with comments' : 'with empty comments section') : 'without comments';
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success alert-dismissible fade show';
        successAlert.innerHTML = `
            <strong>Success!</strong> Boarding control form has been submitted with ${agents.length} agent(s), ${servicesText}, ${busGateText}, and ${commentsTextDisplay}.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(successAlert, formContainer.firstChild);
        
        // Auto-remove the alert after 5 seconds
        setTimeout(() => {
            successAlert.remove();
        }, 5000);
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
                    <div class="input-group agent-time">
                        <input type="time" class="form-control" placeholder="Arrived time">
                        <span class="input-group-text time-status">TL</span>
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
            busGateNoBtn.click();
            
            // Reset special services to hidden state
            servicesNoBtn.click();
            
            // Reset comments to hidden state
            commentsNoBtn.click();
            
            // Re-add event listeners
            document.querySelector('.btn-remove').addEventListener('click', function() {
                this.closest('.agent-item').remove();
            });
            
            document.querySelector('.current-time-btn').addEventListener('click', function() {
                handleTimeButtonClick(this);
            });
            
            document.querySelector('input[type="time"]').addEventListener('input', function() {
                const timeInputGroup = this.closest('.time-input-group');
                if (timeInputGroup) {
                    const statusElement = timeInputGroup.querySelector('.time-status');
                    if (statusElement) {
                        updateTimeStatus(this, statusElement);
                    }
                }
            });
        }
    });
});