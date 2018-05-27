import React, {Component} from 'react';
import {Form, FormControl, Col, Checkbox, FormGroup, ControlLabel} from 'react-bootstrap';
//import Estimate from './Estimate';

class EstimateGroupConfiguration extends Component {
    componentDidMount() {

    }

    changeName(event) {
        const estimate = this.props.estimate;
        estimate.title = event.target.value;
        this.props.onChange(this.props.estimate);
    }

    render() {
        return (
            <div>
                <Form horizontal>
                    <FormGroup controlId="formHorizontalText">
                        <Col componentClass={ControlLabel} sm={2}>
                            Name of group
                        </Col>
                        <Col sm={10}>
                            <FormControl value={this.props.estimate.title} type="text" placeholder="The name of this group" onChange={this.changeName.bind(this)}/>
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        );
    }
}

export default EstimateGroupConfiguration;

