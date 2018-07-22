import React, { Component } from 'react';
import Estimate from './Estimate.js';

class VisualProposalTask extends Component
{
    componentDidMount() {
        const valid = Estimate.validateTaskData(this.props.task);
        if (!valid)
        {
            const message = JSON.stringify(Estimate.validateTaskData.errors, null, 4);
            throw new Error(message);
        }
    }

    render() {
        return (
            <tr>
                <td>{this.props.task.taskNumber}</td>
                <td>{this.props.task.title}</td>
                <td style={ {'textAlign':'right'} }>{this.props.task.hours !== null ? this.props.task.hours.toFixed(1) : ""}</td>
                <td>{this.props.task.image ? <img alt={"Image for " + this.props.task.title} src={this.props.task.image} style={{"maxWidth": "100%", "maxHeight": "300px"}}/> : null}</td>
            </tr>
        );
    }
}


export default VisualProposalTask;
