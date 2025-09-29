// Fetch elements
const processInputContainer = document.getElementById("processInputBox");
const algorithmSelect = document.getElementById("algorithmSelect");
const timeQuantumInput = document.getElementById("quantumInputField");
const timeQuantum = document.getElementById("quantumDisplay");
const ganttCanvas = document.getElementById("ganttChartCanvas");
const ganttCtx = ganttCanvas.getContext('2d');
const resultOutput = document.getElementById("simulationResultBox");
const detailedResultOutput = document.getElementById("detailedResultBox");


// Display time quantum input only for Round Robin
algorithmSelect.addEventListener('change', function () {
    if (algorithmSelect.value === 'rr') {
        timeQuantumInput.style.display = 'block';
    } else {
        timeQuantumInput.style.display = 'none';
    }
});

// Function to add a new process input row
// document.getElementById("addProcessButton").addEventListener('click', () => {
//     const newProcessInput = document.createElement('div');
//     newProcessInput.classList.add("process-input-row");
//     newProcessInput.innerHTML = `
//         <input type="text" class="process-id-field" placeholder="Process ID" />
//         <input type="number" class="arrival-time-field" placeholder="Arrival Time" />
//         <input type="number" class="burst-time-field" placeholder="Burst Time" />
//     `;
//     processInputContainer.appendChild(newProcessInput);
// });

