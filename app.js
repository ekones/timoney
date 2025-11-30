// App State
let appState = {
    monthlySalary: 0,
    monthlyHours: 0,
    hourlyRate: 0,
    expenses: []
};

// DOM Elements
const monthlySalaryInput = document.getElementById('monthlySalary');
const monthlyHoursInput = document.getElementById('monthlyHours');
const hourlyRateDisplay = document.getElementById('hourlyRate');
const expenseForm = document.getElementById('expenseForm');
const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const expensesList = document.getElementById('expensesList');
const emptyState = document.getElementById('emptyState');
const expensesSection = document.getElementById('expensesSection');
const summaryCard = document.getElementById('summaryCard');
const totalExpenseEl = document.getElementById('totalExpense');
const totalHoursEl = document.getElementById('totalHours');
const remainingSalaryEl = document.getElementById('remainingSalary');
const percentageUsedEl = document.getElementById('percentageUsed');

// Initialize App
function init() {
    loadFromStorage();
    setupEventListeners();
    updateUI();
}

// Event Listeners
function setupEventListeners() {
    monthlySalaryInput.addEventListener('input', handleIncomeChange);
    monthlyHoursInput.addEventListener('input', handleIncomeChange);
    expenseForm.addEventListener('submit', handleAddExpense);
}

// Handle Income Change
function handleIncomeChange() {
    const salary = parseFloat(monthlySalaryInput.value) || 0;
    const hours = parseFloat(monthlyHoursInput.value) || 0;
    
    appState.monthlySalary = salary;
    appState.monthlyHours = hours;
    appState.hourlyRate = hours > 0 ? salary / hours : 0;
    
    saveToStorage();
    updateUI();
}

// Handle Add Expense
function handleAddExpense(e) {
    e.preventDefault();
    
    const name = expenseNameInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value) || 0;
    
    if (!name || amount <= 0) {
        return;
    }
    
    if (appState.hourlyRate === 0) {
        alert('Lütfen önce gelir bilgilerinizi girin!');
        return;
    }
    
    const expense = {
        id: Date.now(),
        name,
        amount,
        hours: amount / appState.hourlyRate
    };
    
    appState.expenses.push(expense);
    
    // Reset form
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
    
    saveToStorage();
    updateUI();
    
    // Add animation delay for new item
    setTimeout(() => {
        const newItem = document.querySelector(`[data-id="${expense.id}"]`);
        if (newItem) {
            newItem.style.animationDelay = '0s';
        }
    }, 10);
}

// Delete Expense
function deleteExpense(id) {
    appState.expenses = appState.expenses.filter(exp => exp.id !== id);
    saveToStorage();
    updateUI();
}

// Update UI
function updateUI() {
    updateHourlyRate();
    updateExpensesList();
    updateSummary();
}

// Update Hourly Rate Display
function updateHourlyRate() {
    if (appState.hourlyRate > 0) {
        hourlyRateDisplay.textContent = `${appState.hourlyRate.toFixed(2)} ₺/saat`;
    } else {
        hourlyRateDisplay.textContent = '--';
    }
}

// Update Expenses List
function updateExpensesList() {
    if (appState.expenses.length === 0) {
        emptyState.style.display = 'block';
        expensesSection.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    expensesSection.style.display = 'block';
    
    expensesList.innerHTML = appState.expenses.map((expense, index) => `
        <div class="expense-item" data-id="${expense.id}" style="animation-delay: ${index * 0.1}s">
            <div class="expense-info">
                <h3>${escapeHtml(expense.name)}</h3>
                <div class="expense-details">
                    <div class="expense-detail">
                        <span class="detail-label">Tutar</span>
                        <span class="detail-value amount">${formatCurrency(expense.amount)}</span>
                    </div>
                    <div class="expense-detail">
                        <span class="detail-label">Çalışma Saati</span>
                        <span class="detail-value hours">${formatHours(expense.hours)}</span>
                    </div>
                    <div class="expense-detail">
                        <span class="detail-label">Maaşın %${((expense.amount / appState.monthlySalary) * 100).toFixed(1)}'i</span>
                    </div>
                </div>
            </div>
            <button class="btn-delete" onclick="deleteExpense(${expense.id})">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4H14M6 4V2H10V4M12 4V14H4V4H12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Sil
            </button>
        </div>
    `).join('');
}

// Update Summary
function updateSummary() {
    if (appState.expenses.length === 0 || appState.monthlySalary === 0) {
        summaryCard.style.display = 'none';
        return;
    }
    
    summaryCard.style.display = 'block';
    
    const totalExpense = appState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalHours = appState.expenses.reduce((sum, exp) => sum + exp.hours, 0);
    const remainingSalary = appState.monthlySalary - totalExpense;
    const percentageUsed = (totalExpense / appState.monthlySalary) * 100;
    
    totalExpenseEl.textContent = formatCurrency(totalExpense);
    totalHoursEl.textContent = formatHours(totalHours);
    remainingSalaryEl.textContent = formatCurrency(remainingSalary);
    percentageUsedEl.textContent = `${percentageUsed.toFixed(1)}%`;
    
    // Color code remaining salary
    if (remainingSalary < 0) {
        remainingSalaryEl.style.color = '#fca5a5';
    } else {
        remainingSalaryEl.style.color = 'var(--text-primary)';
    }
    
    // Color code percentage
    if (percentageUsed > 80) {
        percentageUsedEl.style.color = '#fca5a5';
    } else if (percentageUsed > 50) {
        percentageUsedEl.style.color = '#fcd34d';
    } else {
        percentageUsedEl.style.color = 'var(--text-primary)';
    }
}

// Local Storage
function saveToStorage() {
    localStorage.setItem('timoney-data', JSON.stringify(appState));
}

function loadFromStorage() {
    const stored = localStorage.getItem('timoney-data');
    if (stored) {
        appState = JSON.parse(stored);
        monthlySalaryInput.value = appState.monthlySalary || '';
        monthlyHoursInput.value = appState.monthlyHours || '';
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatHours(hours) {
    if (hours < 1) {
        return `${Math.round(hours * 60)} dakika`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (minutes === 0) {
        return `${wholeHours} saat`;
    }
    return `${wholeHours}s ${minutes}dk`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
