import React, { Component } from 'react';
import Estimate from './Estimate.js';

class ProposalTask extends Component
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
                <td>{this.props.task.type}</td>
                <td>{this.props.task.name}</td>
                <td style={ {'textAlign':'right'} }>{this.props.task.hours !== null ? this.props.task.hours.toFixed(1) : ""}</td>
            </tr>
        );
    }
}


export default ProposalTask;
