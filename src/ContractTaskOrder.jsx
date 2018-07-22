import React, {Component} from 'react';
import {Task} from './Estimate.js';
import NumberFormat from 'react-number-format';
import './ContractPageCSS.css';
import {
    Row,
    Col,
    ControlLabel,
    FormGroup,
    FormControl
} from 'react-bootstrap';


class ContractTaskOrder extends Component {
    constructor() {
        super();
        this.state = {
            "clientName": "",
            "clientJurisdiction": "",
            "masterServicesAgreementSignDate": "",
            "taskOrderEffectiveDate": "",

        };
    }

    componentDidMount() {

    }

    updateValue(field, event)
    {
        this.setState({[field]: event.target.value});
    }

    getPhases()
    {
        const phases = {};
        this.props.taskList.forEach((task) =>
        {
            if(task.phase)
            {
                if (!phases[task.phase])
                {
                    phases[task.phase] = {
                        tasks: [],
                        total: 0
                    }
                }
                if (task.hours)
                {
                    phases[task.phase].total += task.hours;
                }
            }
        });

        const taskObjects = this.props.taskList.map((task) => new Task(task));
        taskObjects.forEach((task) =>
        {
            Object.keys(phases).forEach((phase) => {
                if (task.hasChildrenInPhase(phase))
                {
                    phases[phase].tasks.push(task);
                }
            });
        });

        return Object.values(phases);
    }

