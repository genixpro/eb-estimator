import React, {Component} from 'react';
import {Col, FormGroup, FormControl, Form, ControlLabel} from 'react-bootstrap';

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";


class CustomEstimateConfiguration extends Component {
    changeTaskType(taskInfo, event) {
        taskInfo.type = event.target.value;
        this.props.onChange(this.props.estimate);
    }

    changeName(event) {
        const estimate = this.props.estimate;
        estimate.name = event.target.value;
        this.props.onChange(this.props.estimate);
    }

    // This function always makes sure there is an empty task at the end of the list.
    ensureEmptyTask(estimate) {
        let isEmptyTask = false;
        for (let task of estimate.tasks) {
            if (!(task.name.trim())) {
                isEmptyTask = true;
            }
        }
        if (!isEmptyTask) {
            estimate.tasks.push({
                type: 'feature',
                name: " ",
                hours: 0,
                groups: []
            })
        }
    }

    renderTaskType(cellInfo) {
        const taskInfo = cellInfo.original;
        return (
            <div>
                <select value={taskInfo.type} defaultValue='component' onChange={this.changeTaskType.bind(this, taskInfo)}>
                    <option value="component">Component</option>
                    <option value="script">Script</option>
                    <option value="feature">Feature</option>
                    <option value="function">Function</option>
                    <option value="task">Task</option>
                    <option value="document">Document</option>
                </select>
            </div>
        );
    }

    renderEditable(cellInfo) {
        return (
            <div
                style={{backgroundColor: "#fafafa"}}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const estimate = this.props.estimate;
                    let content = e.target.textContent.replace(/<br\s+\/?>/g, "");
                    if (cellInfo.column.id === 'hours') {
                        if (!content) {
                            content = 0;
                        }
                        else {
                            content = Number(content);
                        }
                    }
                    else {
                        if (!content) {
                            content = ' ';
                        }
                    }

                    estimate.tasks[cellInfo.index][cellInfo.column.id] = content;
                    this.ensureEmptyTask(estimate);
                    this.props.onChange(estimate);
                }}
                dangerouslySetInnerHTML={{
                    __html: this.props.estimate.tasks[cellInfo.index][cellInfo.column.id].toString().replace(/\s/g, "&nbsp;")
                }}
            />
        );
    }

    render() {
        return (
            <div>
                <h3>Custom Estimate</h3>

                <Form horizontal>
                    <FormGroup controlId="formHorizontalText">
                        <Col componentClass={ControlLabel} sm={2}>
                            Name of group
                        </Col>
                        <Col sm={10}>
                            <FormControl value={this.props.estimate.name} type="text" placeholder="The name of this group of tasks, as shown on the proposal" onChange={this.changeName.bind(this)}/>
                        </Col>
                    </FormGroup>
                </Form>

                <ReactTable
                    data={this.props.estimate.tasks}
                    columns={[
                        {
                            Header: "Type",
                            accessor: "type",
                            Cell: this.renderTaskType.bind(this)
                        },
                        {
                            Header: "Name",
                            accessor: "name",
                            Cell: this.renderEditable.bind(this)
                        },
                        {
                            Header: "Hours",
                            accessor: "hours",
                            Cell: this.renderEditable.bind(this)
                        }
                    ]}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            </div>
        );
    }
}

export default CustomEstimateConfiguration;

