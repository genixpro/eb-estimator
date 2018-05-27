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
    FormGroup,
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

        this.state = data;
        this.saveState();
    }


    getDefaultState() {
        return {
            includeRepositorySetup: true,
            includeLearningExistingCode: false,
            currentEstimateKey: 1,
            estimates: []
        };
    }

    saveState() {
        const data = this.state;
        window.localStorage.setItem('data', JSON.stringify(data));
    }

    checkboxClicked(optionKey, event) {
        const value = this.state[optionKey];
        this.setState({[optionKey]: !value}, this.saveState.bind(this));
    }

    nextEstimateKey() {
        const key = this.state.currentEstimateKey;
        this.setState({currentEstimateKey: key + 1}, this.saveState.bind(this));
        return "estimate-" + key.toString();
    }

    addDeepLearningEstimate() {
        const newEstimate = {
            title: "New Deep Learning Algorithm.",
            key: this.nextEstimateKey(),
            type: "deep_learning",
            children: []
        };
        const estimates = this.state.estimates.concat([newEstimate]);
        this.setState({estimates: estimates}, this.saveState.bind(this));
    }

    addDataAnnotation() {
        const newEstimate = {
            key: this.nextEstimateKey(),
            type: "data_annotation",
            children: []
        };
        const estimates = this.state.estimates.concat([newEstimate]);
        this.setState({estimates: estimates}, this.saveState.bind(this));
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
                groups: []
            }],
            children: []
        };
        const estimates = this.state.estimates.concat([newEstimate]);
        this.setState({estimates: estimates}, this.saveState.bind(this));
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
        const estimates = this.state.estimates.concat([newEstimate]);
        this.setState({estimates: estimates}, this.saveState.bind(this));
    }

    addGroup() {
        const newEstimate = {
            key: this.nextEstimateKey(),
            type: "group",
            title: "New Estimate Group",
            children: []
        };
        const estimates = this.state.estimates.concat([newEstimate]);
        this.setState({estimates: estimates}, this.saveState.bind(this));
    }

    addUserInterfaceEstimate() {
        const newEstimate = {
            key: this.nextEstimateKey(),
            type: "user_interface",
            title: "User Interface",
            components: [{
                type: "component",
                title: "New Task",
                hours: 0,
                groups: []
            }],
            children: []
        };
        const estimates = this.state.estimates.concat([newEstimate]);
        this.setState({estimates: estimates}, this.saveState.bind(this));
    }


    resetEstimates() {
        window.bootbox.confirm("Are you sure you want to reset your estimates? You will lose everything.", (result) => {
            if (result) {
                this.setState(this.getDefaultState(), this.saveState.bind(this));
            }
        });
    }

    deleteEstimate(path) {
        this.setState(state => ({
            estimates: removeNodeAtPath({
                treeData: state.estimates,
                path: path,
                getNodeKey: ((data) => data.treeIndex)
            })
        }), this.saveState.bind(this));
    }

    estimateChanged(path, newEstimate) {
        this.setState(state => ({
            estimates: changeNodeAtPath({
                treeData: state.estimates,
                path: path,
                newNode: newEstimate,
                getNodeKey: ((data) => data.treeIndex)
            })
        }), this.saveState.bind(this));
    }

    createProjectSetupTasks() {
        const tasks = [];

        if (this.state.includeRepositorySetup || this.state.includeLearningExistingCode) {
            const projectSetup = {
                type: "task",
                title: "Project Setup",
                hours: null,
                children: []
            };


            tasks.push(projectSetup);

            if (this.state.includeRepositorySetup) {
                projectSetup.children.push({
                    type: "task",
                    title: "Create repository, project trackers and do initial project setup",
                    hours: 2,
                    children: []
                });
            }

            if (this.state.includeLearningExistingCode) {
                projectSetup.children.push({
                    type: "task",
                    title: "Spend time reviewing and studying the existing code-base",
                    hours: 16,
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

        this.state.estimates.forEach((data, index) => {
            const estimate = new Estimate(data, index);
            tasks = tasks.concat(estimate.createTasksAndExpenses([]).tasks);
        });

        tasks = tasks.map(clone);

        console.log(JSON.stringify(tasks, null, 1));

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
        const assignNumbers = (tasks, path) =>
        {
            tasks.forEach((task, index) =>
            {
                const fullPath = path.concat([index]);
                task.taskNumber = fullPath.map((index) => (index + 1).toString()).join(".");
                assignNumbers(task.children, fullPath);
            });
        };
        assignNumbers(tasks, []);

        // Now we flatten
        const allTasks = [];
        const flattenTask = (task) =>
        {
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
           if (task.image)
           {
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
                    // console.log(elem.getBoundingClientRect().height);
                    base += Math.min(200,  elem.naturalHeight);
                }
            });

            return base;
        }
        return 200;
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Electric Brain Product Estimator</h1>
                </header>
                <Grid fluid={true}>
                    <Row className="show-grid">
                        <Col xs={12}>
                            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                                <Tab eventKey={1} title="Estimate Configuration">
                                    <Row className="show-grid">
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.resetEstimates.bind(this)}>Reset Estimates</Button>
                                        </Col>
                                    </Row>
                                    <br/>
                                    <Row className="show-grid">
                                        <Col xs={12}>
                                            <FormGroup controlId="formHorizontalText">
                                                <Col componentClass={ControlLabel} sm={2}>
                                                    Project Configuration
                                                </Col>
                                                <Col sm={10}>
                                                    <Checkbox checked={this.state.includeRepositorySetup}
                                                              onChange={this.checkboxClicked.bind(this, 'includeRepositorySetup')}>Include
                                                        Repository Setup?</Checkbox>
                                                    <Checkbox checked={this.state.includeLearningExistingCode}
                                                              onChange={this.checkboxClicked.bind(this, 'includeLearningExistingCode')}>Include
                                                        learning existing codebase?</Checkbox>
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
                                            <Button onClick={this.addUserInterfaceEstimate.bind(this)}>Add User Interface</Button>
                                        </Col>
                                    </Row>
                                    <Row className="estimate-tree">
                                        <Col xs={12}>
                                            <div style={{"height": "1500px"}}>
                                                <SortableTree
                                                    treeData={this.state.estimates}
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
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.createTaskList().map((task, index) => <ProposalTask task={task}
                                                                                                         index={index}
                                                                                                         key={task.taskNumber}/>)
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
                                                this.createVisualList().map((task, index) => <VisualProposalTask task={task}
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
