
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Get references to all the HTML elements
    const timerElement = document.getElementById('timer'); // the timer display
    const timerStatusElement = document.getElementById('timer-status'); // status text
    const startBtn = document.getElementById('start-btn'); // start button
    const pauseBtn = document.getElementById('pause-btn'); // pause button
    const resetBtn = document.getElementById('reset-btn'); // reset button
    const workTimeInput = document.getElementById('work-time'); // work duration input
    const breakTimeInput = document.getElementById('break-time'); // break duration input
    const pomodoroCountInput = document.getElementById('pomodoro-count'); // pomodoro count input
    const todoInput = document.getElementById('todo-input'); // todo input field
    const addTodoBtn = document.getElementById('add-todo-btn'); // add todo button
    const todoList = document.getElementById('todo-list'); // todo list container
    const pomodoroProgress = document.getElementById('pomodoro-progress'); // pomodoro progress indicator

    // timer variables 
    let timer; // will hold the interval reference for the timer
    let timeLeft = workTimeInput.value * 60; // current time left in seconds (defaults to work time)
    let isRunning = false; // flag to track if timer is running
    let isWorkTime = true; // flag to track if current interval is work time (vs break time)
    let currentPomodoro = 1; // current pomodoro count
    let totalPomodoros = parseInt(pomodoroCountInput.value); // total pomodoros in a session

    // todo list items -array to store todo items
    let todos = [];

    // initialize timer display - set up initial display values
    updateTimerDisplay();
    updatePomodoroProgress();

    // event Listeners - set up event handlers for various user interactions
    startBtn.addEventListener('click', startTimer); // start button click
    pauseBtn.addEventListener('click', pauseTimer); // pause button click
    resetBtn.addEventListener('click', resetTimer); // reset button click
    addTodoBtn.addEventListener('click', addTodo); // add todo button click
    todoInput.addEventListener('keypress', function(e) { // enter key in todo input
        if (e.key === 'Enter') addTodo();
    });

    // Timer Functions 
    /**
     * starts the timer countdown
     */
    function startTimer() {
        if (isRunning) return; // Don't start if already running
        
        isRunning = true;
        timerStatusElement.textContent = isWorkTime ? "Working..." : "Taking a break...";
        
        // set up the interval that runs every second to update the timer
        timer = setInterval(function() {
            timeLeft--; // decrement time left
            updateTimerDisplay(); // update the display
            
            if (timeLeft <= 0) { // when time runs out
                clearInterval(timer); // stop the timer
                
                // Play notification sound
                // const notification = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-alert-notification-256.mp3');
                // notification.play();
                
                if (isWorkTime) {
                    // work time finished, switch to break
                    isWorkTime = false;
                    timeLeft = breakTimeInput.value * 60;
                    timerStatusElement.textContent = "Break time!";
                    
                    // update progress indicators
                    updatePomodoroProgress();
                } else {
                    // break time finished
                    currentPomodoro++;
                    
                    if (currentPomodoro > totalPomodoros) {
                        // all pomodoros completed
                        timerStatusElement.textContent = "All pomodoros completed! Great job!";
                        isRunning = false;
                    } else {
                        // start next pomodoro
                        isWorkTime = true;
                        timeLeft = workTimeInput.value * 60;
                        timerStatusElement.textContent = "Ready for next pomodoro!";
                        updatePomodoroProgress();
                    }
                }
                
                updateTimerDisplay();
                isRunning = false;
            }
        }, 1000); // run every 1000ms (1 second)
    }

    /**
     * pauses the running timer
     */
    function pauseTimer() {
        if (!isRunning) return; // don't pause if not running
        
        clearInterval(timer); // clear the interval
        isRunning = false;
        timerStatusElement.textContent = "Paused";
    }

    /**
     * resets the timer to initial state
     */
    function resetTimer() {
        clearInterval(timer); // clear any running interval
        isRunning = false;
        isWorkTime = true;
        currentPomodoro = 1;
        timeLeft = workTimeInput.value * 60; // reset to work time
        timerStatusElement.textContent = "Ready to start!";
        totalPomodoros = parseInt(pomodoroCountInput.value); // get current value from input
        updateTimerDisplay();
        updatePomodoroProgress();
    }

    /**
     * updates the timer display with current time left
     */
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60); // calculate minutes
        const seconds = timeLeft % 60; // calculate seconds
        // format as MM:SS with leading zeros
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * updates the pomodoro progress indicator circles
     */
    function updatePomodoroProgress() {
        pomodoroProgress.innerHTML = ''; // clear existing circles
        
        // create a circle for each pomodoro in the session
        for (let i = 1; i <= totalPomodoros; i++) {
            const circle = document.createElement('div');
            circle.className = 'pomodoro-circle';
            
            // apply different classes based on completion status
            if (i < currentPomodoro) {
                circle.classList.add('completed'); // completed pomodoros
            } else if (i === currentPomodoro) {
                circle.classList.add('current'); // current pomodoro
            }
            
            circle.textContent = i; // display pomodoro number
            pomodoroProgress.appendChild(circle);
        }
    }

    // Todo List Functions 
    /**
     * adds a new todo item to the list
     */
    function addTodo() {
        const todoText = todoInput.value.trim(); // get and clean input
        if (!todoText) return; // don't add empty todos
        
        // create todo object
        const todo = {
            id: Date.now(), // unique ID based on timestamp
            text: todoText,
            completed: false
        };
        
        todos.push(todo); // add to array
        renderTodoList(); // update display
        
        // clear input and focus it for next entry
        todoInput.value = '';
        todoInput.focus();
    }

    /**
     * renders the todo list in the UI
     */
    function renderTodoList() {
        todoList.innerHTML = ''; // clear existing list
        
        // create a list item for each todo
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            if (todo.completed) li.classList.add('completed'); // add completed class if needed
            
            // create the todo item HTML structure
            li.innerHTML = `
                <input type="checkbox" id="todo-${todo.id}" ${todo.completed ? 'checked' : ''}>
                <label for="todo-${todo.id}">${todo.text}</label>
                <button class="delete-todo-btn">×</button>
            `;
            
            todoList.appendChild(li); // add to the list
            
            // add event listeners for the todo item
            const checkbox = li.querySelector('input');
            checkbox.addEventListener('change', function() {
                // update completion status
                todo.completed = checkbox.checked;
                if (checkbox.checked) {
                    li.classList.add('completed');
                } else {
                    li.classList.remove('completed');
                }
            });
            
            // add delete button functionality
            const deleteBtn = li.querySelector('.delete-todo-btn');
            deleteBtn.addEventListener('click', function() {
                // remove todo from array and re-render
                todos = todos.filter(t => t.id !== todo.id);
                renderTodoList();
            });
        });
    }

    // Settings change -- update timer when settings change
    workTimeInput.addEventListener('change', function() {
        // Only update if timer isn't running and we're in work mode
        if (!isRunning && isWorkTime) {
            timeLeft = workTimeInput.value * 60;
            updateTimerDisplay();
        }
    });

    breakTimeInput.addEventListener('change', function() {
        // only update if timer isn't running and we're in break mode
        if (!isRunning && !isWorkTime) {
            timeLeft = breakTimeInput.value * 60;
            updateTimerDisplay();
        }
    });

    pomodoroCountInput.addEventListener('change', function() {
        // update total pomodoros and progress display
        totalPomodoros = parseInt(pomodoroCountInput.value);
        updatePomodoroProgress();
    });

    // initialize the todo list 
    renderTodoList();
});