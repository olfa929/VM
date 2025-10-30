// Sample users data
let users = JSON.parse(localStorage.getItem('users')) || [
    {
        username: 'admin',
        password: 'admin',
        role: 'admin'
    }
];

// Sample machine data - start with empty array
let machines = JSON.parse(localStorage.getItem('machines')) || [
    {
        id: 1,
        deviceName: "Compressor A",
        deviceEui: "0011223344556677",
        joinEui: "AABBCCDDEEFF0011",
        deviceProfile: "Industrial Compressor"
    },
    {
        id: 2,
        deviceName: "Motor B",
        deviceEui: "8899001122334455",
        joinEui: "2233445566778899",
        deviceProfile: "Industrial Motor"
    },
    {
        id: 3,
        deviceName: "Pump C",
        deviceEui: "FFEEDDCCBBAA9988",
        joinEui: "9988776655443322",
        deviceProfile: "Industrial Pump"
    }
];

// DOM elements
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkLoginStatus();
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Check if admin credentials
            if (username === 'admin' && password === 'admin') {
                // Store login status
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('userRole', 'admin');
                alert('Admin login successful!');
                window.location.href = 'machines.html';
            } else {
                // Check if regular user
                const user = users.find(u => u.username === username && u.password === password);
                if (user) {
                    // Store login status
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('userRole', 'user');
                    alert('User login successful!');
                    window.location.href = 'machines.html';
                } else {
                    alert('Invalid username or password!');
                }
            }
        });
    }
    
    // Register form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Check if username already exists
            if (users.find(u => u.username === username)) {
                alert('Username already exists!');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Add new user
            const newUser = {
                username: username,
                password: password,
                role: 'user'
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('Registration successful!');
            window.location.href = 'login.html';
        });
    }
    
    // Machine list page
    const machinesTable = document.getElementById('machinesTable');
    if (machinesTable) {
        renderMachinesTable(machines);
        setupSearchAndFilters();
        
        // Add machine button
        document.getElementById('addMachineBtn').addEventListener('click', function() {
            // Both admin and regular users can add machines
            showAddMachineModal();
        });
    }
    
    // Machine detail page
    const machineDetailPage = document.querySelector('.machine-detail');
    if (machineDetailPage) {
        // Render chart
        renderVibrationChart();
    }
});

// Check login status
function checkLoginStatus() {
    const loggedIn = localStorage.getItem('loggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    // If not logged in, allow access to homepage, login, and register pages
    // Redirect to homepage for all other pages
    if (!loggedIn && !['index.html', 'login.html', 'register.html', ''].includes(currentPage)) {
        window.location.href = 'index.html';
    }
    
    // If logged in and on login/register page, redirect to machines
    if (loggedIn && ['login.html', 'register.html'].includes(currentPage)) {
        window.location.href = 'machines.html';
    }
    
    // If logged in and on homepage, redirect to machines
    if (loggedIn && ['index.html', ''].includes(currentPage)) {
        window.location.href = 'machines.html';
    }
}

// Render machines table
function renderMachinesTable(machinesData) {
    const tbody = document.querySelector('#machinesTable tbody');
    tbody.innerHTML = '';
    
    machinesData.forEach(machine => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${machine.deviceName}</td>
            <td>${machine.deviceEui}</td>
            <td>${machine.joinEui}</td>
            <td>${machine.deviceProfile}</td>
            <td><button class="view-btn" data-id="${machine.id}">View</button></td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function() {
            const machineId = this.getAttribute('data-id');
            window.location.href = `machine-detail.html?id=${machineId}`;
        });
    });
}

// Setup search and filters
function setupSearchAndFilters() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        filterMachines();
    });
    
    // Filter selects
    const deviceNameFilter = document.getElementById('deviceNameFilter');
    const deviceEuiFilter = document.getElementById('deviceEuiFilter');
    const joinEuiFilter = document.getElementById('joinEuiFilter');
    const deviceProfileFilter = document.getElementById('deviceProfileFilter');
    
    // Populate filter options
    populateFilterOptions();
    
    // Add event listeners to filters
    deviceNameFilter.addEventListener('change', filterMachines);
    deviceEuiFilter.addEventListener('change', filterMachines);
    joinEuiFilter.addEventListener('change', filterMachines);
    deviceProfileFilter.addEventListener('change', filterMachines);
}

