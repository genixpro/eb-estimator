import React, {Component} from 'react';
import {Form, FormControl, Col, Row, Button, Checkbox, FormGroup, ControlLabel} from 'react-bootstrap';
import Estimate from './Estimate';
import EstimateGroupConfiguration from "./EstimateGroupConfiguration";
import UserInterfaceEstimateConfiguration from "./UserInterfaceEstimateConfiguration";
import yaml from 'js-yaml';
import axios from 'axios';
import _ from 'underscore';
import ReactTable from "react-table";
import "react-table/react-table.css";

class EstimateConfiguration extends Component {
    constructor()
    {
        super();

        this.state = {};
    }

    componentDidMount()
    {
        axios.get('estimates/deep_learning.yaml').then((response) =>
        {
            this.setState({deepLearningForm: yaml.safeLoad(response.data)})
        });
        axios.get('estimates/data_annotation.yaml').then((response) =>
        {
            this.setState({dataAnnotationForm: yaml.safeLoad(response.data)})
        });
        axios.get('estimates/rpa.yaml').then((response) =>
        {
            this.setState({rpaForm: yaml.safeLoad(response.data)})
        });
        axios.get('estimates/custom_estimate.yaml').then((response) =>
        {
            this.setState({customEstimateForm: yaml.safeLoad(response.data)})
        });
    }


    deleteClicked() {
        window.bootbox.confirm("Are you sure you want to delete this estimate? You'll lose all the configuration attached to it.", (result) => {
            if (result) {
                this.props.deleteEstimate();
            }
        });
    }

    moveUpClicked() {
        this.props.moveEstimateUp();
    }

    moveDownClicked() {
        this.props.moveEstimateDown();
    }

    calculateHours() {
        const estimate = new Estimate(this.props.estimate, this.props.index);
        return estimate.calculateHours()
    }

    calculateExpenses() {
        const estimate = new Estimate(this.props.estimate, this.props.index);
        return estimate.calculateExpenses()
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

    ensureEmptyTableItem(formOptions)
    {
        let isEmptyTableItem = false;
        for (let item of this.props.estimate[formOptions.field]) {
            if (!(item[formOptions.emptyField].trim())) {
                isEmptyTableItem = true;
            }
        }
        if (!isEmptyTableItem) {
            this.props.estimate[formOptions.field].push(_.clone(formOptions.emptyData))
        }
    }


    changeTableValue(taskInfo, field, event) {
        taskInfo[field] = event.target.value;
        this.props.onChange(this.props.estimate);
    }

    renderTableEditable(formOptions, columnOption, cellInfo) {
        if (columnOption.type === 'text' || columnOption.type === 'number') {
            return (
                <div
                    style={{backgroundColor: "#fafafa"}}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                        const estimate = this.props.estimate;
                        let content = e.target.textContent.replace(/<br\s+\/?>/g, "");
                        if (columnOption.type === 'number') {
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

                        estimate[formOptions.field][cellInfo.index][cellInfo.column.id] = content;
                        if (formOptions.ensureEmpty) {
                            this.ensureEmptyTableItem(formOptions);
                        }
                        this.props.onChange(estimate);
                    }}
                    dangerouslySetInnerHTML={{
                        __html: this.props.estimate[formOptions.field][cellInfo.index][cellInfo.column.id].toString().replace(/\s/g, "&nbsp;")
                    }}
                />
            );
        }
        else if (columnOption.type === 'select')
        {
            const taskInfo = cellInfo.original;
            return <div>
                <select value={taskInfo.type} defaultValue='component' onChange={this.changeTableValue.bind(this, taskInfo, columnOption.field)}>
                    {
                        columnOption.options.map((option) =>
                        {
                            return <option value={option.value}>{option.title}</option>;
                        })
                    }
                </select>
            </div>;
        }
    }


