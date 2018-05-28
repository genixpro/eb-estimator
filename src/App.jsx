import React, {Component} from 'react';
import {
    Grid,
    Row,
    Col,
    Tabs,
    Tab,
    Button,
    ListGroup,
    ListGroupItem,
    Table,
    ControlLabel,
    Form,
    FormGroup,
    FormControl,
    Checkbox
} from 'react-bootstrap';
import EstimateConfiguration from './EstimateConfiguration.jsx';
import ProposalTask from './ProposalTask.jsx';
import VisualProposalTask from "./VisualProposalTask";
import NumberFormat from 'react-number-format';
import Estimate from './Estimate';
import ContractTaskOrder from './ContractTaskOrder';
import clone from 'clone';


import SortableTree, {addNodeUnderParent, removeNodeAtPath, changeNodeAtPath} from 'react-sortable-tree';
import 'react-sortable-tree/style.css'; // This only needs to be imported once in your app

import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        let data = window.localStorage.getItem("data");
        if (data) {
            data = JSON.parse(data);
        }

        if (!data) {
            data = this.getDefaultState();
        }
        else {
            data.selected = 0;
        }

        this.state = data;
        this.saveState();
    }

    getDefaultProject() {
        return {
            name: "new_name",
            includeRepositorySetup: true,
            includeLearningExistingCode: false,
            currentEstimateKey: 1,
            skillRates: {
                "aiEngineer": 150,
                "fullStackDeveloper": 100,
                "rpaConsultant": 100
            },
            numberOfPayments: 2,
            estimates: []
        };
    }

    getDefaultState() {
        const defaultProject = this.getDefaultProject();
        return {
            projects: [defaultProject],
            selected: 0
        };
    }

    changeName(event) {
        const project = this.state.projects[this.state.selected];
        project.name = event.target.value;
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    changeSkillRate(type, event) {
        const project = this.state.projects[this.state.selected];
        project.skillRates[type] = event.target.value;
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    changeNumberOfPayments(event) {
        const project = this.state.projects[this.state.selected];
        project.numberOfPayments = event.target.value;
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    saveState() {
        const data = this.state;
        window.localStorage.setItem('data', JSON.stringify(data));
    }

    checkboxClicked(optionKey, event) {
        const project = this.state.projects[this.state.selected];
        project[optionKey] = !project[optionKey];
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    nextEstimateKey() {
        const key = this.state.projects[this.state.selected].currentEstimateKey;
        const project = this.state.projects[this.state.selected];
        project.key = key + 1;
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
        return "estimate-" + key.toString();
    }

    addDeepLearningEstimate() {
        const newEstimate = {
            title: "New Deep Learning Algorithm.",
            key: this.nextEstimateKey(),
            type: "deep_learning",
            children: []
        };
        const project = this.state.projects[this.state.selected];
        project.estimates = project.estimates.concat([newEstimate]);
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    addDataAnnotation() {
        const newEstimate = {
            key: this.nextEstimateKey(),
            type: "data_annotation",
            children: []
        };
        const project = this.state.projects[this.state.selected];
        project.estimates = project.estimates.concat([newEstimate]);
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    addCustom() {
        const newEstimate = {
            key: this.nextEstimateKey(),
            type: "custom",
            title: "",
            tasks: [{
                type: "component",
                title: "New Task",
                hours: 0,
                skill: "fullStackDeveloper",
                children: []
            }],
            children: []
        };
        const project = this.state.projects[this.state.selected];
        project.estimates = project.estimates.concat([newEstimate]);
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    addRPAEstimate() {
        const newEstimate = {
            title: "New RPA Estimate",
            key: this.nextEstimateKey(),
            type: "rpa",
            processes: [{
                name: "New Process",
                steps: 5
            }],
            children: []
        };
        const project = this.state.projects[this.state.selected];
        project.estimates = project.estimates.concat([newEstimate]);
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    addGroup() {
        const newEstimate = {
            key: this.nextEstimateKey(),
            type: "group",
            title: "New Estimate Group",
            children: []
        };
        const project = this.state.projects[this.state.selected];
        project.estimates = project.estimates.concat([newEstimate]);
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }

    addUserInterfaceEstimate() {
        const newEstimate = {
            key: this.nextEstimateKey(),
            type: "user_interface",
            title: "User Interface",
            components: [{
                type: "component",
                title: "New Task",
                hours: 0
            }],
            children: []
        };
        const project = this.state.projects[this.state.selected];
        project.estimates = project.estimates.concat([newEstimate]);
        this.setState({projects: this.state.projects}, this.saveState.bind(this));
    }


    resetProject() {
        window.bootbox.confirm("Are you sure you want to reset your estimates? You will lose everything.", (result) => {
            if (result) {
                this.setState(state => {
                    state.projects[state.selected] = this.getDefaultProject();
                    return state;
                }, this.saveState.bind(this));
            }
        });
    }

    deleteEstimate(path) {
        this.setState(state => {
            const project = state.projects[state.selected];
            project.estimates = removeNodeAtPath({
                treeData: project.estimates,
                path: path,
                getNodeKey: ((data) => data.treeIndex)
            });
            return {
                projects: state.projects
            };
        }, this.saveState.bind(this));
    }

    estimateChanged(path, newEstimate) {
        this.setState(state => {
            const project = state.projects[state.selected];
            project.estimates = changeNodeAtPath({
                treeData: project.estimates,
                path: path,
                newNode: newEstimate,
                getNodeKey: ((data) => data.treeIndex)
            });
            return {
                projects: state.projects
            }
        }, this.saveState.bind(this));
    }

    createProjectSetupTasks() {
        const tasks = [];

        if (this.state.projects[this.state.selected].includeRepositorySetup || this.state.projects[this.state.selected].includeLearningExistingCode) {
            const projectSetup = {
                type: "task",
                title: "Project Setup",
                hours: null,
                skill: "fullStackDeveloper",
                children: []
            };


            tasks.push(projectSetup);

            if (this.state.projects[this.state.selected].includeRepositorySetup) {
                projectSetup.children.push({
                    type: "task",
                    title: "Create repository, project trackers and do initial project setup",
                    hours: 2,
                    skill: "fullStackDeveloper",
                    children: []
                });
            }

            if (this.state.projects[this.state.selected].includeLearningExistingCode) {
                projectSetup.children.push({
                    type: "task",
                    title: "Spend time reviewing and studying the existing code-base",
                    hours: 16,
                    skill: "fullStackDeveloper",
                    children: []
                });
            }
        }

        return tasks;
    }


    createTaskList() {
        let tasks = [];

        // Create setup tasks
        tasks = tasks.concat(this.createProjectSetupTasks());

        this.state.projects[this.state.selected].estimates.forEach((data, index) => {
            const estimate = new Estimate(data, index);
            tasks = tasks.concat(estimate.createTasksAndExpenses([]).tasks);
        });

        tasks = tasks.map(clone);

        // console.log(JSON.stringify(tasks, null, 1));

        // Validate all of the tasks being output
        tasks.forEach((task) => {
            const valid = Estimate.validateTaskData(task);
            if (!valid) {
                let message = JSON.stringify(Estimate.validateTaskData.errors, null, 4);
                message += "\n\nOn this object:\n" + JSON.stringify(task, null, 4);
                throw new Error(message);
            }
        });

        // Now we assign the task-numbers
        const assignNumbers = (tasks, path) => {
            tasks.forEach((task, index) => {
                const fullPath = path.concat([index]);
                task.taskNumber = fullPath.map((index) => (index + 1).toString()).join(".");
                assignNumbers(task.children, fullPath);
            });
        };
        assignNumbers(tasks, []);

        // Now we flatten
        const allTasks = [];
        const flattenTask = (task) => {
            allTasks.push(task);
            task.children.forEach((child) => flattenTask(child));
        };
        tasks.map(flattenTask);

        // Give any task without a phase to phase 1
        allTasks.forEach((task) =>
        {
            if (task.hours && !task.phase)
            {
                task.phase = "1";
            }
        });


        return allTasks;
    }

    createVisualList() {
        const tasks = this.createTaskList();

        const visualTasks = [];

        tasks.forEach((task) => {
            if (task.image) {
                visualTasks.push(task);
            }
        });

        return visualTasks;
    }

    getTotalHours() {
        const tasks = this.createTaskList();

        let total = 0;
        tasks.forEach((task) =>
        {
            if (task.hours)
            {
                total += task.hours;
            }
        });
        return total;
    }

    getHeightForEstimate(estimate) {
        if (estimate.type === 'group') {
            return 120;
        }
        if (estimate.type === 'deep_learning') {
            return 500;
        }
        if (estimate.type === 'data_annotation') {
            return 400;
        }
        if (estimate.type === 'custom') {
            return 700;
        }
        if (estimate.type === 'rpa') {
            return 700;
        }
        if (estimate.type === 'user_interface') {
            let base = 700;

            // Add in the heights for each mockup
            estimate.components.forEach((component) => {
                if (component.mockup) {
                    const elem = document.createElement("img");
                    elem.setAttribute("src", component.mockup);
                    base += Math.min(200, elem.naturalHeight);
                }
            });

            return base;
        }
        return 200;
    }

    newProject() {
        this.setState(state => {
            state.projects.push(this.getDefaultProject());
            state.selected = state.projects.length -1;
            return state;
        }, this.saveState.bind(this));
    }

    deleteProject() {
        if (this.state.projects.length === 1)
        {
            window.bootbox.alert('Unable to delete - this is your only remaining project.')
        }
        else
        {
            window.bootbox.confirm("Are you sure you want to reset your estimates? You will lose everything.", (result) => {
                if (result) {
                    this.setState(state => {
                        if (state.projects.length > 0) {
                            state.projects.splice(state.selected, 1);
                            state.selected = 0;
                        }
                        return state;
                    }, this.saveState.bind(this));
                }
            });
        }
    }

    selectProject(projectIndex) {
        this.setState({selected: projectIndex})
    }


    createExpenseList() {
        let expenses = [];

        this.state.projects[this.state.selected].estimates.forEach((data, index) => {
            const estimate = new Estimate(data, index);
            expenses = expenses.concat(estimate.createTasksAndExpenses([]).expenses);
        });

        expenses = expenses.map(clone);

        return expenses;
    }

    computeProjectFees()
    {
        const tasks = this.createTaskList();

        const skills = [
            'aiEngineer',
            'rpaConsultant',
            'fullStackDeveloper'
        ];
        const skillTitles = [
            'AI Engineer',
            'RPA Consultant',
            'Full Stack Developer'
        ];
        const totalHoursBySkill = {};
        skills.forEach((skill) => totalHoursBySkill[skill] = 0);

        tasks.forEach((task) =>
        {
            if (task.hours)
            {
                totalHoursBySkill[task.skill] += task.hours;
            }
        });

        // Fetch the expenses so that they can be turned into fees as well
        const expenses = this.createExpenseList();

        // Create a fee for each skill
        const fees = [];
        skills.forEach((skill, skillIndex) => {
            if (totalHoursBySkill[skill])
            {
                fees.push({
                    title: `${skillTitles[skillIndex]} - ${totalHoursBySkill[skill].toFixed(1)} hours @ \$${this.state.projects[this.state.selected].skillRates[skill]} / hour`,
                    amount: totalHoursBySkill[skill] * this.state.projects[this.state.selected].skillRates[skill]
                });
            }
        });

        // Create a fee for each expense
        expenses.forEach((expense) => {
            fees.push({
                title: expense.title,
                amount: expense.cost
            });
        });


        // Now create the subtotal
        let subtotal = 0;
        fees.forEach((fee) => subtotal+= fee.amount);
        fees.push({
            title: "Subtotal",
            amount: subtotal
        });

        // Add in HST
        fees.push({
            title: "HST",
            amount: (subtotal * 0.13).toFixed(0)
        });

        // Add in total
        fees.push({
            title: "Total",
            amount: (subtotal * 1.13).toFixed(0)
        });

        return fees;
    }

    getProjectTotal()
    {
        const fees = this.computeProjectFees();
        return fees[fees.length - 1].amount; // Last entry is the total
    }

    getPaymentSchedule()
    {
        const project = this.state.projects[this.state.selected];
        project.numberOfPayments = Number(project.numberOfPayments);
        if (project.numberOfPayments <= 2)
        {
            return [0.5, 0.5];
        }
        else if (project.numberOfPayments === 3)
        {
            return [0.3, 0.4, 0.3];
        }
        else if (project.numberOfPayments === 4)
        {
            return [0.2, 0.3, 0.3, 0.2];
        }
        else if (project.numberOfPayments === 5)
        {
            return [0.2, 0.2, 0.2, 0.2, 0.2];
        }
        else
        {
            return [0.5, 0.5];
        }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Electric Brain Product Estimator</h1>
                </header>
                <Grid fluid={true}>
                    <Row className="show-grid">
                        <Col xs={12} md={1}>
                            <ListGroup>
                                {
                                    this.state.projects.map((project, index) =>
                                        <ListGroupItem href="#"
                                                       active={index === this.state.selected}
                                                       onClick={() => this.selectProject(index)}
                                                       key={index}
                                        >
                                            {project.name}
                                        </ListGroupItem>
                                    )
                                }
                            </ListGroup>
                            <Button onClick={this.newProject.bind(this)} bsStyle="primary">New Project</Button>
                            <Button onClick={this.deleteProject.bind(this)} bsStyle="danger">Delete Project</Button>
                        </Col>
                        <Col xs={12} md={11}>
                            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                                <Tab eventKey={1} title="Estimate Configuration">
                                    <Row className="show-grid">
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.resetProject.bind(this)}>Reset Project</Button>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row className="show-grid">
                                        <Col xs={12}>
                                            <FormGroup controlId="formHorizontalText">
                                                <Col componentClass={ControlLabel} sm={2}>
                                                    Project Name
                                                </Col>
                                                <Col sm={10}>
                                                    <FormControl value={this.state.projects[this.state.selected].name} type="text"
                                                                 placeholder="Project Name"
                                                                 onChange={this.changeName.bind(this)}/>
                                                </Col>
                                            </FormGroup>
                                            <FormGroup controlId="formHorizontalText">
                                                <Col componentClass={ControlLabel} sm={2}>
                                                    Options
                                                </Col>
                                                <Col sm={10}>
                                                    <Checkbox checked={this.state.projects[this.state.selected].includeRepositorySetup}
                                                              onChange={this.checkboxClicked.bind(this, 'includeRepositorySetup')}>Include
                                                        Repository Setup?</Checkbox>
                                                    <Checkbox checked={this.state.projects[this.state.selected].includeLearningExistingCode}
                                                              onChange={this.checkboxClicked.bind(this, 'includeLearningExistingCode')}>Include
                                                        learning existing codebase?</Checkbox>
                                                </Col>
                                            </FormGroup>
                                            <FormGroup controlId="formHorizontalText">
                                                <Col componentClass={ControlLabel} sm={2}>
                                                    AI Engineer Rate
                                                </Col>
                                                <Col sm={10}>
                                                    <FormControl value={this.state.projects[this.state.selected].skillRates.aiEngineer} type="number"
                                                                 placeholder="AI Engineer Rate ($/hour)"
                                                                 onChange={this.changeSkillRate.bind(this, 'aiEngineer')}/>
                                                </Col>
                                            </FormGroup>
                                            <FormGroup controlId="formHorizontalText">
                                                <Col componentClass={ControlLabel} sm={2}>
                                                    Full Stack Developer Rate
                                                </Col>
                                                <Col sm={10}>
                                                    <FormControl value={this.state.projects[this.state.selected].skillRates.fullStackDeveloper} type="number"
                                                                 placeholder="Full Stack Developer Rate ($/hour)"
                                                                 onChange={this.changeSkillRate.bind(this, 'fullStackDeveloper')}/>
                                                </Col>
                                            </FormGroup>
                                            <FormGroup controlId="formHorizontalText">
                                                <Col componentClass={ControlLabel} sm={2}>
                                                    RPA Consultant Rate
                                                </Col>
                                                <Col sm={10}>
                                                    <FormControl value={this.state.projects[this.state.selected].skillRates.rpaConsultant} type="number"
                                                                 placeholder="RPA Consultant Rate ($/hour)"
                                                                 onChange={this.changeSkillRate.bind(this, 'rpaConsultant')}/>
                                                </Col>
                                            </FormGroup>
                                            <br/>
                                            <br/>
                                            <FormGroup controlId="formHorizontalText">
                                                <Col componentClass={ControlLabel} sm={2}>
                                                    Number of Payments (2 to 5)
                                                </Col>
                                                <Col sm={10}>
                                                    <FormControl value={this.state.projects[this.state.selected].numberOfPayments} type="number"
                                                                 placeholder="Number of Payments"
                                                                 min={2}
                                                                 max={5}
                                                                 onChange={this.changeNumberOfPayments.bind(this)}/>
                                                </Col>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row className="show-grid">
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addDeepLearningEstimate.bind(this)}>Add Deep Learning
                                                Algorithm</Button>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addDataAnnotation.bind(this)}>Add Data
                                                Annotation</Button>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addRPAEstimate.bind(this)}>Add RPA</Button>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addCustom.bind(this)}>Add Custom</Button>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addGroup.bind(this)}>Add Group</Button>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addUserInterfaceEstimate.bind(this)}>Add User
                                                Interface</Button>
                                        </Col>
                                    </Row>
                                    <Row className="estimate-tree">
                                        <Col xs={12}>
                                            <div style={{"height": "1500px"}}>
                                                <SortableTree
                                                    treeData={this.state.projects[this.state.selected].estimates}
                                                    onChange={estimates => {
                                                        this.state.projects[this.state.selected].estimates = estimates;
                                                        this.setState({projects: this.state.projects}, this.saveState.bind(this))
                                                    }}
                                                    rowHeight={(data) => this.getHeightForEstimate(data.node)}
                                                    isVirtualized={false}
                                                    generateNodeProps={({node, path}) => ({
                                                        title: (
                                                            <div>
                                                                <EstimateConfiguration
                                                                    estimate={node}
                                                                    index={path}
                                                                    onChange={this.estimateChanged.bind(this, path)}
                                                                    deleteEstimate={this.deleteEstimate.bind(this, path)}
                                                                />
                                                            </div>
                                                        )
                                                    })}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </Tab>
                                <Tab eventKey={2} title="Reference">
                                    <Grid>
                                        <Table>
                                            <thead>
                                            <tr>
                                                <td>Number</td>
                                                <td>Type</td>
                                                <td>Name</td>
                                                <td>Hours</td>
                                                <td>Skill</td>
                                                <td>Cost</td>
                                                <td>Total Hours</td>
                                                <td>Total Cost</td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.createTaskList().map((task, index) => <ProposalTask task={task}
                                                                                                         index={index}
                                                                                                         key={task.taskNumber}
                                                                                                         skillRates={this.state.projects[this.state.selected].skillRates}
                                                />)
                                            }
                                            </tbody>
                                        </Table>
                                    </Grid>
                                </Tab>
                                <Tab eventKey={3} title="Visual Reference">
                                    <Grid>
                                        <Table>
                                            <thead>
                                            <tr>
                                                <td>Number</td>
                                                <td>Name</td>
                                                <td>Hours</td>
                                                <td>Image</td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.createVisualList().map((task, index) => <VisualProposalTask
                                                    task={task}
                                                    index={index}
                                                    key={task.taskNumber}/>)
                                            }
                                            </tbody>
                                        </Table>
                                    </Grid>
                                </Tab>
                                <Tab eventKey={4} title="Fees">
                                    <Grid>
                                        <h2>Fees</h2>
                                        <Table>
                                            <thead>
                                            <tr>
                                                <td>Description</td>
                                                <td>Amount</td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.computeProjectFees().map((fee) =>
                                                    <tr>
                                                        <td>{fee.title}</td>
                                                        <td>
                                                            <p style={ {'textAlign':'right', 'font-family': 'monospace'} }>
                                                                <NumberFormat value={fee.amount} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />
                                                            </p>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                            </tbody>
                                        </Table>
                                        <h2>Payments</h2>
                                        <p>The fees will be broken down into {this.state.projects[this.state.selected].numberOfPayments} payments</p>
                                        <ul>
                                            {this.getPaymentSchedule().map((payment, index) =>
                                                <li>
                                                    {(payment * 100).toFixed(0)}%
                                                    (<NumberFormat value={this.getProjectTotal() * payment} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />)
                                                    {index === 0 ? <span> is due prior to starting the project.</span> : null}
                                                    {index !== 0 ? <span> is due upon the completion of milestone ((INSERT MILESTONE HERE))</span> : null}
                                                </li>
                                            )}
                                        </ul>
                                        <p>Payment is due upon receipt of the invoice. The project will not begin until the first payment is received.</p>

                                        <p>
                                            <span>A 10% discount is offered if the full amount (100%) is paid upon acceptance of the proposal. This amounts to a </span>
                                            <NumberFormat value={this.getProjectTotal() * 0.10} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />
                                            <span>savings on this project.</span>
                                        </p>

                                        <h2>Expenses</h2>
                                        <p>There shall be no additional expenses as part of this project.</p>

                                        <h2>Cancellation</h2>
                                        <p>This project is noncancelable for any reason. You may postpone and reschedule with our approval without penalty so long as you maintain the existing payment schedule. The quality of our work is guaranteed, and if our work is not consistent with the quality described, we will refund your full fee.</p>

                                        <h2>Validity</h2>
                                        <p>This proposal and the prices stated are valid for 45 days after receipt.</p>
                                    </Grid>
                                </Tab>
                                <Tab eventKey={5} title="Contract">
                                    <ContractTaskOrder
                                        project={this.state.projects[this.state.selected]}
                                        taskList={this.createTaskList()}
                                        skillRates={this.state.projects[this.state.selected].skillRates}
                                        total={this.getProjectTotal()}
                                        totalHours={this.getTotalHours()}
                                        paymentSchedule={this.getPaymentSchedule()}
                                    />
                                </Tab>
                            </Tabs>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

export default App;
