import { fetchPlans, fetchInitialSubscriptions } from './data.js';

const loadingState = document.querySelector('#loading-state');
const successState = document.querySelector('#success-state');
const errorState = document.querySelector('#error-state');
const retryBtn = document.querySelector('#retry-btn');
const subscriptionContainer = document.querySelector('#subscription-container');
const planFilterContainer = document.querySelector('#plan-filter-container');
const statusFilterContainer = document.querySelector('#status-filter-container');
const subscriptionHeaderTable = ['Name', 'Plan', 'Amount', 'Status', 'Date'];
const subscriptionKeys = ['name', 'plan', 'amount', 'status', 'date'];
const subscriptionFormatter = {
    amount: (amountToBeFormated, subscription) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountToBeFormated),
    status: (status, subscription) => createToggleBtn(status, subscription)
}
const summaryContainer = document.querySelector('#summary-container');
const selectPlan = document.querySelector("#plan-select");
const selectStatus = document.querySelector("#status-select");
const statuses = ['active', 'paused', 'cancelled'];
let allSubscriptions = [];

function displayNoneStyle(...elements) {
    elements.forEach(element => {
        element.style.display = `none`
    })

}

function clearFormData(event, ...elements) {
    event.currentTarget.reset();
    displayNoneStyle(...elements);
}


function validateAddSubscriptionForm() {
    document.querySelector('#subscription-form').addEventListener('submit', function (event) {
        event.preventDefault();
        let isValid = true;
        let nameInput = document.querySelector('#subscription-name').value.trim();
        let amountInput = document.querySelector('#subscription-amount').value;
        let statusInput = document.querySelector('#status-select').value;
        let dateInput = document.querySelector('#subscription-date').value;
        let planInput = document.querySelector('#plan-select').value;

        if (!nameInput) {
            document.querySelector('#subscription-name-status').textContent = `Name shouldn't be empty`;
            document.querySelector('#subscription-name-status').style.display = `block`
            isValid = false;
        } else {
            displayNoneStyle(document.querySelector('#subscription-name-status'));
        }

        if (amountInput <= 0) {
            document.querySelector('#subscription-amount-status').textContent = `amount should be positve`;
            document.querySelector('#subscription-amount-status').style.display = `block`
            isValid = false;
        } else {
            displayNoneStyle(document.querySelector('#subscription-amount-status'));
        }

        if (isValid) {
            addNewSubscription({
                id: crypto.randomUUID,
                name: nameInput,
                plan: planInput,
                amount: Number.parseFloat(amountInput),
                status: statusInput,
                date: dateInput
            })

            clearFormData(
                event,
                document.querySelector('#subscription-name-status'),
                document.querySelector('#subscription-amount-status')
            )
        }
    })
}

function addNewSubscription(newSubscription) {
    allSubscriptions.unshift(newSubscription)
    renderSubscriptions(
        allSubscriptions,
        subscriptionHeaderTable,
        subscriptionKeys,
        subscriptionFormatter);
    getSummary();
}

function showState(state) {
    loadingState.style.display = (state === 'LOADING') ? 'block' : 'none';
    successState.style.display = (state === 'SUCCESS') ? 'block' : 'none';
    errorState.style.display = (state === 'ERROR') ? 'block' : 'none';

}

function renderSubscriptions(subscriptionsData, subscriptionHeaderTable, subscriptionKeys, subscriptionFormatter) {
    subscriptionContainer.replaceChildren(); //clear before load
    let subscriptionTable = createTable(subscriptionHeaderTable);
    subscriptionTable = createTableRowsFromObject(subscriptionTable, subscriptionsData, subscriptionKeys, subscriptionFormatter)
    appendDeleteActionColumnForList(subscriptionTable, subscriptionsData);
    subscriptionContainer.appendChild(subscriptionTable);
    console.log(subscriptionsData)
}

function renderFilters(filterData, filterContainer, type) {

    filterContainer.textContent = `Filter subscriptions by ${type} : `
    let btnFilter = `<button data-filter='All'>'All'</button>`
    filterData.forEach(item => {
        btnFilter += `<button data-filter='${item}'>'${item}'</button>`
    })
    filterContainer.insertAdjacentHTML('beforeend', btnFilter)

}

function createTable(tableHeader) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');

    const headerRow = document.createElement('tr');
    tableHeader.forEach(headerName => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerName;
        headerRow.appendChild(headerCell);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    return table;
}

function appendDeleteActionColumnForList(table, list) {
    //append header action 
    const headerActionCell = document.createElement('th');
    const headerRow = table.tHead.rows[0];

    headerActionCell.textContent = 'Action';
    headerRow.appendChild(headerActionCell);

    //append cells to columns 
    const tableBodyRows = Array.from(table.tBodies[0].rows);
    tableBodyRows.forEach((row, index) => {
        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('deleteSubscription')
        deleteBtn.dataset.subscriptionId = list[index].id;


        const cell = row.insertCell(-1);
        cell.appendChild(deleteBtn);
    })

}

