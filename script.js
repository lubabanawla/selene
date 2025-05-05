document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const timerElement = document.getElementById('timer');
    const timerStatusElement = document.getElementById('timer-status');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const workTimeInput = document.getElementById('work-time');
    const breakTimeInput = document.getElementById('break-time');
    const pomodoroCountInput = document.getElementById('pomodoro-count');
    const musicSelect = document.getElementById('music-select');
    const volumeControl = document.getElementById('volume');
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const groupInput = document.getElementById('group-input');
    const addGroupBtn = document.getElementById('add-group-btn');
    const todoLists = document.getElementById('todo-lists');
    const generalList = document.getElementById('general-list');
    const pomodoroProgress = document.getElementById('pomodoro-progress');

    // Timer variables
    let timer;
    let timeLeft = workTimeInput.value * 60;
    let isRunning = false;
    let isWorkTime = true;
    let currentPomodoro = 1;
    let totalPomodoros = parseInt(pomodoroCountInput.value);

    // Audio elements
    const audioElements = {
        lofi: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-lo-fi-beat-225.mp3'),
        nature: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-1230.mp3'),
        'white-noise': new Audio('https://assets.mixkit.co/sfx/preview/mixkit-white-noise-ambience-1236.mp3')
    };

    // Set audio to loop
    Object.values(audioElements).forEach(audio => {
        audio.loop = true;
    });

    // Initialize todo groups
    const todoGroups = {
        'general': []
    };

    // Initialize timer display
    updateTimerDisplay();
    updatePomodoroProgress();

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    addTodoBtn.addEventListener('click', addTodo);
    addGroupBtn.addEventListener('click', addGroup);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
    groupInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addGroup();
    });

    // Music control
    musicSelect.addEventListener('change', function() {
        stopAllAudio();
        const selectedMusic = musicSelect.value;
        if (selectedMusic) {
            audioElements[selectedMusic].volume = volumeControl.value / 100;
            audioElements[selectedMusic].play();
        }
    });

    volumeControl.addEventListener('input', function() {
        const selectedMusic = musicSelect.value;
        if (selectedMusic) {
            audioElements[selectedMusic].volume = volumeControl.value / 100;
        }
    });

    // Timer Functions
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        timerStatusElement.textContent = isWorkTime ? "Working..." : "Taking a break...";
        
        timer = setInterval(function() {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                
                // Play notification sound
                const notification = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-notification-256.mp3');
                notification.play();
                
                if (isWorkTime) {
                    // Work time finished, switch to break
                    isWorkTime = false;
                    timeLeft = breakTimeInput.value * 60;
                    timerStatusElement.textContent = "Break time!";
                    
                    // Update progress
                    updatePomodoroProgress();
                } else {
                    // Break time finished
                    currentPomodoro++;
                    
                    if (currentPomodoro > totalPomodoros) {
                        // All pomodoros completed
                        timerStatusElement.textContent = "All pomodoros completed! Great job!";
                        isRunning = false;
                    } else {
                        // Start next pomodoro
                        isWorkTime = true;
                        timeLeft = workTimeInput.value * 60;
                        timerStatusElement.textContent = "Ready for next pomodoro!";
                        updatePomodoroProgress();
                    }
                }
                
                updateTimerDisplay();
                isRunning = false;
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        
        clearInterval(timer);
        isRunning = false;
        timerStatusElement.textContent = "Paused";
    }

    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        isWorkTime = true;
        currentPomodoro = 1;
        timeLeft = workTimeInput.value * 60;
        timerStatusElement.textContent = "Ready to start!";
        totalPomodoros = parseInt(pomodoroCountInput.value);
        updateTimerDisplay();
        updatePomodoroProgress();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updatePomodoroProgress() {
        pomodoroProgress.innerHTML = '';
        
        for (let i = 1; i <= totalPomodoros; i++) {
            const circle = document.createElement('div');
            circle.className = 'pomodoro-circle';
            
            if (i < currentPomodoro) {
                circle.classList.add('completed');
            } else if (i === currentPomodoro) {
                circle.classList.add('current');
            }
            
            circle.textContent = i;
            pomodoroProgress.appendChild(circle);
        }
    }

    // Todo List Functions
    function addTodo() {
        const todoText = todoInput.value.trim();
        if (!todoText) return;
        
        // Get the currently selected group (default to general)
        const activeGroup = document.querySelector('.todo-group.active') || 
                           document.querySelector('.todo-group');
        const groupName = activeGroup.querySelector('h3').textContent;
        
        // Add todo to the group
        const todo = {
            id: Date.now(),
            text: todoText,
            completed: false
        };
        
        todoGroups[groupName.toLowerCase()].push(todo);
        renderTodoList(groupName.toLowerCase());
        
        // Clear input
        todoInput.value = '';
        todoInput.focus();
    }

    function addGroup() {
        const groupName = groupInput.value.trim();
        if (!groupName || todoGroups[groupName.toLowerCase()]) return;
        
        // Create new group
        todoGroups[groupName.toLowerCase()] = [];
        
        // Create group element
        const groupElement = document.createElement('div');
        groupElement.className = 'todo-group';
        groupElement.innerHTML = `
            <h3>${groupName} <button class="delete-group-btn">×</button></h3>
            <ul class="todo-list" id="${groupName.toLowerCase()}-list"></ul>
        `;
        
        todoLists.appendChild(groupElement);
        
        // Add event listener to delete button
        const deleteBtn = groupElement.querySelector('.delete-group-btn');
        deleteBtn.addEventListener('click', function() {
            delete todoGroups[groupName.toLowerCase()];
            groupElement.remove();
        });
        
        // Clear input
        groupInput.value = '';
        groupInput.focus();
    }

    function renderTodoList(groupName) {
        const listElement = document.getElementById(`${groupName}-list`);
        if (!listElement) return;
        
        listElement.innerHTML = '';
        
        todoGroups[groupName].forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            if (todo.completed) li.classList.add('completed');
            
            li.innerHTML = `
                <input type="checkbox" id="todo-${todo.id}" ${todo.completed ? 'checked' : ''}>
                <label for="todo-${todo.id}">${todo.text}</label>
                <button class="delete-todo-btn">×</button>
            `;
            
            listElement.appendChild(li);
            
            // Add event listeners
            const checkbox = li.querySelector('input');
            checkbox.addEventListener('change', function() {
                todo.completed = checkbox.checked;
                if (checkbox.checked) {
                    li.classList.add('completed');
                } else {
                    li.classList.remove('completed');
                }
            });
            
            const deleteBtn = li.querySelector('.delete-todo-btn');
            deleteBtn.addEventListener('click', function() {
                todoGroups[groupName] = todoGroups[groupName].filter(t => t.id !== todo.id);
                renderTodoList(groupName);
            });
        });
    }

    // Helper Functions
    function stopAllAudio() {
        Object.values(audioElements).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    // Settings change listeners
    workTimeInput.addEventListener('change', function() {
        if (!isRunning && isWorkTime) {
            timeLeft = workTimeInput.value * 60;
            updateTimerDisplay();
        }
    });

    breakTimeInput.addEventListener('change', function() {
        if (!isRunning && !isWorkTime) {
            timeLeft = breakTimeInput.value * 60;
            updateTimerDisplay();
        }
    });

    pomodoroCountInput.addEventListener('change', function() {
        totalPomodoros = parseInt(pomodoroCountInput.value);
        updatePomodoroProgress();
    });

    // Initialize the first todo list
    renderTodoList('general');
});