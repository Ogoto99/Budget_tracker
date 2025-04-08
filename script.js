// Select DOM elements
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const totalIncomeDisplay = document.getElementById('total-income');
const totalExpenseDisplay = document.getElementById('total-expenses');
const balanceDisplay = document.getElementById('balance');
const filterButtons = document.querySelectorAll('#filter-all, #filter-income, #filter-expense');
const clearButton = document.getElementById('clear-transactions');
const printButton = document.getElementById('print-transactions'); // New Print Button

// Initialize transactions array
let transactions = [];

// Load transactions from cookies on page load
window.onload = function () {
    const savedTransactions = getCookie('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
        updateUI();
    }
};

// Adding a new transaction
transactionForm.onsubmit = function (e) {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (description && !isNaN(amount)) {
        const transaction = {
            id: Date.now(),
            description: description,
            amount: amount,
            type: type,
            date: new Date().toLocaleDateString()
        };
        transactions.push(transaction);
        saveTransactions();
        updateUI();
        transactionForm.reset();
    } else {
        alert('Please enter a valid description and amount.');
    }
};

// Removing a transaction
transactionList.onclick = function (e) {
    if (e.target.className.indexOf('delete-btn') !== -1) {
        const id = parseInt(e.target.getAttribute('data-id'));
        transactions = transactions.filter(function (transaction) {
            return transaction.id !== id;
        });
        saveTransactions();
        updateUI();
    }
};

// Filtering transactions
Array.prototype.forEach.call(filterButtons, function (button) {
    button.onclick = function (e) {
        const filter = e.target.id.replace('filter-', '');
        updateUI(filter);
    };
});

// Clearing all transactions
clearButton.onclick = function () {
    transactions = [];
    saveTransactions();
    updateUI();
};

// Printing transactions
printButton.onclick = function () {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(function (transaction) {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpense;
    let printContent = '<html><head><title>Print Transactions</title></head><body>';
    printContent += '<h1>Transactions Report</h1>';
    transactions.forEach(function (transaction) {
        printContent += '<p>' + transaction.description + ' - $' + transaction.amount.toFixed(2) + '</p>';
    });
    printContent += '<h2>Total Income: $' + totalIncome.toFixed(2) + '</h2>';
    printContent += '<h2>Total Expenses: $' + totalExpense.toFixed(2) + '</h2>';
    printContent += '<h2>Balance: $' + balance.toFixed(2) + '</h2></body></html>';

    const newWindow = window.open();
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
};

// Save transactions to cookies
function saveTransactions() {
    document.cookie = 'transactions=' + encodeURIComponent(JSON.stringify(transactions)) + '; path=/; max-age=31536000';
}

// Retrieve a cookie value
function getCookie(name) {
    const cookieString = document.cookie.split('; ').find(function (row) {
        return row.indexOf(name + '=') === 0;
    });
    return cookieString ? decodeURIComponent(cookieString.split('=')[1]) : null;
}

// Update the UI
function updateUI(filter) {
    transactionList.innerHTML = '';
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(function (transaction) {
        if (!filter || filter === 'all' || filter === transaction.type) {
            const listItem = document.createElement('li');
            listItem.innerHTML = transaction.description + ' - $' + transaction.amount.toFixed(2);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.className = 'delete-btn';
            deleteBtn.setAttribute('data-id', transaction.id);
            listItem.appendChild(deleteBtn);
            transactionList.appendChild(listItem);

            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        }
    });

    const balance = totalIncome - totalExpense;
    totalIncomeDisplay.textContent = '$' + totalIncome.toFixed(2);
    totalExpenseDisplay.textContent = '$' + totalExpense.toFixed(2);
    balanceDisplay.textContent = '$' + balance.toFixed(2);
}