    renderForm(formConfig)
    {
        if (!formConfig)
        {
            return <div></div>;
        }

        // This function is used to filter out any form elements which are conditional on other yes/no values
        const filterConditions = (list) =>
        {
            const newList = [];
            list.forEach((item) =>
            {
                if (_.isUndefined(item.if) || this.props.estimate[item.if])
                {
                    newList.push(item);
                }
            });
            return newList;
        };

        return (
            <div>
                <h3>{formConfig.title}</h3>

                {
                    filterConditions(formConfig.form).map((formOption) =>
                        <div>
                            <br/>
                            <FormGroup controlId="formHorizontalText">
                                <Col componentClass={ControlLabel} sm={2}>
                                    {formOption.title}
                                </Col>
                                <Col sm={10}>
                                    {
                                        formOption.type === 'options' ?
                                            <div>
                                                {
                                                    filterConditions(formOption.fields).map( (fieldOption) =>
                                                        <Checkbox inline={formOption.inline} checked={this.props.estimate[fieldOption.field]} onChange={this.checkboxClicked.bind(this, fieldOption.field)}>{fieldOption.title}</Checkbox>
                                                    )
                                                }
                                            </div> : null
                                    }
                                    {
                                        formOption.type === 'select' ?
                                            <select value={this.props.estimate[formOption.field]} onChange={this.optionChanged.bind(this, formOption.field)}>
                                                {
                                                    filterConditions(formOption.options).map( (fieldOption) => (<option value={fieldOption.value}>{fieldOption.title}</option>))
                                                }
                                            </select> : null
                                    }
                                    {
                                        formOption.type === 'number' ?
                                            <div>
                                                <FormControl type="number" placeholder={formOption.placeholder} min={formOption.min} value={this.props.estimate[formOption.field]} onChange={this.optionChanged.bind(this, formOption.field)}/>
                                            </div> : null
                                    }
                                    {
                                        formOption.type === 'table' ?
                                            <div>
                                                <ReactTable
                                                    data={this.props.estimate[formOption.field]}
                                                    columns={
                                                        formOption.columns.map((columnOption) =>
                                                            ({
                                                                Header: columnOption.title,
                                                                accessor: columnOption.field,
                                                                Cell: this.renderTableEditable.bind(this, formOption, columnOption),
                                                                maxWidth: columnOption.maxWidth
                                                            }))
                                                    }
                                                    defaultPageSize={10}
                                                    className="-striped -highlight"
                                                />
                                            </div> : null
                                    }
                                </Col>
                            </FormGroup>
                            <br/>
                        </div>
                    )
                }
            </div>
        )
    }

    render() {
        return (
            <Row className="show-grid">
                {/*<pre>{JSON.stringify(this.props.estimate, null, 2)}</pre>*/}
                <Col xs={12} md={10}>
                    {
                        this.props.estimate.type === 'group' ?
                            <EstimateGroupConfiguration estimate={this.props.estimate} index={this.props.index} onChange={this.props.onChange}>
                            </EstimateGroupConfiguration> : null
                    }
                    {
                        this.props.estimate.type === 'deep_learning' ? this.renderForm(this.state.deepLearningForm) : null
                    }
                    {
                        this.props.estimate.type === 'data_annotation' ? this.renderForm(this.state.dataAnnotationForm) : null
                    }
                    {
                        this.props.estimate.type === 'custom' ? this.renderForm(this.state.customEstimateForm) : null
                    }
                    {
                        this.props.estimate.type === 'rpa' ? this.renderForm(this.state.rpaForm) : null
                    }
                    {
                        this.props.estimate.type === 'user_interface' ?
                            <UserInterfaceEstimateConfiguration estimate={this.props.estimate} index={this.props.index} onChange={this.props.onChange}>
                            </UserInterfaceEstimateConfiguration> : null
                    }
                </Col>
                <Col xs={4} md={2}>
                    {
                        this.props.estimate.type !== 'group' ?
                            <div>
                                <h4 style={{'textAlign': 'right'}}>{this.calculateHours().toFixed(2)} hours</h4>
                                <h4 style={{'textAlign': 'right'}}>${this.calculateExpenses().toFixed(2)} expenses</h4>
                            </div> : null
                    }
                    <Button bsStyle="danger" onClick={this.deleteClicked.bind(this)}>Delete</Button>
                </Col>
            </Row>
        );
    }
}

export default EstimateConfiguration;
