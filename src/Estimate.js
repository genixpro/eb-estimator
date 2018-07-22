import Ajv from '../node_modules/ajv/dist/ajv.bundle';
import _ from 'underscore';
import cloneDeep from 'clone-deep';

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}


// Tasks schema. The "ProposalTask" object generates task objects. These task objects
// are all in a consistent format.
const tasksSchema = {
    type: "object",
    properties: {
        "key": {type: "string"},
        "title": {type: "string"},
        "hours": {type: ["number", "null"]},
        "description": {type: "string"},
        "taskNumber": {type: "string"}, // This is filled in automatically
        "phase": {type: "string"}, // This is filled in automatically
        "type": {
            type: "string",
            enum: ['component', 'script', 'feature', 'function', 'task', 'document']
        },
        "image": {
            type: "string"
        },
        "skill": {
            type: ["string", "null"],
            enum: ['aiEngineer', 'fullStackDeveloper', 'rpaConsultant', null]
        },
        "children": {
            type: "array",
            items: {$ref: "#/"}
        },
    },
    additionalProperties: false,
    required: ['title', 'hours', 'type', 'skill', 'children']
};
const validateTaskData = ajv.compile(tasksSchema);


// The schema for additional expenses, like data annotation or GPU servers
const additionalExpensesSchema = {
    type: "object",
    properties: {
        "title": {type: "string"},
        "cost": {type: ["number"]},
    },
    additionalProperties: false,
    required: ['title', 'cost']
};
const validateExpenseData = ajv.compile(additionalExpensesSchema);


export class Estimate {
    constructor(data, estimateConfigurations, index) {

        Object.keys(data).forEach((key) => {
            this[key] = data[key];
        });

        this.estimateDataFields = Object.keys(data);
        this.estimateIndex = index;
        this.estimateConfigurations = estimateConfigurations;
        this.estimateConfiguration = estimateConfigurations[data.type];
    }

    prepareInitializationScript(script)
    {
        let initializationScript = "";

        if (this.estimateConfiguration.calc) {
            Object.entries(this.estimateConfiguration.calc).reverse().forEach((item) => {
                if (script.indexOf(item[0]) !== -1 || initializationScript.indexOf(item[0]) !== -1) {
                    initializationScript = `const ${item[0]} = ${item[1]};` + initializationScript;
                }
            });
        }

        this.estimateDataFields.reverse().forEach((field) =>
        {
            if (_.isString(this[field]) || _.isNull(this[field]) || _.isNumber(this[field]) || _.isBoolean(this[field]))
            {
                if (script.indexOf(field) !== -1 || initializationScript.indexOf(field) !== -1)
                {
                    initializationScript =  `const ${field} = ${JSON.stringify(this[field])};` + initializationScript;
                }
            }
        });

        return initializationScript;
    }

