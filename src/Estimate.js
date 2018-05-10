import Ajv from '../node_modules/ajv/dist/ajv.bundle';

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}


// Tasks schema. The "ProposalTask" object generates task objects. These task objects
// are all in a consistent format.
const tasksSchema = {
    type: "object",
    properties: {
        "key": {type: "string"},
        "name": {type: "string"},
        "hours": {type: ["number", "null"]},
        "description": {type: "string"},
        "taskNumber": {type: "string"}, // This is filled in automatically
        "type": {
            type: "string",
            enum: ['component', 'script', 'feature', 'function', 'task', 'document']
        },
        "groups": {
            type: "array",
            items: {
                type: "string"
            }
        },
    },
    additionalProperties: false,
    required: ['name', 'hours', 'type', 'groups']
};
const validateTaskData = ajv.compile(tasksSchema);


// The estimates schema - this is a complex object that contains
// a lot of custom business logic in forming these estimates
const estimateSchema = {
    type: "object",
    oneOf: [
        {
            properties: {
                "key": {type: "string"},
                "type": {
                    type: "string",
                    const: "deep_learning"
                },
                "name": {type: "string"},
                "structured": {type: "boolean"},
                "text": {type: "boolean"},
                "image": {type: "boolean"},
                "audio": {type: "boolean"},
                "video": {type: "boolean"},
                "other": {type: "boolean"},
                "convert_existing_data": {type: "boolean"},
                "custom_word_embeddings": {type: "boolean"},
                "word_positioning": {type: "boolean"},
                "part_of_speech": {type: "boolean"},
                "word_dependencies": {type: "boolean"},
                "research_cycle": {
                    type: "string",
                    enum: ['minimum', 'small', 'medium', 'large']
                },
                "confusion_matrix": {type: "boolean"},
                "roc_curve": {type: "boolean"},
                "worst_samples": {type: "boolean"},
            },
            additionalProperties: false
        },
        {
            properties: {
                "key": {type: "string"},
                "type": {
                    type: "string",
                    const: "data_annotation"
                },
                "structured": {type: "boolean"},
                "text": {type: "boolean"},
                "image": {type: "boolean"},
                "audio": {type: "boolean"},
                "video": {type: "boolean"},
                "other": {type: "boolean"}
            },
            additionalProperties: false
        },
        {
            properties: {
                "key": {type: "string"},
                "type": {
                    type: "string",
                    const: "custom"
                },
                "name": {type: "string"},
                "tasks": {
                    type: "array",
                    items: tasksSchema
                }
            },
            additionalProperties: false
        },
        {
            properties: {
                "key": {type: "string"},
                "type": {
                    type: "string",
                    const: "rpa"
                },
                "name": {type: "string"},
		"vendor_selection": {type: "boolean"},
		"deployment_configuration": {type: "boolean"},
                "processes": {
                    type: "array",
                    items: {
			    type: "object",
			    properties: {
				    "name": {type: "string"},
				    "steps": {type: "number"}
			    }

		    }
                }
            },
            additionalProperties: false
        }
    ]
};
const validateEstimateData = ajv.compile(estimateSchema);


// The schema for additional expenses, like data annotation or GPU servers
const additionalExpensesSchema = {
    type: "object",
    properties: {
        "name": {type: "string"},
        "cost": {type: ["number"]},
    },
    additionalProperties: false,
    required: ['name', 'cost']
};
const validateExpenseData = ajv.compile(additionalExpensesSchema);


class Estimate {
    constructor(data, index) {
        const valid = validateEstimateData(data);
        if (!valid) {
            const message = JSON.stringify(validateEstimateData.errors, null, 4);
            throw new Error(message);
        }

        Object.keys(data).forEach((key) => {
            this[key] = data[key];
        });

        this.estimateIndex = index;
    }