// Populate filter options
function populateFilterOptions() {
    const deviceNameFilter = document.getElementById('deviceNameFilter');
    const deviceEuiFilter = document.getElementById('deviceEuiFilter');
    const joinEuiFilter = document.getElementById('joinEuiFilter');
    const deviceProfileFilter = document.getElementById('deviceProfileFilter');
    
    // Clear existing options except the first one
    deviceNameFilter.innerHTML = '<option value="">All Device Names</option>';
    deviceEuiFilter.innerHTML = '<option value="">All Device EUIs</option>';
    joinEuiFilter.innerHTML = '<option value="">All Join EUIs</option>';
    deviceProfileFilter.innerHTML = '<option value="">All Device Profiles</option>';
    
    // Get unique values for each filter
    const deviceNames = [...new Set(machines.map(m => m.deviceName))];
    const deviceEuis = [...new Set(machines.map(m => m.deviceEui))];
    const joinEuis = [...new Set(machines.map(m => m.joinEui))];
    const deviceProfiles = [...new Set(machines.map(m => m.deviceProfile))];
    
    // Populate device name filter
    deviceNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        deviceNameFilter.appendChild(option);
    });
    
    // Populate device EUI filter
    deviceEuis.forEach(eui => {
        const option = document.createElement('option');
        option.value = eui;
        option.textContent = eui;
        deviceEuiFilter.appendChild(option);
    });
    
    // Populate join EUI filter
    joinEuis.forEach(eui => {
        const option = document.createElement('option');
        option.value = eui;
        option.textContent = eui;
        joinEuiFilter.appendChild(option);
    });
    
    // Populate device profile filter
    deviceProfiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile;
        option.textContent = profile;
        deviceProfileFilter.appendChild(option);
    });
}

// Filter machines based on search and filters
function filterMachines() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const deviceNameFilter = document.getElementById('deviceNameFilter').value;
    const deviceEuiFilter = document.getElementById('deviceEuiFilter').value;
    const joinEuiFilter = document.getElementById('joinEuiFilter').value;
    const deviceProfileFilter = document.getElementById('deviceProfileFilter').value;
    
    const filteredMachines = machines.filter(machine => {
        // Check search term
        const matchesSearch =
            machine.deviceName.toLowerCase().includes(searchTerm) ||
            machine.deviceEui.toLowerCase().includes(searchTerm) ||
            machine.joinEui.toLowerCase().includes(searchTerm) ||
            machine.deviceProfile.toLowerCase().includes(searchTerm);
        
        // Check filters
        const matchesDeviceName = deviceNameFilter ? machine.deviceName === deviceNameFilter : true;
        const matchesDeviceEui = deviceEuiFilter ? machine.deviceEui === deviceEuiFilter : true;
        const matchesJoinEui = joinEuiFilter ? machine.joinEui === joinEuiFilter : true;
        const matchesDeviceProfile = deviceProfileFilter ? machine.deviceProfile === deviceProfileFilter : true;
        
        return matchesSearch && matchesDeviceName && matchesDeviceEui && matchesJoinEui && matchesDeviceProfile;
    });
    
    renderMachinesTable(filteredMachines);
}

