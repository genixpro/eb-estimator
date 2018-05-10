import React, {Component} from 'react';
import {Grid, Row, Col, Tabs, Tab, Button, ListGroup, ListGroupItem, Table, ControlLabel, FormGroup, Checkbox} from 'react-bootstrap';
import EstimateConfiguration from './EstimateConfiguration.jsx';
import ProposalTask from './ProposalTask.jsx';
import Estimate from './Estimate';
import clone from 'clone';

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

    componentDidMount() {

    }

    checkboxClicked(optionKey, event) {
        const value = this.state[optionKey];
        this.setState({[optionKey]: !value});
        this.saveState();
    }

    nextEstimateKey() {
        const key = this.state.currentEstimateKey;
        this.setState({currentEstimateKey: key + 1});
        return "estimate-" + key.toString();
    }

    addDeepLearningEstimate() {
        const estimates = this.state.estimates;
        estimates.push({
            name: "New Deep Learning Algorithm.",
            key: this.nextEstimateKey(),
            type: "deep_learning"
        });
        this.setState({estimates: estimates});
        this.saveState();
    }

    addDataAnnotation() {
        const estimates = this.state.estimates;
        estimates.push({
            key: this.nextEstimateKey(),
            type: "data_annotation"
        });
        this.setState({estimates: estimates});
        this.saveState();
    }

    addCustom() {
        const estimates = this.state.estimates;
        estimates.push({
            key: this.nextEstimateKey(),
            type: "custom",
            name: "",
            tasks: [{
                type: "component",
                name: "New Task",
                hours: 0,
                groups: []
            }]
        });
        this.setState({estimates: estimates});
        this.saveState();
    }

    addRPAEstimate() {
        const estimates = this.state.estimates;
        estimates.push({
            name: "New RPA Estimate",
            key: this.nextEstimateKey(),
            type: "rpa",
	    processes: [{
	        name: "New Process",
		steps: 5
	    }]
        });
        this.setState({estimates: estimates});
        this.saveState();
    }
    resetEstimates() {
        window.bootbox.confirm("Are you sure you want to reset your estimates? You will lose everything.", (result) => {
            if (result) {
                this.setState(this.getDefaultState());
                this.saveState();
            }
        });
    }

    moveEstimateUp(index) {
        let estimates = this.state.estimates;
        const estimate = estimates.splice(index, 1)[0];
        estimates.splice(Math.max(0, index - 1), 0, estimate);
        this.setState({estimates: estimates});
    }

    moveEstimateDown(index) {
        let estimates = this.state.estimates;
        const estimate = estimates.splice(index, 1)[0];
        this.state.estimates.splice(Math.min(estimates.length, index + 1), 0, estimate);
        this.setState({estimates: estimates});
    }

    deleteEstimate(index) {
        let estimates = this.state.estimates;
        estimates.splice(index, 1);
        this.setState({estimates: estimates});
    }

    estimateChanged(index, newEstimate) {
        const estimates = this.state.estimates;
        estimates[index] = newEstimate;
        this.setState({estimates: estimates});
        this.saveState();
    }

    createProjectSetupTasks() {
        const tasks = [];

        if (this.state.includeRepositorySetup || this.state.includeLearningExistingCode) {
            tasks.push({
                type: "task",
                name: "Project Setup",
                hours: null,
                groups: ['project_setup']
            });

            if (this.state.includeRepositorySetup) {
                tasks.push({
                    type: "task",
                    name: "Create repository, project trackers and do initial project setup",
                    hours: 2,
                    groups: ['project_setup']
                });
            }

            if (this.state.includeLearningExistingCode) {
                tasks.push({
                    type: "task",
                    name: "Spend time reviewing and studying the existing code-base",
                    hours: 16,
                    groups: ['project_setup']
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
            tasks = tasks.concat(estimate.createTasksAndExpenses().tasks);
        });

        tasks = tasks.map(clone);

        // Validate all of the tasks being output
        tasks.forEach((task) => {
            const valid = Estimate.validateTaskData(task);
            if (!valid) {
                let message = JSON.stringify(Estimate.validateTaskData.errors, null, 4);
                message += "\n\nOn this object:\n" + JSON.stringify(task, null, 4);
                throw new Error(message);
            }
        });

        function getTaskKeys(task) {
            let key = "";
            let keys = [];
            let groups = task.groups;
            if (task.hours !== null) {
                groups.push('final');
            }
            task.groups.forEach((group) => {
                if (key) {
                    key += '.';
                }
                key += group;
                keys.push(key);
            });
            return keys;
        }

        // Now collect all the groupings at each level
        const groupIds = {};
        const counts = {};
        tasks.forEach((task, index) => {
            let taskNumber = "";
            const keys = getTaskKeys(task);

            keys.forEach((key, keyIndex) => {
                if (taskNumber) {
                    taskNumber += '.';
                }

                if (groupIds[key]) {
                    taskNumber += groupIds[key];
                }
                else if (keyIndex === 0) {
                    if (!counts[""])
                        counts[""] = 0;
                    counts[""] += 1;
                    groupIds[key] = counts[""].toString();
                    taskNumber += counts[""].toString();
                }
                else {
                    if (!counts[keys[keyIndex - 1]])
                        counts[keys[keyIndex - 1]] = 0;
                    counts[keys[keyIndex - 1]] += 1;

                    if (task.hours === null) {
                        groupIds[key] = counts[keys[keyIndex - 1]].toString();
                    }

                    taskNumber += counts[keys[keyIndex - 1]].toString();
                }
            });

            task.taskNumber = taskNumber;
        });

        return tasks;
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Electric Brain Product Estimator</h1>
                </header>
                <Grid>
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
                                                    <Checkbox checked={this.state.includeRepositorySetup} onChange={this.checkboxClicked.bind(this, 'includeRepositorySetup')}>Include Repository Setup?</Checkbox>
                                                    <Checkbox checked={this.state.includeLearningExistingCode} onChange={this.checkboxClicked.bind(this, 'includeLearningExistingCode')}>Include learning existing codebase?</Checkbox>
                                                </Col>
                                            </FormGroup>
                                            <br/>
                                            <br/>
                                        </Col>
                                    </Row>
                                    <Row className="show-grid">
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addDeepLearningEstimate.bind(this)}>Add Deep Learning Algorithm</Button>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addDataAnnotation.bind(this)}>Add Data Annotation</Button>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addRPAEstimate.bind(this)}>Add RPA</Button>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <Button onClick={this.addCustom.bind(this)}>Add Custom</Button>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12}>
                                            <ListGroup>
                                                {this.state.estimates && this.state.estimates.map((estimate, index) =>
                                                    <ListGroupItem key={estimate.key}>
                                                        <EstimateConfiguration
                                                            estimate={estimate}
                                                            index={index}
                                                            onChange={this.estimateChanged.bind(this, index)}
                                                            moveEstimateUp={this.moveEstimateUp.bind(this, index)}
                                                            moveEstimateDown={this.moveEstimateDown.bind(this, index)}
                                                            deleteEstimate={this.deleteEstimate.bind(this, index)}
                                                        />
                                                    </ListGroupItem>
                                                )
                                                }
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                </Tab>
                                <Tab eventKey={2} title="Proposal">
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
                                                this.createTaskList().map((task, index) => <ProposalTask task={task} index={index} key={task.taskNumber}/>)
                                            }
                                            </tbody>
                                        </Table>
                                    </Grid>
                                </Tab>
                                <Tab eventKey={3} title="RFP">
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