function createTableRowsFromObject(table, data, keys, formatter = {}) {
    const tbody = document.createElement('tbody');

    data.forEach(rowObj => {
        const row = document.createElement('tr');
        keys.forEach(key => {
            const td = document.createElement('td');
            const format = formatter[key];
            const value = format ? format(rowObj[key], rowObj) : rowObj[key];
            if (value instanceof Node) {
                rowObj[key] = value.textContent;
                td.appendChild(value);
            } else {
                td.textContent = value;
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function createToggleBtn(btnTextContent, data) {
    const btn = document.createElement('button')
    btn.textContent = btnTextContent;
    btn.addEventListener('click', function () {
        const newStatus = switchActiveToPausedStatus(btn.textContent);;
        btn.textContent = newStatus;
        data.status = newStatus;
        getSummary();
    })
    return btn;

}

function switchActiveToPausedStatus(status) {
    if (status === 'active')
        return 'paused';
    else if (status === 'paused')
        return 'active';
    return 'cancelled';
}


function renderErrorState(errorMsg) {
    document.querySelector('#error-msg').textContent = `Something went wrong: ${errorMsg}`;
}

async function loadDashboard() {
    showState('LOADING');
    try {
        let [plans, subscriptions] = await Promise.all(
            [fetchPlans(), fetchInitialSubscriptions()]
        );
        allSubscriptions = subscriptions;
        renderSubscriptions(subscriptions, subscriptionHeaderTable, subscriptionKeys, subscriptionFormatter);
        renderFilters(plans, planFilterContainer, 'Plan');
        renderFilters(statuses, statusFilterContainer, 'Status');

        renderSelectFormElement(plans, selectPlan)
        renderSelectFormElement(statuses, selectStatus)
        getSummary();
        showState('SUCCESS')

    } catch (err) {
        renderErrorState(err.message);
        showState('ERROR');
    }
}

function filterSubscriptionsByPlan(subscriptions, planName) {
    if (planName === 'All')
        return subscriptions;
    return subscriptions.filter(subscription => subscription.plan === planName)

}


function filterSubscriptionsByStatus(subscriptions, status) {
    if (status === 'All')
        return subscriptions;
    return subscriptions.filter(subscription => subscription.status === status)

}

function deleteSubscription(subscriptionId) {
    const subscriptionIndex = allSubscriptions.findIndex(subscription =>
        subscription.id === subscriptionId
    );

    if (subscriptionIndex === -1) return;

    allSubscriptions.splice(subscriptionIndex, 1);

}

function renderSelectFormElement(data, selectElement) {
    data.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    })
}

function getSummary() {
    const numOfActiveSubscriptions = filterSubscriptionsByStatus(allSubscriptions, 'active').length;
    const totalMonthlyCost = calculateTotalMonthlyCostForSubscriptions(allSubscriptions);
    summaryContainer.textContent = ` For currently visible subscriptions: ${numOfActiveSubscriptions} active subscription, and the total monthly cost is ${totalMonthlyCost} `
}

function calculateTotalMonthlyCostForSubscriptions(subscriptions) {
    return subscriptions.reduce((total, subscription) => total + subscription.amount, 0);
}

function setupEventDelegationFilter(filterContainer, filterMethod) {
    filterContainer.addEventListener('click', (event) => {

        const button = event.target.closest('button');
        if (!button || !filterContainer.contains(button)) return;

        const filterValue = button.dataset.filter;
        const filtered = filterMethod(allSubscriptions, filterValue);
        renderSubscriptions(filtered, subscriptionHeaderTable, subscriptionKeys, subscriptionFormatter);
        getSummary();
    });
}

function setupEventDelegationDelete(parentContainer, deleteClass) {
    parentContainer.addEventListener('click', (event) => {

        const button = event.target.closest(deleteClass);
        if (!button || !parentContainer.contains(button)) return;

        const subscriptionId = button.dataset.subscriptionId;
        deleteSubscription(subscriptionId);

        renderSubscriptions(allSubscriptions, subscriptionHeaderTable, subscriptionKeys, subscriptionFormatter);
        getSummary();
    });
}



function loadApp() {
    loadDashboard();
    retryBtn.addEventListener('click', loadDashboard);
    setupEventDelegationFilter(statusFilterContainer, filterSubscriptionsByStatus)
    setupEventDelegationFilter(planFilterContainer, filterSubscriptionsByPlan)
    setupEventDelegationDelete(subscriptionContainer, '.deleteSubscription')
    validateAddSubscriptionForm()
}

loadApp();
