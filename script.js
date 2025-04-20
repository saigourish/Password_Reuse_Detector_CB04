function arePasswordsSimilar(pw1, pw2, threshold = 0.8) {
    const longer = pw1.length > pw2.length ? pw1 : pw2;
    const shorter = pw1.length > pw2.length ? pw2 : pw1;
    const longerLength = longer.length;
    if (longerLength === 0) return false;
    const sameCount = Array.from(shorter).filter((char, i) => longer[i] === char).length;
    return (sameCount / longerLength) >= threshold;
}

// Generate a random strong password
function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
}

// Reset reused password
function resetPassword(oldPasswordId) {
    const newPassword = generateRandomPassword();
    const container = document.getElementById(oldPasswordId);
    container.innerHTML = `<div class="new-password">🔑 Suggested Password: ${newPassword}</div>`;
}

// Save history to localStorage
function saveHistory(email, passwords) {
    const history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
    const record = {
        email: email,
        passwords: passwords,
        date: new Date().toLocaleString()
    };
    history.push(record);
    localStorage.setItem('passwordHistory', JSON.stringify(history));
    populateHistory();
}

// Populate the history dropdown
function populateHistory() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
    historyList.innerHTML = `<option value="">-- Select History --</option>`;
    history.forEach((record, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${record.email} (${record.date})`;
        historyList.appendChild(option);
    });
}

// Load selected history
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
    const selectedIndex = document.getElementById('historyList').value;
    if (selectedIndex !== "") {
        const record = history[selectedIndex];
        document.getElementById('email').value = record.email;
        document.getElementById('passwords').value = record.passwords.join('\n');
    }
}

// Analyze entered passwords
function analyzePasswords() {
    const email = document.getElementById('email').value.trim();
    const passwordsRaw = document.getElementById('passwords').value.trim();
    const passwords = passwordsRaw.split('\n').map(p => p.trim()).filter(p => p !== '');

    if (!email || passwords.length === 0) {
        alert("Please enter your email and at least one password.");
        return;
    }

    // Save to history
    saveHistory(email, passwords);

    const reuseCount = {};
    const similarPairs = [];

    passwords.forEach(pw => {
        reuseCount[pw] = (reuseCount[pw] || 0) + 1;
    });

    for (let i = 0; i < passwords.length; i++) {
        for (let j = i + 1; j < passwords.length; j++) {
            if (arePasswordsSimilar(passwords[i], passwords[j])) {
                similarPairs.push([passwords[i], passwords[j]]);
            }
        }
    }

    let reportHTML = `<h3>🔎 Password Analysis Report for ${email}</h3>`;

    const reused = Object.entries(reuseCount).filter(([pw, count]) => count > 1);

    if (reused.length > 0) {
        reportHTML += `<p>⚠️ <strong>Reused Passwords Detected:</strong></p><ul>`;
        reused.forEach(([pw, count], index) => {
            const id = `reset-container-${index}`;
            reportHTML += `<li>'${pw}' used ${count} times 
                <button class="reset-btn" onclick="resetPassword('${id}')">Reset</button>
                <div id="${id}"></div>
            </li>`;
        });
        reportHTML += `</ul>`;
    } else {
        reportHTML += `<p>✅ No exact password reuse detected.</p>`;
    }

    if (similarPairs.length > 0) {
        reportHTML += `<p>⚠️ <strong>Similar Passwords Detected:</strong></p><ul>`;
        similarPairs.forEach(pair => {
            reportHTML += `<li>'${pair[0]}' is similar to '${pair[1]}'</li>`;
        });
        reportHTML += `</ul>`;
    } else {
        reportHTML += `<p>✅ No similar passwords detected.</p>`;
    }

    reportHTML += `<p>Total passwords checked: ${passwords.length}</p>`;

    const reportDiv = document.getElementById('report');
    reportDiv.innerHTML = reportHTML;
    reportDiv.style.display = 'block';
}

// Load history on page load
window.onload = function() {
    populateHistory();
}