    render() {
        return (
            <div>
                <Row className="show-grid">
                    <Col xs={12}>
                        <FormGroup controlId="formHorizontalText">
                            <Col componentClass={ControlLabel} sm={2}>
                                Client Name
                            </Col>
                            <Col sm={10}>
                                <FormControl value={this.state.clientName} type="text"
                                             placeholder="Client Name"
                                             onChange={this.updateValue.bind(this, "clientName")}/>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="formHorizontalText">
                            <Col componentClass={ControlLabel} sm={2}>
                                Client Jurisdiction
                            </Col>
                            <Col sm={10}>
                                <FormControl value={this.state.clientJurisdiction} type="text"
                                             placeholder="Client Jurisdiction"
                                             onChange={this.updateValue.bind(this, "clientJurisdiction")}/>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="formHorizontalText">
                            <Col componentClass={ControlLabel} sm={2}>
                                Master Services Agreement Sign Date
                            </Col>
                            <Col sm={10}>
                                <FormControl value={this.state.masterServicesAgreementSignDate} type="text"
                                             placeholder="Master Services Agreement Sign Date"
                                             onChange={this.updateValue.bind(this, "masterServicesAgreementSignDate")}/>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="formHorizontalText">
                            <Col componentClass={ControlLabel} sm={2}>
                                Task Order Effective Date
                            </Col>
                            <Col sm={10}>
                                <FormControl value={this.state.taskOrderEffectiveDate} type="text"
                                             placeholder="Task Order Effective Date"
                                             onChange={this.updateValue.bind(this, "taskOrderEffectiveDate")}/>
                            </Col>
                        </FormGroup>
                    </Col>
                </Row>





                <div className="c42 contract-page">

                    <div><p className="c18 c41"><span className="c43"></span></p></div>
                    <p className="c30"><span className="c5">EXHIBIT A</span></p>
                    <p className="c30"><span className="c5">INITIAL TASK ORDER</span></p>
                    <p className="c3 c34"><span className="c2">This Task Order (&quot;</span><span
                        className="c5">Task Order</span><span className="c2">&quot;) adopts and incorporates by reference the terms and conditions of the service agreement (the &quot;</span><span
                        className="c5">Service Agreement</span><span className="c2">&quot;), dated as of {this.state.masterServicesAgreementSignDate}, between Electric Brain Software Corporation, a company incorporated under the laws of the Province of Ontario (&quot;</span><span
                        className="c5">Service Provider</span><span className="c2">&quot;) and {this.state.clientName}</span><span className="c2">, a {this.state.clientJurisdiction}</span><span
                        className="c2">&nbsp;corporation (&quot;</span><span className="c5">Customer</span><span
                        className="c2">&quot;, and together with Service Provider, the &quot;</span><span
                        className="c5">Parties</span><span className="c2">&quot;, and each, a &quot;</span><span
                        className="c5">Party</span><span
                        className="c2">&quot;), as it may be amended from time to time. This Task Order is effective beginning on {this.state.taskOrderEffectiveDate} and will remain in effect until the expiration of the Term (as such term is defined in the Service Agreement), unless earlier terminated in accordance with the Service Agreement. Transactions performed under this Task Order will be conducted in accordance with and be subject to the terms and conditions of this Task Order and the Service Agreement. Capitalized terms used but not defined in this Task Order shall have the meanings set out in the Service Agreement.</span>
                    </p>
                    <ol className="c4 lst-kix_list_16-0 start" start="1">
                        <li className="c3 c22"><span className="c13">Scope of Work</span><span className="c33">.</span><span
                            className="c2">&nbsp;Under this Task Order, Service Provider will perform the following Services and provide the following Deliverables:</span>
                        </li>
                    </ol>
                    {/*<ol className="c4 lst-kix_list_16-1 start" start="1">*/}
                        {/*<li className="c3 c29"><span className="c8">Information Gathering.</span><span*/}
                            {/*className="c2">&nbsp;Customer shall, within [</span><span className="c2 c10">NUMBER</span><span*/}
                            {/*className="c2">] days of the effective date of this Task Order, provide to Service Provider the following (the &quot;</span><span*/}
                            {/*className="c5">Customer Information</span><span className="c2">&quot;):</span></li>*/}
                    {/*</ol>*/}
                    {/*<ol className="c4 lst-kix_list_16-2 start" start="1">*/}
                        {/*<li className="c1"><span className="c2">All acts, regulations, rules and policies in effect and relating to the regulation of the [</span><span*/}
                            {/*className="c2 c10">TYPE</span><span className="c2">] in [</span><span*/}
                            {/*className="c2 c10">JURISDICTION</span><span*/}
                            {/*className="c2">] in Comma Separated Values&nbsp;Standard File Format (the &quot;</span><span*/}
                            {/*className="c5">Regulations</span><span*/}
                            {/*className="c2">&quot;);</span></li>*/}
                        {/*<li className="c1"><span className="c2">A minimum of seven thousand (7,000) distinct Customer software user stories in&nbsp;Comma Separated Values&nbsp;Standard File Format (the &quot;</span><span*/}
                            {/*className="c5">User Stories</span><span className="c2">&quot;); and</span></li>*/}
                        {/*<li className="c1"><span className="c2">A minimum of one thousand five hundred (1,500) distinct linkages and relationships between the Regulations and the User Stories in [</span><span*/}
                            {/*className="c2 c10">FORMAT</span><span className="c2">].&nbsp;</span></li>*/}
                    {/*</ol>*/}
                    <ol className="c4 lst-kix_list_16-1" start="2">
                        {/*<li className="c3 c29"><span className="c8">Report Preparation.</span><span*/}
                            {/*className="c2">&nbsp;Service Provider shall use the Customer Information to determine the most efficient and accurate neural network to link the Regulations and the User Stories and Service Provider shall use reasonable efforts to reach an accuracy rate of seventy-five percent (75%) with respect to such linkage. Service Provider shall summarize its findings in a written report to be delivered to Customer within [</span><span*/}
                            {/*className="c2 c10">NUMBER</span><span*/}
                            {/*className="c2">] days of the effective date of this Task Order (the &quot;</span><span*/}
                            {/*className="c5">Provider Report</span><span*/}
                            {/*className="c2">&quot;). The Provider Report shall include details of the top performing neural network and how the neural network&rsquo;s accuracy&nbsp;reacts to various&nbsp;data-set&nbsp;sizes.&nbsp;</span>*/}
                        {/*</li>*/}
                        <li className="c3 c29"><span className="c8">Software Implementation.</span>
                            <span className="c2">&nbsp;Service Provider shall create a Software Implementation, with the requirements and Phases given in the table below:</span>
                        </li>
                    </ol>
                    <table className="c16">
                        <tbody>
                        <tr className="c14">
                            <td className="c28" colSpan="1" rowSpan="1"><p className="c3"><span className="c5">Phase # and Specifications</span>
                            </p>
                            </td>
                            <td className="c38" colSpan="1" rowSpan="1"><p className="c3"><span className="c5">Delivery Date*</span>
                            </p></td>
                            <td className="c32" colSpan="1" rowSpan="1"><p className="c3"><span className="c5">% of Total Project</span>
                            </p></td>
                        </tr>
                        {
                            this.getPhases().map((phase, phaseIndex) =>
                                <tr className="c14" key={phaseIndex}>
                                    <td className="c28" colSpan="1" rowSpan="1"><p className="c3">
                                        <span className="c2" style={{"fontWeight": "bold"}}>Phase {phaseIndex + 1}. </span>
                                        <br/><br/>
                                        {
                                            phase.tasks.map((task) => <span key={task.taskNumber}><span>{task.taskNumber}. </span><span className="c2">{task.title}</span></span>)
                                        }
                                    </p></td>
                                    <td className="c32" colSpan="1" rowSpan="1"><p className="c3"><span className="c2 c10">[INSERT DATE HERE]</span></p></td>
                                    <td className="c32" colSpan="1" rowSpan="1"><p className="c3"><span className="c2">{(phase.total * 100 / this.props.totalHours).toFixed(2) + '%'}</span></p></td>
                                </tr>
                            )
                        }
                        </tbody>
                    </table>
                    <p className="c3 c44"><span className="c2">*</span><span className="c5">Cancellation</span><span
                        className="c2">: Notwithstanding anything to the contrary in the Service Agreement or this Task Order, if Customer terminates the Service Agreement or this Task Order less than </span><span
                        className="c2 c10">[insert #]</span><span className="c2">&nbsp;of business days prior to the Delivery Date of the relevant Phase, Customer shall be liable to Service Provider for payment of the full fee in respect of that Phase and all prior Phases. </span>
                    </p>
                    <ol className="c4 lst-kix_list_16-1" start="4">
                        <li className="c3 c29"><span className="c8">Machine Learning Acceptance:</span></li>
                    </ol>
                    <ol className="c4 lst-kix_list_16-2 start" start="1">
                        <li className="c1"><span className="c2">Once Service Provider has completed the Software Implementation in accordance with the relevant Phase, the Customer shall perform reasonable testing to ensure compliance of the Software Implementation with the specifications as outlined in the timetable above. Acceptance of the Software Implementation shall occur when the Software Implementation has passed the Acceptance Tests. Customer shall notify Service Provider when the tests have been passed and provide the results of the Acceptance Tests to Customer in writing.</span>
                        </li>
                        <li className="c1"><span className="c2">If any failure to pass the Acceptance Tests results from a defect which is caused by an act or omission of Customer, or by one of Customer&#39;s personnel or agents (&quot;</span><span
                            className="c5">Non Service Provider Defect</span><span className="c2">&quot;), the Software Implementation shall be deemed to have passed the Acceptance Tests notwithstanding such Non Service Provider Defect. &nbsp;Service Provider shall provide assistance reasonably requested by Customer in remedying any Non Service Provider Defect by supplying additional services or deliverables. Customer shall pay Service Provider in full for all such additional services and products at Service Provider&#39;s then current fees and prices.</span>
                        </li>
                        <li className="c1"><span className="c2">Acceptance of the Software Implementation shall be deemed to have taken place upon the occurrence of any of the following events:</span>
                        </li>
                    </ol>
                    <ol className="c4 lst-kix_list_16-3 start" start="1">
                        <li className="c3 c39"><span className="c2">Customer uses any part of the Software Implementation for any revenue-earning purposes or to provide any services to third parties other than for test purposes; or</span>
                        </li>
                        <li className="c3 c39"><span className="c2">Customer unreasonably delays the start of the relevant Acceptance Tests or any retests for a period of thirty (30) business days from the date on which Service Provider is ready to commence running such Acceptance Tests or retests.</span>
                        </li>
                    </ol>
                    {/*<ol className="c4 lst-kix_list_16-0" start="2">*/}
                        {/*<li className="c3 c22"><span className="c13">Items Not Included in the Scope of Work</span><span*/}
                            {/*className="c33">. </span><span*/}
                            {/*className="c2">Customer shall be responsible for the following:</span></li>*/}
                    {/*</ol>*/}
                    {/*<ol className="c4 lst-kix_list_16-1 start" start="1">*/}
                        {/*<li className="c3 c29"><span*/}
                            {/*className="c2">Providing complete and accurate Customer Information;</span></li>*/}
                        {/*<li className="c3 c29"><span*/}
                            {/*className="c2">Subscription for any third party software products;</span></li>*/}
                        {/*<li className="c3 c29"><span className="c2">Application for any incentive programs including the Scientific Research and Experimental Development Program; and</span>*/}
                        {/*</li>*/}
                        {/*<li className="c3 c29"><span className="c2">[</span><span className="c2 c10">OTHERS?</span><span*/}
                            {/*className="c2">].</span></li>*/}
                    {/*</ol>*/}
                    {/*<ol className="c4 lst-kix_list_16-0" start="3">*/}
                        {/*<li className="c3 c22"><span className="c13">Use of the Deliverables</span><span*/}
                            {/*className="c33">. </span><span className="c2">Customer may use the Deliverables for the following purposes:</span>*/}
                        {/*</li>*/}
                    {/*</ol>*/}
                    {/*<ol className="c4 lst-kix_list_16-1 start" start="1">*/}
                        {/*<li className="c3 c29"><span className="c8">[</span><span*/}
                            {/*className="c8 c10">INSERT ANY RESTRICTIONS</span><span*/}
                            {/*className="c8">]</span></li>*/}
                    {/*</ol>*/}
                    <ol className="c4 lst-kix_list_16-0" start="4">
                        <li className="c3 c22"><span className="c13">Pricing</span><span className="c33">.</span><span
                            className="c2">&nbsp; All fees listed below are inclusive of 13% HST. Any other fees discussed in this Task Order and the Service Agreement and are subject to 13% HST.</span>
                        </li>
                    </ol>
                    <table className="c19">
                        <tbody>
                        <tr className="c14">
                            <td className="c24" colSpan="1" rowSpan="1"><p className="c3"><span className="c11">Service/Deliverable</span></p></td>
                            <td className="c17" colSpan="1" rowSpan="1"><p className="c3"><span className="c11">Fixed Fee</span></p></td>
                        </tr>

                        <tr className="c14">
                            <td className="c24" colSpan="1" rowSpan="1"><p className="c3 c18"><span className="c2">Execution of this task order</span></p></td>
                            <td className="c17" colSpan="1" rowSpan="1">
                                <p className="c3">
                                    <span className="c2">
                                        <NumberFormat value={this.props.total * this.props.paymentSchedule[0]} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />
                                    </span>
                                </p>
                            </td>
                        </tr>

                        {
                            (() =>
                            {
                                let elements = [];
                                for (let payment = 1; payment < this.props.paymentSchedule.length; payment += 1)
                                {
                                    elements.push(
                                        <tr className="c14" key={payment}>
                                            <td className="c24" colSpan="1" rowSpan="1">
                                                <p className="c3 c18"><span className="c2">Completion of Phase {payment}</span></p>
                                            </td>
                                            <td className="c17" colSpan="1" rowSpan="1">
                                                <p className="c3">
                                                    <span className="c2">
                                                        <NumberFormat value={this.props.total * this.props.paymentSchedule[payment]} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>
                                    )
                                }
                                return elements;
                            })()
                        }
                        <tr className="c14">
                            <td className="c24" colSpan="1" rowSpan="1"><p className="c3"><span
                                className="c11">Total: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span>
                            </p></td>
                            <td className="c36" colSpan="1" rowSpan="1"><p className="c3 c18">
                                <span className="c2">
                                    <NumberFormat value={this.props.total} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={0} />
                                </span>
                            </p></td>
                        </tr>
                        </tbody>
                    </table>
                    <p className="c9 c34"><span className="c2"></span></p>
                    <p className="c23"><span className="c2">[REMAINDER OF PAGE LEFT INTENTIONALLY BLANK]</span></p>
                    <hr style={ {"pageBreakBefore":"always","display":"none"} }/>
                    <p className="c20 c34"><span className="c5">IN WITNESS WHEREOF</span><span className="c2">&nbsp;the Parties hereto have executed this Task Order as of the date first above written.</span>
                    </p>
                    <p className="c9"><span className="c26"></span></p>
                    <p className="c20"><span className="c26">[NTD: IF CONTRACT IS WITH AN INDIVIDUAL, USE THIS SIGNATURE LINE]</span>
                    </p>
                    <p className="c15"><span className="c11">SIGNED, SEALED AND DELIVERED</span><span
                        className="c2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</span>
                    </p>
                    <p className="c15"><span
                        className="c2">in the presence of:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</span>
                    </p>
                    <p className="c15"><span
                        className="c2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</span>
                    </p>
                    <p className="c15"><span
                        className="c2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</span>
                    </p>
                    <p className="c15"><span
                        className="c2">______________________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;________________________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    </p>
                    <p className="c15"><span
                        className="c2">Witness: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;) &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Name:</span>
                    </p>
                    <p className="c15"><span
                        className="c2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Title:</span>
                    </p>
                    <p className="c15 c31"><span className="c2">Address:</span></p>
                    <p className="c15 c31"><span className="c2">Phone Number:</span></p>
                    <p className="c15 c31"><span className="c2">Email:</span></p>
                    <p className="c9"><span className="c26"></span></p>
                    <p className="c20"><span
                        className="c26">[NTD: IF CONTRACT IS WITH A COMPANY, USE THIS SIGNATURE LINE]</span>
                    </p>
                    <p className="c9"><span className="c2"></span></p>
                    <table className="c19">
                        <tbody>
                        <tr className="c14">
                            <td className="c7" colSpan="1" rowSpan="1"><p className="c6"><span className="c2"></span>
                            </p></td>
                            <td className="c25" colSpan="1" rowSpan="1"><p className="c15"><span
                                className="c5">&nbsp; &nbsp; &nbsp;[COMPANY NAME]</span></p>
                                <p className="c6 c27"><span className="c2"></span></p>
                                <p className="c6 c27"><span className="c2"></span></p>
                                <p className="c6 c27"><span className="c2"></span></p></td>
                        </tr>
                        <tr className="c21">
                            <td className="c7" colSpan="1" rowSpan="1"><p className="c6"><span className="c2"></span>
                            </p></td>
                            <td className="c25" colSpan="1" rowSpan="1"><p className="c12"><span
                                className="c2">&nbsp; &nbsp;________________________________</span>
                            </p>
                                <p className="c12"><span className="c2">&nbsp; &nbsp;Name: </span></p>
                                <p className="c12"><span className="c2">&nbsp; &nbsp;Title: &nbsp; </span></p>
                                <p className="c12"><span className="c2">&nbsp; &nbsp;</span></p>
                                <p className="c12"><span className="c33">&nbsp; &nbsp;I have authority to bind the corporation.</span>
                                </p>
                                <p className="c6 c35"><span className="c2"></span></p>
                                <p className="c6 c35"><span className="c2"></span></p></td>
                        </tr>
                        <tr className="c14">
                            <td className="c7" colSpan="1" rowSpan="1"><p className="c6"><span className="c2"></span>
                            </p></td>
                            <td className="c25" colSpan="1" rowSpan="1"><p className="c0"><span
                                className="c5">&nbsp; &nbsp; &nbsp;ELECTRIC BRAIN SOFTWARE CORPORATION</span>
                            </p>
                                <p className="c6 c27"><span className="c2"></span></p>
                                <p className="c6 c27"><span className="c2"></span></p>
                                <p className="c6 c27"><span className="c2"></span></p></td>
                        </tr>
                        <tr className="c21">
                            <td className="c7" colSpan="1" rowSpan="1"><p className="c6"><span className="c2"></span>
                            </p></td>
                            <td className="c25" colSpan="1" rowSpan="1"><p className="c12"><span
                                className="c2">&nbsp; &nbsp;________________________________</span>
                            </p>
                                <p className="c12"><span className="c2">&nbsp; &nbsp;Name: Bradley Arsenault</span></p>
                                <p className="c12"><span className="c2">&nbsp; &nbsp;Title: &nbsp; President</span></p>
                                <p className="c12"><span className="c2">&nbsp; &nbsp;</span></p>
                                <p className="c12"><span className="c33">&nbsp; &nbsp;I have authority to bind the corporation.</span>
                                </p>
                                <p className="c6 c35"><span className="c2"></span></p>
                                <p className="c6 c35"><span className="c2"></span></p></td>
                        </tr>
                        <tr className="c21">
                            <td className="c7" colSpan="1" rowSpan="1"><p className="c9"><span className="c2"></span>
                            </p></td>
                            <td className="c25" colSpan="1" rowSpan="1"><p className="c9 c35"><span
                                className="c2"></span></p></td>
                        </tr>
                        </tbody>
                    </table>
                    <p className="c9"><span className="c2"></span></p>
                    <div><p className="c18 c40"><span className="c43"></span></p></div>
                </div>
            </div>
        );
    }
}


export default ContractTaskOrder;
