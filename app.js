/* eslint-disable no-param-reassign */
/* eslint-disable func-names */

// BUDGET CONTROLLER ===============================
const budgetController = (function () {
    const Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage
    }

    const Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    const data = {
        allItems: {
            exp : [],
            inc  : []
        },
        totals: {
            exp : 0,
            inc : 0
        },
        budget     : 0,
        percentage : -1
    }

    const calculateTotal = function (type) {
        let sum = 0

        data.allItems[type].forEach(cur => {
            sum += cur.value
        })

        data.totals[type] = sum
    }

    return {
        addItem (type, des, val) {
            let newItem,
                ID

            // ID equal last id + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }

            // Create new Item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else {
                newItem = new Income(ID, des, val)
            }

            // Push it into Data structure
            data.allItems[type].push(newItem)

            // Return the new element
            return newItem
        },

        deleteItem (type, id) {
            const ids = data.allItems[type].map(current => current.id)

            const index = ids.indexOf(id)

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget () {
            // 1. Calculate total income and expenses
            calculateTotal('exp')
            calculateTotal('inc')

            // 2. Calculate the budget: Income - Expenses
            data.budget = data.totals.inc - data.totals.exp

            // 3. Calculate the percentage of Income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
        },

        calculatePercentages () {
            data.allItems.exp.forEach(cur => {
                cur.calcPercentage(data.totals.inc)
            })
        },

        getPercentages () {
            const allPerc = data.allItems.exp.map(cur => cur.getPercentage())
            return allPerc
        },

        getBudget () {
            return {
                budget     : data.budget,
                totalInc   : data.totals.inc,
                totalExp   : data.totals.exp,
                percentage : data.percentage
            }
        },

        testing () {
            console.log(data)
        }
    }
}())

// UI CONTROLLER ===============================
const UIController = (function () {
    const DOMstrings = {
        inputType         : '.add__type',
        inputDescription  : '.add__description',
        inputValue        : '.add__value',
        inputBtn          : '.add__btn',
        incomeContainer   : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel       : '.budget__value',
        incomeLabel       : '.budget__income--value',
        expensesLabel     : '.budget__expenses--value',
        percentageLabel   : '.budget__expenses--percentage',
        container         : '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel         : '.budget__title--month'
    }

    const formatNumber = function (num, type) {
        num = Math.abs(num)
        num = num.toFixed(2)

        const numSplit = num.split('.')
        let int = numSplit[0]
        if (int.length > 3) {
            int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`
        }

        const dec = numSplit[1]

        return `${type === 'exp' ? '-' : '+'} ${int}.${dec}`
    }

    const nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i += 1) {
            callback(list[i], i)
        }
    }

    return {
        getInput () {
            return {
                // Either 'inc' or 'exp'
                type        : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value       : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem (obj, type) {
            let html,
                newHtml,
                element
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%Description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%Description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">10%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%Description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem (selectorID) {
            const el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFields () {
            const fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`)

            const fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(current => {
                // eslint-disable-next-line no-param-reassign
                current.value = ''
            })

            fieldsArr[0].focus()
        },

        displayBudget (obj) {
            const type = obj.budget > 0 ? 'inc' : 'exp'

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage} %`
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
        },

        displayPercentages (percentages) {
            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel)

            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = `${percentages[index]}%`
                } else {
                    current.textContent = '---'
                }
            })
        },

        displayMonth () {
            const months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ]

            const now = new Date(),
                year = now.getFullYear(),
                month = now.getMonth()
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`
        },

        changedType () {
            const fields = document.querySelectorAll(`${DOMstrings.inputType},${DOMstrings.inputDescription},${DOMstrings.inputValue}`)

            nodeListForEach(fields, cur => {
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },

        getDOMstrings () {
            return DOMstrings
        }
    }
}())

// GLOBAL APP CONTROLLER ===============================
const controller = (function (budgetCtrl, UICtrl) {
    const setupEventListeners = function () {
        const DOM = UICtrl.getDOMstrings()

        // eslint-disable-next-line no-use-before-define
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', ({ keyCode, which }) => {
            if (keyCode === 13 || which === 13) {
                // eslint-disable-next-line no-use-before-define
                ctrlAddItem()
            }
        })

        // eslint-disable-next-line no-use-before-define
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    }

    const updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget()

        // 2. Return the budget
        const budget = budgetCtrl.getBudget()

        // 3. Display budget on UI
        UICtrl.displayBudget(budget)
    }

    const updatePercentages = function () {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages()

        // 2. Read percentages from budget controller
        const percentages = budgetCtrl.getPercentages()

        // 3. Update UI with new percentages
        UICtrl.displayPercentages(percentages)
    }

    const ctrlAddItem = function () {
        // 1. Get field data
        const {
            type,
            description,
            value
        } = UICtrl.getInput()

        // eslint-disable-next-line no-restricted-globals
        if (description !== '' && !isNaN(value) && value > 0) {
            // 2. Add item to budget controller
            const newItem = budgetCtrl.addItem(type, description, value)

            // 3. Add item to UI
            UICtrl.addListItem(newItem, type)

            // 4. Clear the fields
            UICtrl.clearFields()

            // 5. Calculate and update budget
            updateBudget()

            // 6. Update Percentages
            updatePercentages()
        }
    }

    const ctrlDeleteItem = function (event) {
        const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if (itemID) {
            const splitID = itemID.split('-'),
                type = splitID[0],
                ID = parseInt(splitID[1], 10)

            // 1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID)

            // 2. Delete from UI
            UICtrl.deleteListItem(itemID)

            // 3. Update and show new Budget
            updateBudget()

            // 4. Update Percentages
            updatePercentages()
        }
    }

    return {
        init () {
            console.log('Starting application...')
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget     : 0,
                totalInc   : 0,
                totalExp   : 0,
                percentage : 0
            })
            setupEventListeners()
        }
    }
}(budgetController, UIController))

controller.init()
