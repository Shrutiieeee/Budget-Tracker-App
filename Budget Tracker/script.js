
        document.addEventListener('DOMContentLoaded', function() {
            // Authentication elements
            const loginSection = document.getElementById('login-section');
            const registerSection = document.getElementById('register-section');
            const appContent = document.getElementById('app-content');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const registerToggle = document.getElementById('register-toggle');
            const loginToggle = document.getElementById('login-toggle');
            const logoutBtn = document.getElementById('logout-btn');
            const userDisplay = document.getElementById('user-display');
            
            // Check if user is already logged in
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                showApp(JSON.parse(currentUser));
            }
            
            // Toggle between login and register forms
            registerToggle.addEventListener('click', function(e) {
                e.preventDefault();
                loginSection.classList.add('hidden');
                registerSection.classList.remove('hidden');
            });
            
            loginToggle.addEventListener('click', function(e) {
                e.preventDefault();
                registerSection.classList.add('hidden');
                loginSection.classList.remove('hidden');
            });
            
            // Login form submission
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                clearErrors();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('remember-me').checked;
                
                // Simple validation
                let isValid = true;
                
                if (!username) {
                    document.getElementById('login-username-error').textContent = 'Username is required';
                    isValid = false;
                }
                
                if (!password) {
                    document.getElementById('login-password-error').textContent = 'Password is required';
                    isValid = false;
                }
                
                if (!isValid) return;
                
                // Simple authentication (in a real app, this would connect to a backend)
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                
                if (users[username] && users[username].password === password) {
                    if (rememberMe) {
                        localStorage.setItem('currentUser', JSON.stringify({username: username}));
                    } else {
                        sessionStorage.setItem('currentUser', JSON.stringify({username: username}));
                    }
                    showApp({username: username});
                } else {
                    document.getElementById('login-error').textContent = 'Invalid username or password';
                }
            });
            
            // Register form submission
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                clearErrors();
                
                const username = document.getElementById('new-username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                // Validation
                let isValid = true;
                
                if (!username) {
                    document.getElementById('register-username-error').textContent = 'Username is required';
                    isValid = false;
                } else if (username.length < 3) {
                    document.getElementById('register-username-error').textContent = 'Username must be at least 3 characters';
                    isValid = false;
                }
                
                if (!email) {
                    document.getElementById('register-email-error').textContent = 'Email is required';
                    isValid = false;
                } else if (!isValidEmail(email)) {
                    document.getElementById('register-email-error').textContent = 'Please enter a valid email address';
                    isValid = false;
                }
                
                if (!password) {
                    document.getElementById('register-password-error').textContent = 'Password is required';
                    isValid = false;
                } else if (password.length < 6) {
                    document.getElementById('register-password-error').textContent = 'Password must be at least 6 characters';
                    isValid = false;
                }
                
                if (!confirmPassword) {
                    document.getElementById('register-confirm-error').textContent = 'Please confirm your password';
                    isValid = false;
                } else if (password !== confirmPassword) {
                    document.getElementById('register-confirm-error').textContent = 'Passwords do not match';
                    isValid = false;
                }
                
                if (!isValid) return;
                
                // Save user (in a real app, this would connect to a backend)
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                
                if (users[username]) {
                    document.getElementById('register-username-error').textContent = 'Username already exists';
                    return;
                }
                
                users[username] = {email, password};
                localStorage.setItem('users', JSON.stringify(users));
                
                document.getElementById('register-success').textContent = 'Registration successful! You can now login.';
                
                // Clear form
                registerForm.reset();
                
                // Auto-redirect to login after 2 seconds
                setTimeout(() => {
                    registerSection.classList.add('hidden');
                    loginSection.classList.remove('hidden');
                    document.getElementById('register-success').textContent = '';
                }, 2000);
            });
            
            // Logout functionality
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentUser');
                showLogin();
            });
            
            function showApp(user) {
                loginSection.classList.add('hidden');
                registerSection.classList.add('hidden');
                appContent.style.display = 'block';
                userDisplay.textContent = user.username;
                
                // Initialize user-specific data
                initUserData(user.username);
            }
            
            function showLogin() {
                loginSection.classList.remove('hidden');
                registerSection.classList.add('hidden');
                appContent.style.display = 'none';
                
                // Clear login form
                loginForm.reset();
                clearErrors();
            }
            
            function initUserData(username) {
                // Load user-specific transactions
                const userTransactions = localStorage.getItem(`transactions_${username}`);
                if (!userTransactions) {
                    // Initialize with empty array if no data exists for this user
                    localStorage.setItem(`transactions_${username}`, JSON.stringify([]));
                }
                
                // Initialize the budget tracker with user-specific data
                initBudgetTracker(username);
            }
            
            function clearErrors() {
                // Clear all error messages
                const errorElements = document.querySelectorAll('.error-message');
                errorElements.forEach(el => el.textContent = '');
            }
            
            function isValidEmail(email) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            }
            
            // Budget Tracker functionality
            function initBudgetTracker(username) {
                // Set today's date as default
                document.getElementById('date').valueAsDate = new Date();

                // Initialize app with user-specific data
                let transactions = JSON.parse(localStorage.getItem(`transactions_${username}`)) || [];
                let currentType = 'expense'; // Default type

                // DOM elements
                const typeToggles = document.querySelectorAll('.type-toggle');
                const transactionForm = document.getElementById('transaction-form');
                const transactionList = document.getElementById('transaction-list');
                const filterType = document.getElementById('filter-type');
                const addBtnMobile = document.getElementById('add-btn-mobile');
                const themeToggleBtn = document.getElementById('theme-toggle');

                // Summary elements
                const incomeAmount = document.getElementById('income-amount');
                const expenseAmount = document.getElementById('expense-amount');
                const balanceAmount = document.getElementById('balance-amount');

                // Stats elements
                const expenseCategories = document.getElementById('expense-categories');
                const recentTransactions = document.getElementById('recent-transactions');

                // Initialize the UI
                updateUI();

                // Type toggle buttons
                typeToggles.forEach(button => {
                    button.addEventListener('click', function() {
                        typeToggles.forEach(btn => {
                            btn.classList.remove('bg-orange-100', 'text-orange-700');
                        });
                        this.classList.add('bg-orange-100', 'text-orange-700');
                        currentType = this.getAttribute('data-type');
                    });
                });

                // Form submission
                transactionForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const description = document.getElementById('description').value.trim();
                    const amount = parseFloat(document.getElementById('amount').value);
                    const date = document.getElementById('date').value;
                    const category = document.getElementById('category').value;

                    if (description === '' || isNaN(amount) || !date) {
                        alert('Please fill in all fields correctly.');
                        return;
                    }

                    const transaction = {
                        id: generateId(),
                        type: currentType,
                        description,
                        amount,
                        date,
                        category
                    };

                    transactions.push(transaction);
                    saveTransactions();
                    updateUI();

                    // Reset form
                    this.reset();
                    document.getElementById('date').valueAsDate = new Date();

                    // Show success message
                    showNotification('Transaction added successfully!');
                });

                // Filter transactions
                filterType.addEventListener('change', function() {
                    updateUI();
                });

                // Mobile add button
                addBtnMobile.addEventListener('click', function() {
                    document.getElementById('description').focus();
                });

                // Theme toggle button
                themeToggleBtn.addEventListener('click', toggleTheme);

                // Check for saved theme
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    themeToggleBtn.innerHTML = '<i class="fas fa-moon text-orange-500"></i>';
                }

                // Generate unique ID
                function generateId() {
                    return Date.now().toString(36) + Math.random().toString(36).substr(2);
                }

                // Save transactions to localStorage
                function saveTransactions() {
                    localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
                }

                // Update the UI elements
                function updateUI() {
                    updateTransactionList();
                    updateSummary();    
                    updateStats();
                }

                // Update transaction list
                function updateTransactionList() {
                    const filterValue = filterType.value;
                    let filteredTransactions = [...transactions];

                    if (filterValue !== 'all') {
                        filteredTransactions = transactions.filter(t => t.type === filterValue);
                    }

                    if (filteredTransactions.length === 0) {
                        transactionList.innerHTML = '<p class="text-center text-gray-500 py-10">No transactions found</p>';
                        return;
                    }

                    // Sort by date (newest first)
                    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                    transactionList.innerHTML = filteredTransactions.map(transaction => `
                        <div class="transaction-item bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center
                                    ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                                    <i class="${getCategoryIcon(transaction.category)}"></i>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-800">${transaction.description}</p>
                                    <p class="text-xs text-gray-500">${formatDate(transaction.date)} • ${transaction.category}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                                    ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                                </p>
                                <button class="delete-btn text-xs text-gray-400 hover:text-red-500 mt-1" data-id="${transaction.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('');

                    // Add event listener to delete buttons
                    document.querySelectorAll('.delete-btn').forEach(button => {
                        button.addEventListener('click', function() {
                            const id = this.dataset.id;
                            deleteTransaction(id);
                        });
                    });
                }
                
                // Delete a transaction
                function deleteTransaction(id) {
                    if (confirm('Are you sure you want to delete this transaction?')) {
                        transactions = transactions.filter(t => t.id !== id);
                        saveTransactions();
                        updateUI();
                        showNotification('Transaction Deleted');
                    }
                }

                // Update summary (income, expense, balance)
                function updateSummary() {
                    const income = transactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const expenses = transactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0);

                    const balance = income - expenses;

                    incomeAmount.textContent = `₹${income.toFixed(2)}`;
                    expenseAmount.textContent = `₹${expenses.toFixed(2)}`;
                    balanceAmount.textContent = `₹${balance.toFixed(2)}`;
                }

                // Update stats section
                function updateStats() {
                    // Expense by category
                    const expenseByCategory = transactions
                        .filter(t => t.type === 'expense')
                        .reduce((acc, t) => {
                            if (!acc[t.category]) acc[t.category] = 0;
                            acc[t.category] += t.amount;
                            return acc;
                        }, {});

                    const totalExpense = Object.values(expenseByCategory).reduce((sum, amount) => sum + amount, 0);
                    expenseCategories.innerHTML = Object.entries(expenseByCategory)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([category, amount]) => {
                            const percentage = totalExpense === 0 ? 0 : (amount / totalExpense * 100).toFixed(1);
                            return `
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="capitalize font-medium">${category}</span>
                                        <span class="text-gray-700">₹${amount.toFixed(2)} (${percentage}%)</span>
                                    </div>
                                    <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div class="bg-orange-600 h-full" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('') || '<p class="text-sm text-gray-500">No expense data yet</p>';

                    // Recent transactions
                    const sortedByDate = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

                    recentTransactions.innerHTML = sortedByDate
                        .slice(0, 5)
                        .map(transaction => `
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center
                                    ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                                        <i class="${getCategoryIcon(transaction.category)} text-xs"></i>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium">${transaction.description}</p>
                                        <p class="text-xs text-gray-500">${formatDateShort(transaction.date)}</p>
                                    </div>
                                </div>
                                <p class="text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                                    ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                                </p>
                            </div>
                        `).join('') || '<p class="text-sm text-gray-500">No recent transactions</p>';
                }
                
                // Helper functions
                function formatDate(dateString) {
                    const options = { year: 'numeric', month: 'short', day: 'numeric' };
                    return new Date(dateString).toLocaleDateString('en-US', options);
                }

                function formatDateShort(dateString) {
                    const options = { month: 'short', day: 'numeric' };
                    return new Date(dateString).toLocaleDateString('en-US', options);
                }

                function getCategoryIcon(category) {
                    const icons = {
                        'food': 'fas fa-utensils',
                        'transport': 'fas fa-car',
                        'shopping': 'fas fa-shopping-bag',
                        'housing': 'fas fa-home',
                        'entertainment': 'fas fa-film',
                        'salary': 'fas fa-money-bill-wave',
                        'general': 'fas fa-wallet',
                        'other': 'fas fa-ellipsis-h'
                    };
                    return icons[category] || 'fas fa-circle';
                }

                function showNotification(message) {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-fadeIn';
                    notification.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <span>${message}</span>
                    `;
                    document.body.appendChild(notification);

                    setTimeout(() => {
                        notification.classList.add('animate-fadeOut');
                        setTimeout(() => {
                            notification.remove();
                        }, 300);
                    }, 3000);
                }

                function toggleTheme() {
                    if (document.documentElement.classList.contains('dark')) {
                        document.documentElement.classList.remove('dark');
                        localStorage.setItem('theme', 'light');
                        themeToggleBtn.innerHTML = '<i class="fas fa-sun text-orange-500"></i>';
                    } else {
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('theme', 'dark');
                        themeToggleBtn.innerHTML = '<i class="fas fa-moon text-orange-500"></i>';
                    }
                }
            }
        });
    
