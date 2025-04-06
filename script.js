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

/**
 * Load transactions from cookies on page load.
 * If transactions are found in cookies, parse and update the UI.
 */
window.onload = () => {
    const savedTransactions = getCookie('transactions'); // Retrieve transactions from cookies
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions); // Parse transactions from JSON string
        updateUI(); // Update the UI to reflect loaded transactions
    }
};

/**
 * Event listener for adding a new transaction.
 */
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    const description = document.getElementById('description').value.trim(); // Get description
    const amount = parseFloat(document.getElementById('amount').value); // Get and parse amount
    const type = document.getElementById('type').value; // Get type (income/expense)

    if (description && !isNaN(amount)) { // Validate inputs
        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            date: new Date().toLocaleDateString()
        };
        transactions.push(transaction); // Add transaction to the array
        saveTransactions(); // Persist transactions to cookies
        updateUI(); // Update the UI to reflect the new transaction
        transactionForm.reset(); // Reset the form for new input
    } else {
        alert('Please enter a valid description and amount.'); // Alert if input is invalid
    }
});

/**
 * Event listener for removing a transaction.
 */
transactionList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) { // Check if the delete button is clicked
        const id = parseInt(e.target.dataset.id); // Get the ID of the transaction to delete
        transactions = transactions.filter(transaction => transaction.id !== id); // Remove transaction
        saveTransactions(); // Persist updated transactions to cookies
        updateUI(); // Update the UI
    }
});

/**
 * Event listeners for filtering transactions.
 */
filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const filter = e.target.id.replace('filter-', ''); // Determine filter type
        updateUI(filter); // Update the UI with the selected filter
    });
});

/**
 * Event listener for clearing all transactions.
 */
clearButton.addEventListener('click', () => {
    transactions = []; // Clear transactions array
    saveTransactions(); // Persist empty transactions array to cookies
    updateUI(); // Update the UI
});

/**
 * Event listener for printing transactions.
 * Includes total income, total expenses, and balance in the report.
 */
printButton.addEventListener('click', () => {
    let totalIncome = 0;
    let totalExpense = 0;

    // Calculate totals
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpense;

    // Generate printable content
    const printContent = `
        <html>
            <head>
                <title>Print Transactions</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .totals { margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>Transactions Report</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(transaction => `
                            <tr>
                                <td>${transaction.description}</td>
                                <td>$${transaction.amount.toFixed(2)}</td>
                                <td>${transaction.type}</td>
                                <td>${transaction.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals">
                    <h2>Summary</h2>
                    <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
                    <p><strong>Total Expenses:</strong> $${totalExpense.toFixed(2)}</p>
                    <p><strong>Balance:</strong> $${balance.toFixed(2)}</p>
                </div>
            </body>
        </html>
    `;
    const newWindow = window.open(); // Open a new window
    newWindow.document.write(printContent); // Write the printable content
    newWindow.document.close(); // Close the document to render it
    newWindow.print(); // Trigger the print dialog
    newWindow.close(); // Close the window after printing
});

/**
 * Save transactions to cookies.
 */
function saveTransactions() {
    document.cookie = `transactions=${encodeURIComponent(JSON.stringify(transactions))}; path=/; max-age=31536000`; // 1-year expiry
}

/**
 * Retrieve a cookie value by its name.
 */
function getCookie(name) {
    const cookieString = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
    return cookieString ? decodeURIComponent(cookieString.split('=')[1]) : null;
}

/**
 * Update the User Interface (UI) with transactions and totals.
 */
function updateUI(filter = 'all') {
    transactionList.innerHTML = '';
    let totalIncome = 0;
    let totalExpense = 0;

    transactions
        .filter(transaction => filter === 'all' || transaction.type === filter)
        .forEach(transaction => {
            const listItem = document.createElement('li');
            listItem.className = `transaction-item ${transaction.type}`;
            listItem.innerHTML = `
                ${transaction.description} - $${transaction.amount.toFixed(2)} - ${transaction.date}
                <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600" data-id="${transaction.id}">X</button>
            `;
            transactionList.appendChild(listItem);

            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        });

    const balance = totalIncome - totalExpense;

    totalIncomeDisplay.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpenseDisplay.textContent = `$${totalExpense.toFixed(2)}`;
    balanceDisplay.textContent = `$${balance.toFixed(2)}`;
}