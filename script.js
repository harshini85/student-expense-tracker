// =============================================================================
// Student Expense Tracker - script.js
// Features:
// 1. Adds a new expense with validation (no empty fields, positive numbers)
// 2. Saves and loads expenses from browser localStorage
// 3. Calculates and displays spending per category (Food, Travel, Books, Fun, Other)
// 4. Provides a filter dropdown to view only one category at a time
// 5. Includes a working delete button for each expense
// 6. Recalculates both the total and category breakdown on any addition or deletion
// =============================================================================

// STEP 1: Select HTML elements from the DOM
const expenseForm = document.getElementById("expense-form");
const expenseNameInput = document.getElementById("expense-name");
const expenseAmountInput = document.getElementById("expense-amount");
const expenseCategorySelect = document.getElementById("expense-category");
const expenseDateInput = document.getElementById("expense-date");
const totalAmountSpan = document.getElementById("total-amount");
const expenseList = document.getElementById("expense-list");
const noExpensesMsg = document.getElementById("no-expenses-msg");
const categoryFilter = document.getElementById("category-filter");

// Category total span elements
const catTotalFood = document.getElementById("cat-total-food");
const catTotalTravel = document.getElementById("cat-total-travel");
const catTotalBooks = document.getElementById("cat-total-books");
const catTotalFun = document.getElementById("cat-total-fun");
const catTotalOther = document.getElementById("cat-total-other");

// Key used to save data in browser localStorage
const STORAGE_KEY = "student_expenses_rupees";

// STEP 2: Load saved expenses from localStorage (or start with an empty array)
let expenses = loadExpensesFromLocalStorage();

// Set default date to today
expenseDateInput.value = new Date().toISOString().split("T")[0];

// STEP 3: Handle Form Submit (Add Expense)
expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = expenseNameInput.value.trim();
  const rawAmount = expenseAmountInput.value.trim();
  const amount = parseFloat(rawAmount);
  const category = expenseCategorySelect.value;
  const date = expenseDateInput.value;

  // Validation
  if (!name || !rawAmount || !category || !date) {
    alert("Please fill in all fields (Name, Amount, Category, and Date).");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount greater than ₹0.");
    expenseAmountInput.focus();
    return;
  }

  // Create new expense object
  const newExpense = {
    id: Date.now().toString(),
    name: name,
    amount: amount,
    category: category,
    date: date
  };

  // Add to array, save, and re-render
  expenses.unshift(newExpense);
  saveExpensesToLocalStorage();
  renderExpenses();

  // Reset form
  expenseForm.reset();
  expenseDateInput.value = new Date().toISOString().split("T")[0];
});

// STEP 4: Listen for Category Filter Dropdown Changes
categoryFilter.addEventListener("change", function () {
  renderExpenses();
});

// STEP 5: Render Function (Calculates Totals, Category Breakdown & Filters List)
function renderExpenses() {
  // 1. Calculate overall total and category totals across ALL expenses
  let totalSpent = 0;
  const categoryTotals = {
    Food: 0,
    Travel: 0,
    Books: 0,
    Fun: 0,
    Other: 0
  };

  expenses.forEach(function (exp) {
    totalSpent += exp.amount;
    if (categoryTotals.hasOwnProperty(exp.category)) {
      categoryTotals[exp.category] += exp.amount;
    } else {
      categoryTotals.Other += exp.amount;
    }
  });

  // 2. Update the Overall Total on screen
  totalAmountSpan.textContent = totalSpent.toFixed(2);

  // 3. Update Category Breakdown Cards
  catTotalFood.textContent = "₹" + categoryTotals.Food.toFixed(2);
  catTotalTravel.textContent = "₹" + categoryTotals.Travel.toFixed(2);
  catTotalBooks.textContent = "₹" + categoryTotals.Books.toFixed(2);
  catTotalFun.textContent = "₹" + categoryTotals.Fun.toFixed(2);
  catTotalOther.textContent = "₹" + categoryTotals.Other.toFixed(2);

  // 4. Filter the expenses to display based on the selected dropdown value
  const selectedCategory = categoryFilter.value;
  const filteredExpenses = expenses.filter(function (exp) {
    if (selectedCategory === "all") {
      return true; // Show everything
    }
    return exp.category === selectedCategory; // Show only matching category
  });

  // 5. Draw the filtered list into the DOM
  expenseList.innerHTML = "";

  if (filteredExpenses.length === 0) {
    noExpensesMsg.style.display = "block";
    noExpensesMsg.textContent = selectedCategory === "all"
      ? "No expenses added yet. Fill in the form above to log your first expense!"
      : `No expenses found in category "${selectedCategory}".`;
  } else {
    noExpensesMsg.style.display = "none";
  }

  filteredExpenses.forEach(function (expense) {
    const li = document.createElement("li");
    li.className = "expense-item";

    li.innerHTML = `
      <div class="item-info">
        <span class="item-title">${escapeHtml(expense.name)}</span>
        <div class="item-meta">
          <span class="category-tag tag-${expense.category}">${expense.category}</span>
          <span>${expense.date}</span>
        </div>
      </div>
      <div class="item-right">
        <span class="item-amount">₹${expense.amount.toFixed(2)}</span>
        <button class="btn-delete" title="Delete this expense" aria-label="Delete">&times;</button>
      </div>
    `;

    const deleteButton = li.querySelector(".btn-delete");
    deleteButton.addEventListener("click", function () {
      deleteExpense(expense.id);
    });

    expenseList.appendChild(li);
  });
}

// STEP 6: Delete Expense
function deleteExpense(idToDelete) {
  expenses = expenses.filter(function (exp) {
    return exp.id !== idToDelete;
  });

  saveExpensesToStorage();
  renderExpenses();
}

// STEP 7: LocalStorage Helpers
function saveExpensesToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadExpensesFromStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error("Error reading saved expenses:", e);
    }
  }
  return [];
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

renderExpenses();
