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
import Estimate from './Estimate';
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

    getHeightForEstimate(estimate) {
        if (estimate.type === 'group') {
            return 80;
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
                                                    onChange={estimates => this.setState({estimates}, this.saveState.bind(this))}
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
                                <Tab eventKey={4} title="RFP">
                                    <Grid>
                                        <Row className="show-grid">
                                            <Col xs={12} md={8}>

                                            </Col>
                                            <Col xs={6} md={4}>
                                                stuff
                                            </Col>
                                        </Row>
                                    </Grid>
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
