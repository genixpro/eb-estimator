import React, {Component} from 'react';
import {Form, FormControl, Col, Checkbox, FormGroup, ControlLabel} from 'react-bootstrap';
//import Estimate from './Estimate';
import ReactTable from "react-table";
import "react-table/react-table.css";

class RPAEstimateConfiguration extends Component {
    componentDidMount() {

    }

    checkboxClicked(optionKey, event) {
        const estimate = this.props.estimate;
        const value = estimate[optionKey];
        estimate[optionKey] = !value;
        this.props.onChange(estimate);
    }

    optionChanged(optionKey, event) {
        const estimate = this.props.estimate;
        estimate[optionKey] = event.target.value;
        this.props.onChange(estimate);
    }

    researchCycleChanged(event) {
        const estimate = this.props.estimate;
        estimate['research_cycle'] = event.target.value;
        this.props.onChange(estimate);
    }

    changeName(event) {
        const estimate = this.props.estimate;
        estimate.name = event.target.value;
        this.props.onChange(this.props.estimate);
    }


    ensureEmptyProcess(estimate) {
        let isEmptyProcess = false;
        for (let process of estimate.processes) {
            if (!(process.name.trim())) {
                isEmptyProcess = true;
            }
        }
        if (!isEmptyProcess) {
            estimate.processes.push({
                name: " ",
                steps: 0,
            })
        }
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
                    if (cellInfo.column.id === 'steps') {
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

                    estimate.processes[cellInfo.index][cellInfo.column.id] = content;
                    this.ensureEmptyProcess(estimate);
                    this.props.onChange(estimate);
                }}
                dangerouslySetInnerHTML={{
                    __html: this.props.estimate.processes[cellInfo.index][cellInfo.column.id].toString().replace(/\s/g, "&nbsp;")
                }}
            />
        );
    }


    render() {
        return (
            <div>
                <h3>Robotic Process Automation Estimate</h3>

                <Form horizontal>
                    <FormGroup controlId="formHorizontalText">
                        <Col componentClass={ControlLabel} sm={2}>
                            Name of group
                        </Col>
                        <Col sm={10}>
                            <FormControl value={this.props.estimate.name} type="text" placeholder="The name of this group" onChange={this.changeName.bind(this)}/>
                        </Col>
                    </FormGroup>
                   <FormGroup>
                      <Col componentClass={ControlLabel} sm={2}>
                          General Project
                      </Col>
                      <Col sm={10}>
                          <Checkbox value={this.props.estimate['vendor_selection']} onChange={this.checkboxClicked.bind(this, 'vendor_selection')}>Include RPA Vendor selection process?</Checkbox>
                          <Checkbox value={this.props.estimate['deployment_configuration']} onChange={this.checkboxClicked.bind(this, 'deployment_configuration')}>Include configuring a fresh RPA Deployment?</Checkbox>
  
                      </Col>
                  </FormGroup>
                </Form>

                <ReactTable
                    data={this.props.estimate.processes}
                    columns={[
                        {
                            Header: "Name",
                            accessor: "name",
                            Cell: this.renderEditable.bind(this)
                        },
                        {
                            Header: "Steps",
                            accessor: "steps",
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

export default RPAEstimateConfiguration;

