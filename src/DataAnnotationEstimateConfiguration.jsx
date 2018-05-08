import React, {Component} from 'react';
import {Col, FormGroup, FormControl, Form, ControlLabel} from 'react-bootstrap';

class DataAnnotationEstimateConfiguration extends Component {
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

    render() {
        return (
            <div>
                <h3>Data Annotation Estimate</h3>
                <Form horizontal>
                    <FormGroup controlId="formHorizontalText">
                        <Col componentClass={ControlLabel} sm={2}>
                            Estimated time
                        </Col>
                        <Col sm={10}>
                            <FormControl type="number" placeholder="Estimated time per unit of data (minutes, no breaks/contingency)" />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalText">
                        <Col componentClass={ControlLabel} sm={2}>
                            Number of data points
                        </Col>
                        <Col sm={10}>
                            <FormControl type="number" placeholder="Estimated total data points to be annotated" />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalText">
                        <Col componentClass={ControlLabel} sm={2}>
                            Locality
                        </Col>
                        <Col sm={10}>
                            <select value={this.props.estimate.locality} onChange={this.researchCycleChanged.bind(this)}>
                                <option value="foreign">Foreign</option>
                                <option value="local">Local</option>
                            </select>
                        </Col>
                    </FormGroup>

                </Form>
            </div>
        );
    }
}

export default DataAnnotationEstimateConfiguration;