// Render machines table
function renderMachinesTable(machinesData) {
    const tbody = document.querySelector('#machinesTable tbody');
    tbody.innerHTML = '';
    
    const userRole = localStorage.getItem('userRole');
    
    machinesData.forEach(machine => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${machine.deviceName}</td>
            <td>${machine.deviceEui}</td>
            <td>${machine.joinEui}</td>
            <td>${machine.deviceProfile}</td>
            <td>
                <button class="view-btn" data-id="${machine.id}">View</button>
                ${userRole === 'admin' ? `<button class="delete-btn" data-id="${machine.id}">Delete</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function() {
            const machineId = this.getAttribute('data-id');
            window.location.href = `machine-detail.html?id=${machineId}`;
        });
    });
    
    // Add event listeners to delete buttons (for admin users)
    if (userRole === 'admin') {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const machineId = this.getAttribute('data-id');
                deleteMachine(machineId);
            });
        });
    }
}

// Delete machine function (admin only)
function deleteMachine(machineId) {
    if (confirm('Are you sure you want to delete this machine?')) {
        // Remove machine from array
        machines = machines.filter(machine => machine.id != machineId);
        // Update localStorage
        localStorage.setItem('machines', JSON.stringify(machines));
        // Refresh the table
        filterMachines();
        populateFilterOptions();
        alert('Machine deleted successfully!');
    }
}

// Setup search and filters
function setupSearchAndFilters() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        filterMachines();
    });
    
    // Filter selects
    const deviceNameFilter = document.getElementById('deviceNameFilter');
    const deviceEuiFilter = document.getElementById('deviceEuiFilter');
    const joinEuiFilter = document.getElementById('joinEuiFilter');
    const deviceProfileFilter = document.getElementById('deviceProfileFilter');
    
    // Populate filter options
    populateFilterOptions();
    
    // Add event listeners to filters
    deviceNameFilter.addEventListener('change', filterMachines);
    deviceEuiFilter.addEventListener('change', filterMachines);
    joinEuiFilter.addEventListener('change', filterMachines);
    deviceProfileFilter.addEventListener('change', filterMachines);
}

// Populate filter options
function populateFilterOptions() {
    const deviceNameFilter = document.getElementById('deviceNameFilter');
    const deviceEuiFilter = document.getElementById('deviceEuiFilter');
    const joinEuiFilter = document.getElementById('joinEuiFilter');
    const deviceProfileFilter = document.getElementById('deviceProfileFilter');
    
    // Get unique values for each filter
    const deviceNames = [...new Set(machines.map(m => m.deviceName))];
    const deviceEuis = [...new Set(machines.map(m => m.deviceEui))];
    const joinEuis = [...new Set(machines.map(m => m.joinEui))];
    const deviceProfiles = [...new Set(machines.map(m => m.deviceProfile))];
    
    // Populate device name filter
    deviceNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        deviceNameFilter.appendChild(option);
    });
    
    // Populate device EUI filter
    deviceEuis.forEach(eui => {
        const option = document.createElement('option');
        option.value = eui;
        option.textContent = eui;
        deviceEuiFilter.appendChild(option);
    });
    
    // Populate join EUI filter
    joinEuis.forEach(eui => {
        const option = document.createElement('option');
        option.value = eui;
        option.textContent = eui;
        joinEuiFilter.appendChild(option);
    });
    
    // Populate device profile filter
    deviceProfiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile;
        option.textContent = profile;
        deviceProfileFilter.appendChild(option);
    });
}

// Filter machines based on search and filters
function filterMachines() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const deviceNameFilter = document.getElementById('deviceNameFilter').value;
    const deviceEuiFilter = document.getElementById('deviceEuiFilter').value;
    const joinEuiFilter = document.getElementById('joinEuiFilter').value;
    const deviceProfileFilter = document.getElementById('deviceProfileFilter').value;
    
    const filteredMachines = machines.filter(machine => {
        // Check search term
        const matchesSearch = 
            machine.deviceName.toLowerCase().includes(searchTerm) ||
            machine.deviceEui.toLowerCase().includes(searchTerm) ||
            machine.joinEui.toLowerCase().includes(searchTerm) ||
            machine.deviceProfile.toLowerCase().includes(searchTerm);
        
        // Check filters
        const matchesDeviceName = deviceNameFilter ? machine.deviceName === deviceNameFilter : true;
        const matchesDeviceEui = deviceEuiFilter ? machine.deviceEui === deviceEuiFilter : true;
        const matchesJoinEui = joinEuiFilter ? machine.joinEui === joinEuiFilter : true;
        const matchesDeviceProfile = deviceProfileFilter ? machine.deviceProfile === deviceProfileFilter : true;
        
        return matchesSearch && matchesDeviceName && matchesDeviceEui && matchesJoinEui && matchesDeviceProfile;
    });
    
    renderMachinesTable(filteredMachines);
}

// Show add machine modal
function showAddMachineModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('addMachineModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addMachineModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Add New Machine</h2>
                <form id="addMachineForm">
                    <div class="form-group">
                        <label for="newDeviceName">Device Name</label>
                        <input type="text" id="newDeviceName" name="deviceName" required>
                    </div>
                    <div class="form-group">
                        <label for="newDeviceEui">Device EUI</label>
                        <input type="text" id="newDeviceEui" name="deviceEui" required>
                    </div>
                    <div class="form-group">
                        <label for="newJoinEui">Join EUI</label>
                        <input type="text" id="newJoinEui" name="joinEui" required>
                    </div>
                    <div class="form-group">
                        <label for="newDeviceProfile">Device Profile</label>
                        <input type="text" id="newDeviceProfile" name="deviceProfile" required>
                    </div>
                    <button type="submit" class="btn">Add Machine</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close modal when close button is clicked
        modal.querySelector('.close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
        
        // Handle form submission
        document.getElementById('addMachineForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const newMachine = {
                id: machines.length > 0 ? Math.max(...machines.map(m => m.id)) + 1 : 1,
                deviceName: document.getElementById('newDeviceName').value,
                deviceEui: document.getElementById('newDeviceEui').value,
                joinEui: document.getElementById('newJoinEui').value,
                deviceProfile: document.getElementById('newDeviceProfile').value
            };
            
            machines.push(newMachine);
            localStorage.setItem('machines', JSON.stringify(machines));
            modal.style.display = 'none';
            filterMachines(); // Refresh the table
            populateFilterOptions(); // Update filter options
            alert('Machine added successfully!');
        });
    }
    
    // Reset form and show modal
    document.getElementById('addMachineForm').reset();
    modal.style.display = 'block';
}

// Render vibration chart
function renderVibrationChart() {
    try {
        const ctx = document.getElementById('vibrationChart').getContext('2d');
        // Destroy previous chart if it exists and is a Chart instance
        if (window.vibrationChart && typeof window.vibrationChart.destroy === 'function') {
            window.vibrationChart.destroy();
        }
        // Example vibration data
        const labels = ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'];
        const data = [2.1, 2.5, 2.3, 2.8, 3.0, 2.7, 2.9];
        window.vibrationChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vibration (mm/s)',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: false,
                scales: {
                    x: { title: { display: true, text: 'Time' } },
                    y: { title: { display: true, text: 'Vibration (mm/s)' } }
                }
            }
        });
    } catch (err) {
        console.error('Error rendering vibration chart:', err);
    }
}