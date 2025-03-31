// DOM Elements
const addBtn = document.getElementById('add-btn');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const currentTimeDisplay = document.getElementById('current-time');
const ganttChart = document.getElementById('gantt-chart');
const processTable = document.getElementById('process-table');
const avgWaitDisplay = document.getElementById('avg-wait');
const avgTurnaroundDisplay = document.getElementById('avg-turnaround');

// Simulation Variables
let processes = [];
let currentTime = 0;
let simulationInterval;
let isRunning = false;
const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

// Add Process
addBtn.addEventListener('click', () => {
    const pid = document.getElementById('pid').value || processes.length + 1;
    const arrival = document.getElementById('arrival').value || 0;
    const burst = document.getElementById('burst').value || 1;
    
    processes.push(new Process(pid, parseInt(arrival), parseInt(burst)));
    updateProcessTable();
    
    // Clear inputs
    document.getElementById('pid').value = '';
    document.getElementById('arrival').value = '';
    document.getElementById('burst').value = '';
});

// Start Simulation
startBtn.addEventListener('click', () => {
    if (processes.length === 0) {
        alert('Please add at least one process');
        return;
    }
    
    if (isRunning) return;
    isRunning = true;
    
    simulationInterval = setInterval(() => {
        runSRTScheduler();
        currentTime++;
        currentTimeDisplay.textContent = currentTime;
    }, 1000); // 1 second = 1 time unit
});

// Reset Simulation
resetBtn.addEventListener('click', () => {
    clearInterval(simulationInterval);
    processes = [];
    currentTime = 0;
    isRunning = false;
    currentTimeDisplay.textContent = '0';
    ganttChart.innerHTML = '';
    processTable.innerHTML = '';
    avgWaitDisplay.textContent = '0.00';
    avgTurnaroundDisplay.textContent = '0.00';
});

// SRT Scheduler Algorithm
function runSRTScheduler() {
    // Add arriving processes to ready queue
    const readyQueue = processes.filter(p => 
        p.arrivalTime <= currentTime && p.remainingTime > 0
    );
    
    if (readyQueue.length > 0) {
        // Sort by remaining time (SRT principle)
        readyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        const currentProcess = readyQueue[0];
        
        // Execute the process
        currentProcess.execute();
        
        // Mark as started if first execution
        if (!currentProcess.started) {
            currentProcess.started = true;
        }
        
        // Update waiting times for other ready processes
        readyQueue.slice(1).forEach(p => p.waitingTime++);
        
        // Add to Gantt chart
        addToGanttChart(currentProcess.pid);
        
        // Check if process completed
        if (currentProcess.isCompleted()) {
            currentProcess.completionTime = currentTime + 1;
        }
    } else {
        // CPU is idle
        addToGanttChart('IDLE');
    }
    
    // Check if all processes completed
    if (processes.every(p => p.isCompleted())) {
        clearInterval(simulationInterval);
        isRunning = false;
        calculateMetrics();
    }
}

// Helper Functions
function addToGanttChart(pid) {
    const block = document.createElement('div');
    block.className = 'time-block';
    block.textContent = pid;
    
    if (pid === 'IDLE') {
        block.classList.add('idle-block');
    } else {
        block.style.backgroundColor = colors[(pid - 1) % colors.length];
    }
    
    ganttChart.appendChild(block);
    ganttChart.scrollLeft = ganttChart.scrollWidth;
}

function updateProcessTable() {
    processTable.innerHTML = '<h3>Processes</h3>';
    processes.forEach(p => {
        const pInfo = document.createElement('div');
        pInfo.innerHTML = `
            <p>P${p.pid}: AT=${p.arrivalTime}, BT=${p.burstTime}</p>
        `;
        processTable.appendChild(pInfo);
    });
}

function calculateMetrics() {
    const totalWait = processes.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaround = processes.reduce((sum, p) => sum + (p.completionTime - p.arrivalTime), 0);
    
    avgWaitDisplay.textContent = (totalWait / processes.length).toFixed(2);
    avgTurnaroundDisplay.textContent = (totalTurnaround / processes.length).toFixed(2);
}