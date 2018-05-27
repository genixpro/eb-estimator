import React, {Component} from 'react';
import {Col, Row, Button} from 'react-bootstrap';
import DeepLearningEstimateConfiguration from './DeepLearningEstimateConfiguration';
import Estimate from './Estimate';
import DataAnnotationEstimateConfiguration from "./DataAnnotationEstimateConfiguration";
import CustomEstimateConfiguration from "./CustomEstimateConfiguration";
import RPAEstimateConfiguration from "./RPAEstimateConfiguration";
import EstimateGroupConfiguration from "./EstimateGroupConfiguration";

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
                {/*<pre>{JSON.stringify(this.props.estimate, null, 2)}</pre>*/}
                <Col xs={12} md={10}>
                    {
                        this.props.estimate.type === 'group' ?
                            <EstimateGroupConfiguration estimate={this.props.estimate} index={this.props.index} onChange={this.props.onChange}>
                            </EstimateGroupConfiguration> : null
                    }
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
                    {
                        this.props.estimate.type === 'rpa' ?
                            <RPAEstimateConfiguration estimate={this.props.estimate} index={this.props.index} onChange={this.props.onChange}>
                            </RPAEstimateConfiguration> : null
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
