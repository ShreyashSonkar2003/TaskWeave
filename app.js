// Fetch elements
const processInputContainer = document.getElementById('processInputContainer');
const algorithmSelect = document.getElementById('algorithm');
const timeQuantumInput = document.getElementById('timeQuantumInput');
const timeQuantum = document.getElementById('timeQuantum');
const ganttCanvas = document.getElementById('ganttChart');
const ganttCtx = ganttCanvas.getContext('2d');
const resultOutput = document.getElementById('simulationResult');
const detailedResultOutput = document.getElementById('detailedResult');

// Display time quantum input only for Round Robin
algorithmSelect.addEventListener('change', function () {
    if (algorithmSelect.value === 'rr') {
        timeQuantumInput.style.display = 'block';
    } else {
        timeQuantumInput.style.display = 'none';
    }
});

// Function to parse input
function parseInput() {
    const processes = [];
    const inputs = processInputContainer.getElementsByClassName('process-input');
    
    for (let input of inputs) {
        const id = input.querySelector('.processId').value.trim();
        const arrival = parseInt(input.querySelector('.arrivalTime').value.trim());
        const burst = parseInt(input.querySelector('.burstTime').value.trim());
        
        if (id && !isNaN(arrival) && !isNaN(burst)) {
            processes.push({
                id: id,
                arrivalTime: arrival,
                burstTime: burst,
            });
        }
    }
    return processes;
}

// FCFS Algorithm
function fcfs(processes) {
    let time = 0;
    const ganttData = [];
    
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    processes.forEach((proc) => {
        if (time < proc.arrivalTime) time = proc.arrivalTime;
        ganttData.push({ id: proc.id, start: time, end: time + proc.burstTime });
        time += proc.burstTime;
    });
    
    return ganttData;
}

// SJF Algorithm (Non-Preemptive)
function sjf(processes) {
    let time = 0;
    const ganttData = [];
    const queue = [];

    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    while (processes.length > 0 || queue.length > 0) {
        while (processes.length > 0 && processes[0].arrivalTime <= time) {
            queue.push(processes.shift());
        }
        
        if (queue.length > 0) {
            queue.sort((a, b) => a.burstTime - b.burstTime);
            const proc = queue.shift();
            ganttData.push({ id: proc.id, start: time, end: time + proc.burstTime });
            time += proc.burstTime;
        } else {
            time++;
        }
    }

    return ganttData;
}

// Round Robin Algorithm (FINAL version)
function roundRobin(processes, quantum) {
    let time = 0;
    const queue = [];
    const ganttData = [];
    const remainingBurstTimes = {};

    processes.forEach(proc => remainingBurstTimes[proc.id] = proc.burstTime);
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    while (processes.length > 0 || queue.length > 0) {
        while (processes.length > 0 && processes[0].arrivalTime <= time) {
            queue.push(processes.shift());
        }
        
        if (queue.length > 0) {
            const proc = queue.shift();
            const burst = Math.min(quantum, remainingBurstTimes[proc.id]);
            
            ganttData.push({ id: proc.id, start: time, end: time + burst });
            time += burst;
            remainingBurstTimes[proc.id] -= burst;
            
            if (remainingBurstTimes[proc.id] > 0) {
                queue.push(proc);
            }
        } else {
            time++;
        }
    }

    return ganttData;
}

// Draw Gantt Chart (FINAL version)
function drawGanttChart(ganttData) {
    const chartHeight = ganttCanvas.height;
    const totalDuration = ganttData[ganttData.length - 1].end;
    const unitWidth = 50;
    const chartWidth = totalDuration * unitWidth;
    
    ganttCanvas.width = chartWidth;
    ganttCtx.clearRect(0, 0, chartWidth, chartHeight);
    
    ganttData.forEach((block, index) => {
        const startX = block.start * unitWidth;
        const blockWidth = (block.end - block.start) * unitWidth;
        
        ganttCtx.fillStyle = `hsl(${index * 90}, 70%, 50%)`;
        ganttCtx.fillRect(startX, 50, blockWidth, 50);
        
        ganttCtx.fillStyle = 'white';
        ganttCtx.font = "16px Arial";
        ganttCtx.textAlign = "center";
        ganttCtx.fillText(block.id, startX + blockWidth / 2, 80);
        
        ganttCtx.fillStyle = 'black';
        ganttCtx.textAlign = "left";
        ganttCtx.fillText(block.start, startX, 120);
        
        ganttCtx.textAlign = "right";
        ganttCtx.fillText(block.end, startX + blockWidth - 2, 120);
    });
}

// Start Simulation (FINAL version)
function startSimulation() {
    const processes = parseInput();
    const algorithm = algorithmSelect.value;
    const quantum = parseInt(timeQuantum.value);
    
    let ganttData = [];

    if (algorithm === 'fcfs') ganttData = fcfs(processes);
    else if (algorithm === 'sjf') ganttData = sjf(processes);
    else if (algorithm === 'rr') ganttData = roundRobin(processes, quantum);
    
    drawGanttChart(ganttData);
    resultOutput.innerText = `Results for ${algorithm.toUpperCase()} scheduling:`;
    
    let detailed = "";
    ganttData.forEach(b => {
        detailed += `Process ${b.id} runs from ${b.start} to ${b.end}.\n`;
    });
    
    detailedResultOutput.innerText = detailed;
}

// Add Process dynamically
document.getElementById("addProcessBtn").addEventListener("click", function () {
    addProcess();
});

function addProcess() {
    const processContainer = document.getElementById("processInputContainer");

    const processDiv = document.createElement("div");
    processDiv.classList.add("process-input");

    processDiv.innerHTML = `
        <input type="text" class="processId" placeholder="Process ID" />
        <input type="number" class="arrivalTime" placeholder="Arrival Time" />
        <input type="number" class="burstTime" placeholder="Burst Time" />
        <button class="deleteProcessBtn">Delete</button>
    `;

    processContainer.appendChild(processDiv);

    processDiv.querySelector(".deleteProcessBtn").addEventListener("click", function () {
        processDiv.remove();
    });
}
