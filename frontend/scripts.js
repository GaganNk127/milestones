function showMessage(message, isError = true) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.color = isError ? 'red' : 'green';
    messageDiv.textContent = message;
}

// Toggle between login and register forms
function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formTitle = document.getElementById('form-title');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        formTitle.textContent = 'Login';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        formTitle.textContent = 'Register';
    }
    showMessage(''); // Clear any previous messages
}

// Register user
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const guideEmail = document.getElementById('guide-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match');
        return;
    }

    const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, guideEmail, password })
    });

    if (res.ok) {
        showMessage('User registered', false);
        toggleForm();
    } else {
        const error = await res.text();
        showMessage(error);
    }
});

// Login user
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem('token', token);
        window.location.href = 'main.html';
    } else {
        const error = await res.text();
        showMessage(error);
    }
});

// Check journal entries
function checkJournalEntry() {
    window.location.href = "journal.html";
}

// Save journal entry
async function saveJournalEntry() {
    const entry = document.getElementById('journal-entry').value;
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5001/api/journal/entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entry })
    });

    if (res.ok) {
        alert('Journal entry saved');
        document.getElementById('journal-entry').value = '';
    } else {
        const error = await res.text();
        alert(error);
    }
}


async function analyzeSentiment(sentiment) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('No token found, please log in again.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    try {
        // Check if a sentiment for today already exists
        const existingSentimentResponse = await fetch(`http://localhost:5001/api/sentiment/negative?date=${today}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (existingSentimentResponse.status === 200) {
            const existingSentiments = await existingSentimentResponse.json();
            if (existingSentiments.length > 0) {
                alert('Sentiment entry for today already exists.');
                return;
            }
        }

        // Save new sentiment
        const res = await fetch('http://localhost:5001/api/sentiment/negative', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ responses: sentiment, date: today })
        });

        if (res.ok) {
            alert('Sentiment saved');
            if (sentiment === 'Bad') {
                alert('Redirecting');
                window.location.href = 'negativesentimentquestions.html';
            }
        } else {
            const error = await res.text();
            alert(error);
        }
    } catch (err) {
        console.error('Fetch error:', err);
        alert('Error: ' + err.message);
    }
}

// Handle negative sentiment form submission
document.getElementById('negative-sentiment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const label1 = document.getElementById('label1').value;
    const label2 = document.getElementById('label2').value;
    const label3 = document.getElementById('label3').value;
    console.log(label1);

    const token = localStorage.getItem('token');

    try {
        const res = await fetch('http://localhost:5001/api/sentiment/negative/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ label1, label2, label3 })
        });

        if (res.ok) {
            alert('Negative sentiment questions submitted');
            // Optionally, you can redirect or perform other actions after submission
            window.location.href = "main.html";
        } else {
            const error = await res.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while submitting the form.');
    }
});

function goback(){
    window.href.location = "main.html";
}


//updating Calendar
document?.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    console.log("DOMContentLoaded: Generating calendar for", today.getMonth(), today.getFullYear());
    generateCalendar(today.getMonth(), today.getFullYear());
    loadJournalEntries(today.getMonth(), today.getFullYear());
});

function generateCalendar(month, year) {
    console.log("Generating calendar for month:", month, "year:", year);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let calendarBody = document.getElementById('calendar-body');
    if(calendarBody)
    calendarBody.innerHTML = '';

    let row = document.createElement('tr');

    for (let i = 0; i < firstDay.getDay(); i++) {
        let cell = document.createElement('td');
        row.appendChild(cell);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        if (row.children.length === 7) {
            calendarBody?.appendChild(row);
            row = document.createElement('tr');
        }

        let cell = document.createElement('td');
        cell.innerText = day;
        cell.id = `day-${day}`;
        row.appendChild(cell);
    }

    while (row.children.length < 7) {
        let cell = document.createElement('td');
        row.appendChild(cell);
    }

    calendarBody?.appendChild(row);

    updateCalendarColors(month, year);
}

function updateCalendar(date, sentiment) {
    const dayCell = document.getElementById(`day-${date.getDate()}`);
    if (dayCell) {
        dayCell.className = sentiment.toLowerCase();
    }
}

function updateCalendarColors(month, year) {
    const calendarBody = document.getElementById('calendar-body');
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.getElementById(`day-${day}`);
        if (cell) {
            switch (cell.className) {
                case 'positive':
                    positiveCount++;
                    break;
                case 'neutral':
                    neutralCount++;
                    break;
                case 'negative':
                    negativeCount++;
                    break;
                default:
                    break;
            }
        }
    }

    let sentimentClass = '';
    if (positiveCount > neutralCount && positiveCount > negativeCount) {
        sentimentClass = 'positive-body';
    } else if (neutralCount > positiveCount && neutralCount > negativeCount) {
        sentimentClass = 'neutral-body';
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
        sentimentClass = 'negative-body';
    } else {
        sentimentClass = 'default-body';
    }

    calendarBody.className = sentimentClass;
}

function loadJournalEntries(month, year) {
    // Simulated journal entries for the current month and year
    const journalEntries = [
        { day: 5, sentiment: 'positive' },
        { day: 10, sentiment: 'neutral' },
        { day: 15, sentiment: 'negative' }
        // Add more entries as needed
    ];

    // Process each journal entry
    journalEntries.forEach(entry => {
        const entryDate = new Date(year, month, entry.day);
        updateCalendar(entryDate, entry.sentiment);
    });

    updateCalendarColors(month, year);
}


