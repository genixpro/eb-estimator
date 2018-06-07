import React, {Component} from 'react';
import {Form, FormControl, Col, Checkbox, FormGroup, ControlLabel} from 'react-bootstrap';
//import Estimate from './Estimate';

class DeepLearningEstimateConfiguration extends Component {
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
                <h3>Deep Learning Estimate</h3>

                <FormGroup controlId="formHorizontalText">
                    <Col componentClass={ControlLabel} sm={2}>
                        Data Types
                    </Col>
                    <Col sm={10}>
                        <Checkbox inline checked={this.props.estimate['structured']} onChange={this.checkboxClicked.bind(this, 'structured')}>Structured Data</Checkbox>
                        <Checkbox inline checked={this.props.estimate['text']} onChange={this.checkboxClicked.bind(this, 'text')}>Text</Checkbox>
                        <Checkbox inline checked={this.props.estimate['image']} onChange={this.checkboxClicked.bind(this, 'image')}>Images</Checkbox>
                        <Checkbox inline checked={this.props.estimate['audio']} onChange={this.checkboxClicked.bind(this, 'audio')}>Audio</Checkbox>
                        <Checkbox inline checked={this.props.estimate['video']} onChange={this.checkboxClicked.bind(this, 'video')}>Video</Checkbox>
                        <Checkbox inline checked={this.props.estimate['other']} onChange={this.checkboxClicked.bind(this, 'other')}>Other</Checkbox>
                    </Col>
                </FormGroup>
                <br/>
                <br/>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        Features
                    </Col>
                    <Col sm={10}>
                        <Checkbox checked={this.props.estimate['api_server']} onChange={this.checkboxClicked.bind(this, 'api_server')}>API Server?
                            format?</Checkbox>
                    </Col>
                </FormGroup>
                <br/>
                <br/>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        Data Preparation
                    </Col>
                    <Col sm={10}>
                        <Checkbox checked={this.props.estimate['convert_existing_data']} onChange={this.checkboxClicked.bind(this, 'convert_existing_data')}>Do we need a script to convert existing training data into a usable
                            format?</Checkbox>

                        {
                            this.props.estimate['text'] ?
                                <Checkbox checked={this.props.estimate['custom_word_embeddings']} onChange={this.checkboxClicked.bind(this, 'custom_word_embeddings')}>Custom word embeddings?</Checkbox>
                                : null
                        }
                        {
                            this.props.estimate['text'] ?
                                <Checkbox checked={this.props.estimate['word_positioning']} onChange={this.checkboxClicked.bind(this, 'word_positioning')}>Word positioning (height, width)?</Checkbox>
                                : null
                        }
                        {
                            this.props.estimate['text'] ?
                                <Checkbox checked={this.props.estimate['part_of_speech']} onChange={this.checkboxClicked.bind(this, 'part_of_speech')}>Part-of-speech (e.g. verb/noun/adjective/preposition)?</Checkbox>
                                : null
                        }
                        {
                            this.props.estimate['text'] ?
                                <Checkbox checked={this.props.estimate['word_dependencies']} onChange={this.checkboxClicked.bind(this, 'word_dependencies')}>Word-dependencies (e.g. this verb applies to this noun)?</Checkbox>
                                : null
                        }
                    </Col>
                </FormGroup>
                <br/>
                <br/>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        Research Cycle
                    </Col>
                    <Col sm={10}>
                        <select value={this.props.estimate.research_cycle} defaultValue='medium' onChange={this.researchCycleChanged.bind(this)}>
                            <option value="minimum">Minimum / Quick & Dirty</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium / Normal</option>
                            <option value="large">Large</option>
                        </select>
                    </Col>
                </FormGroup>
                <br/>
                <br/>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        Measurement & Metrics
                    </Col>
                    <Col sm={10}>
                        <Checkbox value={this.props.estimate['confusion_matrix']} onChange={this.checkboxClicked.bind(this, 'confusion_matrix')}>Compute Confusion Matrix?</Checkbox>
                        <Checkbox value={this.props.estimate['roc_curve']} onChange={this.checkboxClicked.bind(this, 'roc_curve')}>Compute ROC Curve?</Checkbox>
                        <Checkbox value={this.props.estimate['worst_samples']} onChange={this.checkboxClicked.bind(this, 'worst_samples')}>Show 50 Worst Samples?</Checkbox>
                    </Col>
                </FormGroup>
            </div>
        );
    }
}

export default DeepLearningEstimateConfiguration;