    createTasksAndExpenses() {
        let tasks = [];
        const expenses = [];
        const groups = [this.key];

        if (this.type === 'deep_learning') {
            // Create the task for this component
            tasks.push({
                type: "component",
                name: this.name,
                hours: null,
                groups: groups.concat([])
            });

            let humanTimeMultiplier = 1;
            let computePowerMultiplier = 1;
            if (this.structured) {
                humanTimeMultiplier += 1;
                computePowerMultiplier += 1;
            }
            if (this.text) {
                humanTimeMultiplier += 2;
                computePowerMultiplier += 3;
            }
            if (this.image) {
                humanTimeMultiplier += 3;
                computePowerMultiplier += 5;
            }
            if (this.audio) {
                humanTimeMultiplier += 2;
                computePowerMultiplier += 3;
            }
            if (this.video) {
                humanTimeMultiplier += 4;
                computePowerMultiplier += 20;
            }
            if (this.other) {
                humanTimeMultiplier += 3;
                computePowerMultiplier += 5;
            }

            tasks.push({
                type: "component",
                name: "Data Preparation Pipeline",
                hours: null,
                groups: groups.concat(['data_preparation'])
            });


            // Create the various tasks
            if (this.convert_existing_data) {
                tasks.push({
                    type: "script",
                    name: "Convert existing data into usable training data",
                    hours: 5 * humanTimeMultiplier,
                    groups: groups.concat(['data_preparation'])
                })
            }

            if (this.custom_word_embeddings) {
                tasks.push({
                    type: "script",
                    name: "Train custom word-vector model using fastText",
                    hours: 8,
                    groups: groups.concat(['data_preparation'])
                })
            }

            tasks.push({
                type: "script",
                name: "Prepare training data into Tensorflow format",
                hours: null,
                groups: groups.concat(['data_preparation', 'preparation_script'])
            });

            if (this.text) {
                tasks.push({
                    type: "feature",
                    name: "Include fast-text pretrained word embeddings as a feature for each word",
                    hours: 4,
                    groups: groups.concat(['data_preparation', 'preparation_script'])
                });
            }

            if (this.custom_word_embeddings) {
                tasks.push({
                    type: "feature",
                    name: "Include the custom word embeddings as a feature for each word",
                    hours: 4,
                    groups: groups.concat(['data_preparation', 'preparation_script'])
                });
            }

            if (this.word_positioning) {
                tasks.push({
                    type: "feature",
                    name: "Include word positioning, such as width, height, x and y as a feature for each word.",
                    hours: 24,
                    groups: groups.concat(['data_preparation', 'preparation_script'])
                });
            }

            if (this.part_of_speech) {
                tasks.push({
                    type: "feature",
                    name: "Include part of speech, (e.g. noun, verb, preposition, adjective, etc...) as a feature",
                    hours: 12,
                    groups: groups.concat(['data_preparation', 'preparation_script'])
                });
            }

            if (this.word_dependencies) {
                tasks.push({
                    type: "feature",
                    name: "Include dependent words (e.g. this noun applies to this verb) as features.",
                    hours: 12,
                    groups: groups.concat(['data_preparation', 'preparation_script'])
                });
            }

            tasks.push({
                type: "feature",
                name: "Serialize the dataset into TFRecords files",
                hours: 4,
                groups: groups.concat(['data_preparation', 'preparation_script'])
            });

            tasks.push({
                type: "feature",
                name: "Break the dataset up into training, testing, and validation sets.",
                hours: 4,
                groups: groups.concat(['data_preparation', 'preparation_script'])
            });

            tasks.push({
                type: "component",
                name: "Deep Learning Scripts",
                hours: null,
                groups: groups.concat(['neural_network'])
            });

            tasks.push({
                type: "script",
                name: "Create a script to train a single neural network",
                hours: null,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            tasks.push({
                type: "feature",
                name: "Base neural network architecture, with hooks to change alter hyper-parameters with command line parameters",
                hours: 4 * humanTimeMultiplier,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            tasks.push({
                type: "feature",
                name: "Ability to 'name' a neural network to assist with experimentation",
                hours: 1,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            tasks.push({
                type: "feature",
                name: "Input dataset using Tensorflow 'datasets' API",
                hours: humanTimeMultiplier,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            tasks.push({
                type: "feature",
                name: "Core training loop, including measuring training & testing accuracy",
                hours: 1.5 * humanTimeMultiplier,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            tasks.push({
                type: "feature",
                name: "Output training & testing accuracy as Tensorflow 'summary' objects which can be viewed within Tensorboard",
                hours: 2,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            tasks.push({
                type: "feature",
                name: "Output a CSV file showing testing accuracy, training accuracy, loss, etc.. after each 100 iterations of the neural network",
                hours: 2,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            tasks.push({
                type: "feature",
                name: "Save checkpoints of the neural network every 5,000 iterations",
                hours: 1,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            tasks.push({
                type: "feature",
                name: "Output a log file containing all standard output",
                hours: 1,
                groups: groups.concat(['neural_network', 'training_script'])
            });

            if (this.confusion_matrix) {
                tasks.push({
                    type: "feature",
                    name: "Compute two confusion matrixes, (training & testing), and output them as PNG files",
                    hours: 3 * humanTimeMultiplier,
                    groups: groups.concat(['neural_network', 'training_script'])
                });
            }

            if (this.roc_curve) {
                tasks.push({
                    type: "feature",
                    name: "Compute two ROC curves (training & testing), and output them as PNG files",
                    hours: 3 * humanTimeMultiplier,
                    groups: groups.concat(['neural_network', 'training_script'])
                });
            }

            if (this.worst_samples) {
                tasks.push({
                    type: "feature",
                    name: "Output a list of the bottom worst 50 samples, so that they can be manually reviewed",
                    hours: 1 * humanTimeMultiplier,
                    groups: groups.concat(['neural_network', 'training_script'])
                });
            }

            tasks.push({
                type: "script",
                name: "Create a script to retest a saved checkpoint from a neural network",
                hours: null,
                groups: groups.concat(['neural_network', 'retest_script'])
            });

            tasks.push({
                type: "feature",
                name: "Load checkpoint",
                hours: 2,
                groups: groups.concat(['neural_network', 'retest_script'])
            });

            tasks.push({
                type: "feature",
                name: "Recompute testing accuracy",
                hours: 0.4 * humanTimeMultiplier,
                groups: groups.concat(['neural_network', 'retest_script'])
            });

            const metrics = ['accuracy'];
            if (this.confusion_matrix) {
                tasks.push({
                    type: "feature",
                    name: "Recompute confusion matrix",
                    hours: 0.4 * humanTimeMultiplier,
                    groups: groups.concat(['neural_network', 'retest_script'])
                });
                metrics.push('confusion matrix');
            }

            if (this.roc_curve) {
                tasks.push({
                    type: "feature",
                    name: "Recompute ROC curve",
                    hours: 0.4 * humanTimeMultiplier,
                    groups: groups.concat(['neural_network', 'retest_script'])
                });
                metrics.push('ROC curve');
            }

            if (this.worst_samples) {
                tasks.push({
                    type: "feature",
                    name: "Recompute 50 worst testing samples",
                    hours: 0.4 * humanTimeMultiplier,
                    groups: groups.concat(['neural_network', 'retest_script'])
                });
                metrics.push('50 worst samples');
            }

            tasks.push({
                type: "feature",
                name: `Compute metrics (${metrics.join(', ')}) for the Validation set`,
                hours: 2,
                groups: groups.concat(['neural_network', 'retest_script'])
            });

            tasks.push({
                type: "script",
                name: "Script to optimize the neural network with Hyperopt",
                hours: null,
                groups: groups.concat(['neural_network', 'hyperopt_script'])
            });

            tasks.push({
                type: "feature",
                name: "Basic script for local hyper parameter optimization",
                hours: 2 * humanTimeMultiplier,
                groups: groups.concat(['neural_network', 'hyperopt_script'])
            });

            tasks.push({
                type: "feature",
                name: "Allow distributing hyperopt across the network, using Hyperopt's builtin functionality",
                hours: 2,
                groups: groups.concat(['neural_network', 'hyperopt_script'])
            });

            tasks.push({
                type: "task",
                name: "Experiment with core deep-neural network",
                hours: null,
                groups: groups.concat(['research'])
            });

            tasks.push({
                type: "task",
                name: "Setup a bunch of deep-learning enabled GPU servers in order to do research on",
                hours: 2 * humanTimeMultiplier,
                groups: groups.concat(['research'])
            });


            let numberOfExperiments;
            const humanTimePerExperiment = 2;

            const machineTimePerExperiment = 12 * computePowerMultiplier;
            const machineTimeCostPerHour = 1.0; // one canadian dollar per hour
            const machineTimePerExperimentContingency = 8;

            if (this.research_cycle === 'minimum') {
                numberOfExperiments = 10;
            }
            else if (this.research_cycle === 'small') {
                numberOfExperiments = 25;
            }
            else if (this.research_cycle === 'medium' || !this.research_cycle) {
                numberOfExperiments = 75;
            }
            else if (this.research_cycle === 'large') {
                numberOfExperiments = 150;
            }

            tasks.push({
                type: "task",
                name: "Run experiments with various hyper-parameter configurations in order to optimize accuracy",
                hours: humanTimePerExperiment * numberOfExperiments,
                groups: groups.concat(['research'])
            });

            expenses.push({
                name: "Data Preparation Pipeline",
                cost: numberOfExperiments * (machineTimePerExperiment + machineTimePerExperimentContingency) * machineTimeCostPerHour,
            });

            tasks.push({
                type: "task",
                name: "Deployment",
                hours: null,
                groups: groups.concat(['deployment'])
            });

            tasks.push({
                type: "component",
                name: "Create a Python API server which serves the neural network model",
                hours: 5 * humanTimeMultiplier,
                groups: groups.concat(['deployment'])
            });

            tasks.push({
                type: "task",
                name: "Create Python setuptools configuration for API server",
                hours: 2,
                groups: groups.concat(['deployment'])
            });

            tasks.push({
                type: "script",
                name: "Shell script to install all the dependencies of the API server",
                hours: 4,
                groups: groups.concat(['deployment'])
            });

            tasks.push({
                type: "document",
                name: "Documentation describing the front-facing endpoints of the API server, to be used by people consuming the API",
                hours: 4 * humanTimeMultiplier,
                groups: groups.concat(['deployment'])
            });
        }

        if (this.type === 'deep_learning') {

        }

        if (this.type === 'rpa') {
            tasks.push({
                type: "component",
                name: this.name,
                hours: null,
                groups: groups
            });

	    if (this.vendor_selection)
	    {
	            tasks.push({
        	        type: "task",
	                name: "RPA Vendor Selection",
	                hours: null,
	                groups: groups.concat(['vendor_selection'])
	            });

	            tasks.push({
        	        type: "task",
	                name: "Initial technical discovery session",
	                hours: 4,
	                groups: groups.concat(['vendor_selection'])
	            });

	            tasks.push({
        	        type: "task",
	                name: "Preparation of pro/con sheets on compatible vendors",
	                hours: 10,
	                groups: groups.concat(['vendor_selection'])
	            });

	            tasks.push({
        	        type: "task",
	                name: "Vendor selection session with team",
	                hours: 2,
	                groups: groups.concat(['vendor_selection'])
	            });
	    }
	
	    if (this.deployment_configuration)
	    {
	            tasks.push({
        	        type: "task",
	                name: "RPA Deployment Configuration",
	                hours: null,
	                groups: groups.concat(['deployment_configuration'])
	            });

	            tasks.push({
        	        type: "task",
	                name: "Go through security protocols to get team access to servers",
	                hours: 8,
	                groups: groups.concat(['deployment_configuration'])
	            });

	            tasks.push({
        	        type: "task",
	                name: "Configure the central RPA bot software and cluster",
	                hours: 40,
	                groups: groups.concat(['deployment_configuration'])
	            });
	    }    
	
	    this.processes.forEach((process) => {
		    if (process.name.trim())
		    {
			    tasks.push({
				    type: "component",
				    name: process.name,
				    hours: null,
				    groups: groups.concat(['rpa-' + process.name])
			    });
			    tasks.push({
				    type: "component",
				    name: "Job shadowing of person performing the process",
				    hours: 2,
				    groups: groups.concat(['rpa-' + process.name])
			    });

                            // Calculate how long we expect to be configuring this process within the RPA tool
			    const configHoursPerStep = 0.15;
			    const fieldTestingHoursPerStep = 0.10;
			    const totalStepConfigTime = process.steps * configHoursPerStep;
			    const totalStepFieldTestingTime = process.steps * fieldTestingHoursPerStep;

			    tasks.push({
				    type: "task",
				    name: "Initial configuration of the process steps within the RPA tool",
				    hours: Math.ceil(8 + totalStepConfigTime),
				    groups: groups.concat(['rpa-' + process.name])
			    });

			    tasks.push({
				    type: "task",
				    name: "Process field testing with operations team and refinement",
				    hours: Math.ceil(2 + totalStepFieldTestingTime),
				    groups: groups.concat(['rpa-' + process.name])
			    });

			    tasks.push({
				    type: "task",
				    name: "Integration of RPA process into other company systems",
				    hours: 8,
				    groups: groups.concat(['rpa-' + process.name])
			    });
		    }
	    });

        }


        if (this.type === 'custom') {
            tasks.push({
                type: "component",
                name: this.name,
                hours: null,
                groups: groups
            });

            tasks = tasks.concat(this.tasks.map((task) => {
                return {
                    type: task.type,
                    name: task.name,
                    hours: Number(task.hours),
                    description: task.description,
                    groups: groups,
                };
            }));

            // The last item in the task list is often a blank one, so remove it if needed
            if (!tasks[tasks.length - 1].name.trim()) {
                tasks.pop();
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

    calculateHours() {
        const tasks = this.createTasksAndExpenses().tasks;
        let totalHours = 0;
        tasks.forEach((task) => {
            totalHours += task.hours;
        });
        return totalHours;
    }

    calculateExpenses() {
        const expenses = this.createTasksAndExpenses().expenses;
        let totalExpenses = 0;
        expenses.forEach((expense) => {
            totalExpenses += expense.cost;
        });
        return totalExpenses;
    }

    static validateEstimateData(data) {
        const result = validateEstimateData(data);
        if (!result) {
            Estimate.validateEstimateData.errors = validateEstimateData.errors;
        }
        return result;
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


export default Estimate;
