import React, { Component } from 'react';
import Estimate from './Estimate.js';
import NumberFormat from 'react-number-format';

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

    computeGroupTotals() {
        let totalHours = 0;
        let totalCost = 0;

        const recurse = (task) =>
        {
            if(task.hours)
            {
                totalHours += task.hours;
                totalCost += task.hours * this.props.skillRates[task.skill];
            }
            task.children.forEach((task) => recurse(task));
        };
        recurse(this.props.task);

        return {hours: totalHours, cost: totalCost}
    }

    render() {
        return (
            <tr>
                <td>{this.props.task.taskNumber}</td>
                <td>{this.props.task.type}</td>
                <td>{this.props.task.title}</td>
                <td style={ {'textAlign':'right', 'fontFamily': 'monospace'} }>{this.props.task.hours !== null ? this.props.task.hours.toFixed(1) : ""}</td>


                <td>
                    {
                        this.props.task.hours ?
                            <div>
                                {
                                    this.props.task.skill === 'aiEngineer' ? <p>AI Engineer</p> : null
                                }
                                {
                                    this.props.task.skill === 'rpaConsultant' ? <p>RPA Consultant</p> : null
                                }
                                {
                                    this.props.task.skill === 'fullStackDeveloper' ? <p>Full Stack Developer</p> : null
                                }
                            </div> : ""
                    }
                </td>

                <td>
                    {
                        this.props.task.hours ?
                            <p style={ {'textAlign':'right', 'fontFamily': 'monospace'} }>
                                <NumberFormat value={this.props.skillRates[this.props.task.skill] * this.props.task.hours} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />
                            </p> : ""
                    }
                </td>

                <td>
                    {
                        (this.computeGroupTotals().hours && this.computeGroupTotals().hours > this.props.task.hours) ?
                            <p style={ {'textAlign':'right', 'fontFamily': 'monospace'} }>
                                {this.computeGroupTotals().hours.toFixed(1)}
                            </p> : ""
                    }
                </td>

                <td>
                    {
                        (this.computeGroupTotals().hours && this.computeGroupTotals().hours > this.props.task.hours) ?
                            <p style={ {'textAlign':'right', 'fontFamily': 'monospace'} }>
                                <NumberFormat value={this.computeGroupTotals().cost} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />
                            </p> : ""
                    }
                </td>
            </tr>
        );
    }
}


export default ProposalTask;