    createTasksAndExpenses() {
        let tasks = [];
        let expenses = [];

        const recurse = (taskConfig) =>
        {
            // Eval the task config to allow parameters to
            let script = "";

            if (taskConfig.if)
            {
                script += `shouldInclude = ${taskConfig.if};`;
            }
            script += "task = {";
            script += ` "title": \`${taskConfig.title || ""}\`,`;
            script += ` "type": \`${taskConfig.type || null}\`,`;
            script += ` "hours": ${taskConfig.hours ? `Math.ceil(${taskConfig.hours})` : null},`;
            script += ` "skill": \`${taskConfig.skill || null}\`,`;
            script += ` "description": \`${taskConfig.description || ""}\`,`;
            script += ` "image": \`${taskConfig.image || ""}\`,`;
            script += ` "children": []`;
            script += `};`;


            script = this.prepareInitializationScript(script) + script;

            const allTasks = [];
            let task = {};
            let shouldInclude = true;

            const processItem = (item) => {
                eval(script);
                if (shouldInclude && (!taskConfig.emptyField || (item[taskConfig.emptyField] && item[taskConfig.emptyField].trim())))
                {
                    if (taskConfig.children)
                    {
                        taskConfig.children.forEach((child) => {task.children = task.children.concat(recurse(child));});
                    }
                    allTasks.push(cloneDeep(task));
                }
            };

            if (taskConfig.each)
            {
                this[taskConfig.each].forEach(processItem);
            }
            else
            {
                processItem(null);
            }

            return allTasks;
        };

        const processExpense = (expenseConfig) => {
            // Eval the expense config to allow parameters to
            let script = "";

            if (expenseConfig.if) {
                script += `shouldInclude = \`${expenseConfig.if}\`;`;
            }
            script += "expense = {";
            script += ` "title": \`${expenseConfig.title || ""}\`,`;
            script += ` "cost": ${expenseConfig.cost || null},`;
            script += `};`;

            script = this.prepareInitializationScript(script) + script;

            let expense = {};
            let shouldInclude = true;
            eval(script);
            if (shouldInclude)
            {
                expenses.push(expense);
            }
        };

        if (_.isArray(this.estimateConfiguration.tasks))
        {
            this.estimateConfiguration.tasks.forEach((taskConfig) =>
            {
                tasks = tasks.concat(recurse(taskConfig));
            });
        }

        if (_.isArray(this.estimateConfiguration.expenses))
        {
            this.estimateConfiguration.expenses.forEach(processExpense);
        }

        if(this.type === 'group')
        {
            let children = [];

            // Add in all the tasks for sub estimates along-side this ones task
            this.children.forEach((child, index) =>
            {
                if (this.estimateConfigurations[child.type])
                {
                    const childEstimate = new Estimate(child, this.estimateConfigurations, index);
                    const childResult = childEstimate.createTasksAndExpenses();
                    const childTasks = childResult.tasks;
                    const childExpenses = childResult.expenses;
                    children = children.concat(childTasks);
                    expenses = expenses.concat(childExpenses);
                }
            });

            if (this.phase)
            {
                // Recursively set the phase on all child estimates
                const recurse = (item) => {
                    item.phase = this.phase;

                    if (!item.children)
                    {
                        console.log(item);
                    }

                    item.children.forEach(recurse);
                };
                children.forEach(recurse);
            }

            // Add in all sub-estimates as children
            tasks = tasks.concat({
                type: "component",
                title: this.title,
                hours: null,
                skill: null,
                description: "",
                children: children
            });
        }
        else
        {
            if (this.children)
            {
                // Add in all the tasks for sub estimates along-side this ones task
                this.children.forEach((child, index) =>
                {
                    if (this.estimateConfigurations[child.type])
                    {
                        const childEstimate = new Estimate(child, this.estimateConfigurations, index);
                        const childResult = childEstimate.createTasksAndExpenses();
                        const childTasks = childResult.tasks;
                        const childExpenses = childResult.expenses;
                        tasks = tasks.concat(childTasks);
                        expenses = expenses.concat(childExpenses);
                    }
                });
            }
        }

        // Validate all of the expenses being output
        // TODO: Move to app.jsx
        expenses.forEach((expense) => {
            const valid = validateExpenseData(expense);
            if (!valid) {
                let message = JSON.stringify(validateTaskData.errors, null, 4);
                message += "\n\nOn this object:\n" + JSON.stringify(expense, null, 4);
                throw new Error(message);
            }
        });

        return {tasks, expenses};
    }

    walkAllTasks(callback)
    {
        const tasks = this.createTasksAndExpenses([]).tasks;

        const recurse = (tasks) =>
        {
            tasks.forEach((task) =>
            {
                callback(task);
                recurse(task.children);
            });
        };
        recurse(tasks);
    }

    calculateHours() {
        let totalHours = 0;
        this.walkAllTasks((task) => {
            totalHours += task.hours;
        });
        return totalHours;
    }

    calculateExpenses() {
        const expenses = this.createTasksAndExpenses([]).expenses;
        let totalExpenses = 0;
        expenses.forEach((expense) => {
            totalExpenses += expense.cost;
        });
        return totalExpenses;
    }

    static validateTaskData(data) {
        const result = validateTaskData(data);
        if (!result) {
            Estimate.validateTaskData.errors = validateTaskData.errors;
        }
        return result;
    }

    static validateExpenseData(data) {
        const result = validateExpenseData(data);
        if (!result) {
            Estimate.validateExpenseData.errors = validateExpenseData.errors;
        }
        return result;
    }
}

export class Task {
    constructor(data) {
        const valid = validateTaskData(data);
        if (!valid) {
            const message = JSON.stringify(validateTaskData.errors, null, 4);
            throw new Error(message);
        }

        Object.keys(data).forEach((key) => {
            this[key] = data[key];
        });
    }

    hasChildrenInPhase(phase)
    {
        const recurse = (task) =>
        {        // Searches all children recursively to see if any have a task in this phase
            if (task.phase === phase)
            {
                return true;
            }

            for (let i = 0; i < task.children.length; i += 1)
            {
                if (recurse(new Task(task.children[i])))
                {
                    return true;
                }
            }
            return false;
        };

        return recurse(this);
    }
}

export default Estimate;