// Function to parse input
function parseInput() {
    const processes = [];
    const inputs = processInputContainer.getElementsByClassName("process-input-row");
    
    for (let input of inputs) {
        const id = input.querySelector('.process-id-field').value.trim();
        const arrival = parseInt(input.querySelector('.arrival-time-field').value.trim());
        const burst = parseInt(input.querySelector('.burst-time-field').value.trim());
        
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

// Function to simulate scheduling
function startSimulation() {
    const processes = parseInput();
    const algorithm = algorithmSelect.value;
    const timeQuantumVal = parseInt(timeQuantum.value);
    
    let ganttData = [];
    let detailedResult = '';
    
    if (algorithm === 'fcfs') {
        ganttData = fcfs(processes);
    } else if (algorithm === 'sjf') {
        ganttData = sjf(processes);
    } else if (algorithm === 'rr') {
        ganttData = roundRobin(processes, timeQuantumVal, detailedResult);
    }
    
    drawGanttChart(ganttData);
    resultOutput.innerText = `Results for ${algorithm.toUpperCase()} scheduling:`;
    detailedResultOutput.innerText = detailedResult;
}

// FCFS Algorithm
function fcfs(processes) {

    let isValid = true;
    const inputs = document.querySelectorAll('.process-input-row');

    inputs.forEach(input => {
        const id = input.querySelector('.process-id-field').value.trim();
        const arrival = input.querySelector('.arrival-time-field').value.trim();
        const burst = input.querySelector('.burst-time-field').value.trim();
        
        if (arrival === '' || burst === '') {
            alert('Process base entity cannot be empty!');
            isValid = false;
            return;
        }
        
        if (arrival === '' || isNaN(arrival) || parseInt(arrival) < 0) {
            alert('Arrival Time must be a non-negative number!');
            isValid = false;
            return;
        }
        
        if (burst === '' || isNaN(burst) || parseInt(burst) <= 0) {
            alert('Burst Time must be a positive number!');
            isValid = false;
            return;
        }
    });

    let time = 0;
    const ganttData = [];
    
    processes.sort((a, b) => a.arrival-time-field - b.arrival-time-field);  // Sort by arrival time
    
    processes.forEach((proc) => {
        if (time < proc.arrival-time-field) {
            time = proc.arrival-time-field;
        }
        ganttData.push({ id: proc.id, start: time, end: time + proc.burst-time-field });
        time += proc.burst-time-field;
    });
    
    return ganttData;
}

// SJF Algorithm (Non-Preemptive)
function sjf(processes) {

    let isValid = true;
    const inputs = document.querySelectorAll('.process-input-row');

    inputs.forEach(input => {
        const id = input.querySelector('.process-id-field').value.trim();
        const arrival = input.querySelector('.arrival-time-field').value.trim();
        const burst = input.querySelector('.burst-time-field').value.trim();
        
        if (arrival === '' || burst === '') {
            alert('Process base entity cannot be empty!');
            isValid = false;
            return;
        }
        
        if (arrival === '' || isNaN(arrival) || parseInt(arrival) < 0) {
            alert('Arrival Time must be a non-negative number!');
            isValid = false;
            return;
        }
        
        if (burst === '' || isNaN(burst) || parseInt(burst) <= 0) {
            alert('Burst Time must be a positive number!');
            isValid = false;
            return;
        }
    });

    let time = 0;
    const ganttData = [];
    const queue = [];

    processes.sort((a, b) => a.arrival-time-field - b.arrival-time-field);
    
    while (processes.length > 0 || queue.length > 0) {
        while (processes.length > 0 && processes[0].arrival-time-field <= time) {
            queue.push(processes.shift());
        }
        
        if (queue.length > 0) {
            queue.sort((a, b) => a.burst-time-field - b.burst-time-field);
            const proc = queue.shift();
            ganttData.push({ id: proc.id, start: time, end: time + proc.burst-time-field });
            time += proc.burst-time-field;
        } else {
            time++;
        }
    }

    return ganttData;
}

// Round Robin Algorithm
function roundRobin(processes, quantum) {

    let isValid = true;
    const inputs = document.querySelectorAll('.process-input-row');

    inputs.forEach(input => {
        const id = input.querySelector('.process-id-field').value.trim();
        const arrival = input.querySelector('.arrival-time-field').value.trim();
        const burst = input.querySelector('.burst-time-field').value.trim();
        
        if (arrival === '' || burst === '') {
            alert('Process base entity cannot be empty!');
            isValid = false;
            return;
        }
        
        if (arrival === '' || isNaN(arrival) || parseInt(arrival) < 0) {
            alert('Arrival Time must be a non-negative number!');
            isValid = false;
            return;
        }
        
        if (burst === '' || isNaN(burst) || parseInt(burst) <= 0) {
            alert('Burst Time must be a positive number!');
            isValid = false;
            return;
        }
    });

    let time = 0;
    const queue = [];
    const ganttData = [];
    const remainingBurstTimes = {};
    let detailedResult = 'Round Robin Scheduling:\n';

    processes.forEach(proc => remainingBurstTimes[proc.id] = proc.burst-time-field);
    
    processes.sort((a, b) => a.arrival-time-field - b.arrival-time-field);
    
    while (processes.length > 0 || queue.length > 0) {
        while (processes.length > 0 && processes[0].arrival-time-field <= time) {
            queue.push(processes.shift());
        }
        
        if (queue.length > 0) {
            const proc = queue.shift();
            const burst = Math.min(quantum, remainingBurstTimes[proc.id]);
            
            ganttData.push({ id: proc.id, start: time, end: time + burst });
            detailedResult += `Process ${proc.id} runs from ${time} to ${time + burst}.\n`;
            time += burst;
            remainingBurstTimes[proc.id] -= burst;
            
            if (remainingBurstTimes[proc.id] > 0) {
                queue.push(proc);
            } else {
                detailedResult += `Process ${proc.id} finishes at ${time}.\n`;
            }
        } else {
            time++;
        }
    }

    return ganttData;
}

// Function to draw Gantt Chart
function drawGanttChart(ganttData) {
    const chartWidth = ganttCanvas.width;
    const chartHeight = ganttCanvas.height;
    const totalDuration = ganttData[ganttData.length - 1].end;
    const unitWidth = chartWidth / totalDuration;
    
    ganttCtx.clearRect(0, 0, chartWidth, chartHeight);
    
    ganttData.forEach((block, index) => {
        const startX = block.start * unitWidth;
        const blockWidth = (block.end - block.start) * unitWidth;
        
        // Draw rectangle for each process execution
        ganttCtx.fillStyle = `hsl(${index * 90}, 70%, 50%)`;
        ganttCtx.fillRect(startX, 50, blockWidth, 50);
        
        // Add process label
        ganttCtx.fillStyle = 'white';
        ganttCtx.font = "16px Arial";
        ganttCtx.fillText(block.id, startX + blockWidth / 2 - 10, 80);
        
        // Add time markers
        ganttCtx.fillText(block.start, startX, 110);
        ganttCtx.fillText(block.end, startX + blockWidth - 10, 110);
    });
    return;
}
// Function to draw Gantt Chart with scrollable canvas
function drawGanttChart(ganttData) {

    let isValid = true;
    const inputs = document.querySelectorAll('.process-input-row');

    inputs.forEach(input => {
        const id = input.querySelector('.process-id-field').value.trim();
        const arrival = input.querySelector('.arrival-time-field').value.trim();
        const burst = input.querySelector('.burst-time-field').value.trim();
        
        if (arrival === '' || burst === '') {
            // alert('Process base entity cannot be empty!');
            isValid = false;
            return;
        }
        
        if (arrival === '' || isNaN(arrival) || parseInt(arrival) < 0) {
            // alert('Arrival Time must be a non-negative number!');
            isValid = false;
            return;
        }
        
        if (burst === '' || isNaN(burst) || parseInt(burst) <= 0) {
            // alert('Burst Time must be a positive number!');
            isValid = false;
            return;
        }
    });
    if(isValid)
    {

        const chartHeight = ganttCanvas.height;
        const totalDuration = ganttData[ganttData.length - 1].end;
        const unitWidth = 50; // Fixed width for each time unit
        const chartWidth = totalDuration * unitWidth;
        
        ganttCanvas.width = chartWidth; // Dynamically set the canvas width based on total duration
        
        ganttCtx.clearRect(0, 0, chartWidth, chartHeight);
        
        ganttData.forEach((block, index) => {
            const startX = block.start * unitWidth;
            const blockWidth = (block.end - block.start) * unitWidth;
            
            // Draw rectangle for each process execution
            ganttCtx.fillStyle = `hsl(${index * 90}, 70%, 50%)`;
            ganttCtx.fillRect(startX, 50, blockWidth, 50);
            
            // Add process label in the middle of the block
            ganttCtx.fillStyle = 'white';
            ganttCtx.font = "16px Arial";
            ganttCtx.textAlign = "center";
            ganttCtx.fillText(block.id, startX + blockWidth / 2, 80);
            
            // Add time markers without overlapping
            ganttCtx.fillStyle = 'black';
            ganttCtx.textAlign = "left";
            ganttCtx.fillText(block.start, startX, 120);
            ganttCtx.textAlign = "right";
            ganttCtx.fillText(block.end, startX + blockWidth - 2, 120);
        });
    }   
}

// Function to simulate scheduling and calculate time frames
function startSimulation() {
    const processes = parseInput();
    const algorithm = algorithmSelect.value;
    const timeQuantumVal = parseInt(timeQuantum.value);
    
    let ganttData = [];
    let detailedResult = '';
    
    if (algorithm === 'fcfs') {
        ganttData = fcfs(processes);
    } else if (algorithm === 'sjf') {
        ganttData = sjf(processes);
    } else if (algorithm === 'rr') {
        ganttData = roundRobin(processes, timeQuantumVal);
    }
    
    drawGanttChart(ganttData);
    resultOutput.innerText = `Results for ${algorithm.toUpperCase()} scheduling:`;
    
    // Generate detailed result with time frames
    ganttData.forEach((block, index) => {
        detailedResult += `Process ${block.id} runs from ${block.start} to ${block.end}.\n`;
    });
    
    detailedResultOutput.innerText = detailedResult;
}

// Round Robin Algorithm (Updated for Correct Time Frames)
function roundRobin(processes, quantum) {
    let time = 0;
    const queue = [];
    const ganttData = [];
    const remainingBurstTimes = {};
    let detailedResult = 'Round Robin Scheduling:\n';

    processes.forEach(proc => remainingBurstTimes[proc.id] = proc.burst-time-field);
    
    processes.sort((a, b) => a.arrival-time-field - b.arrival-time-field);
    
    while (processes.length > 0 || queue.length > 0) {
        while (processes.length > 0 && processes[0].arrival-time-field <= time) {
            queue.push(processes.shift());
        }
        
        if (queue.length > 0) {
            const proc = queue.shift();
            const burst = Math.min(quantum, remainingBurstTimes[proc.id]);
            
            ganttData.push({ id: proc.id, start: time, end: time + burst });
            detailedResult += `Process ${proc.id} runs from ${time} to ${time + burst}.\n`;
            time += burst;
            remainingBurstTimes[proc.id] -= burst;
            
            if (remainingBurstTimes[proc.id] > 0) {
                queue.push(proc);
            } else {
                detailedResult += `Process ${proc.id} finishes at ${time}.\n`;
            }
        } else {
            time++;
        }
    }

    return ganttData;
}

document.getElementById("addProcessButton").addEventListener("click", function () {
    addProcess();
});

// Function to add a new process row dynamically
function addProcess() {
    const processContainer = document.getElementById("processInputBox");

    const processDiv = document.createElement("div");
    processDiv.classList.add("process-input-row");

    processDiv.innerHTML = `
        <input type="text" class="process-id-field" placeholder="Process ID" />
        <input type="number" class="arrival-time-field" placeholder="Arrival Time" />
        <input type="number" class="burst-time-field" placeholder="Burst Time" />
        <button class="delete-process-button">Delete</button>
    `;

    processContainer.appendChild(processDiv);

    // Attach event listener for delete button
    processDiv.querySelector(".delete-process-button").addEventListener("click", function () {
        processDiv.remove();
    });
}
