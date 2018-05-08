import React, {Component} from 'react';
import {Col, Row, Button} from 'react-bootstrap';
import DeepLearningEstimateConfiguration from './DeepLearningEstimateConfiguration';
import Estimate from './Estimate';
import DataAnnotationEstimateConfiguration from "./DataAnnotationEstimateConfiguration";
import CustomEstimateConfiguration from "./CustomEstimateConfiguration";

class EstimateConfiguration extends Component {

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

    render() {
        return (
            <Row className="show-grid">
                <Col xs={12} md={10}>
                    {
                        this.props.estimate.type === 'deep_learning' ?
                            <DeepLearningEstimateConfiguration estimate={this.props.estimate} index={this.props.index} onChange={this.props.onChange}>
                            </DeepLearningEstimateConfiguration> : null
                    }
                    {
                        this.props.estimate.type === 'data_annotation' ?
                            <DataAnnotationEstimateConfiguration estimate={this.props.estimate} index={this.props.index} onChange={this.props.onChange}>
                            </DataAnnotationEstimateConfiguration> : null
                    }
                    {
                        this.props.estimate.type === 'custom' ?
                            <CustomEstimateConfiguration estimate={this.props.estimate} index={this.props.index} onChange={this.props.onChange}>
                            </CustomEstimateConfiguration> : null
                    }
                </Col>
                <Col xs={4} md={2}>
                    <h4 style={{'textAlign': 'right'}}>{this.calculateHours().toFixed(2)} hours</h4>
                    <h4 style={{'textAlign': 'right'}}>${this.calculateExpenses().toFixed(2)} expenses</h4>
                    <Button bsStyle="primary" onClick={this.moveUpClicked.bind(this)}>Up</Button>
                    <Button bsStyle="primary" onClick={this.moveDownClicked.bind(this)}>Down</Button>
                    <Button bsStyle="danger" onClick={this.deleteClicked.bind(this)}>Delete</Button>
                </Col>
            </Row>
        );
    }
}

export default EstimateConfiguration;
