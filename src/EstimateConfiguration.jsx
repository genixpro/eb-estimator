import React, {Component} from 'react';
import {FormControl, Col, Row, Button, Checkbox, FormGroup, ControlLabel, Modal} from 'react-bootstrap';
import Estimate from './Estimate';
import _ from 'underscore';
import ReactTable from "react-table";
import "react-table/react-table.css";

import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

class EstimateConfiguration extends Component {
    constructor()
    {
        super();

        this.state = {};
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
                            return <option key={option.value} value={option.value}>{option.title}</option>;
                        })
                    }
                </select>
            </div>;
        }
        else if (columnOption.type === 'crop')
        {
            const itemInfo = cellInfo.original;
            return <div>
                <Button bsStyle="primary" onClick={() => this.showCrop(itemInfo, columnOption.field, columnOption.mainImageField)}>Crop Mockup</Button>
                {
                    this.props.estimate[formOptions.field][cellInfo.index][columnOption.field] ?
                        <img src={this.props.estimate[formOptions.field][cellInfo.index][columnOption.field]} style={{"maxWidth": "100%", "maxHeight": "200px"}} alt={"Cropped UI Mockup"}/>
                        : null
                }
            </div>
        }
    }


    uploadNewImage(field) {
        const upload = document.createElement('input');
        upload.setAttribute('type', 'file');
        const self = this;

        function handleFiles() {
            var fileList = this.files;
            const file = fileList[0];

            EstimateConfiguration.getFileData(file, (dataUri) =>
            {
                self.props.estimate[field] = dataUri;
                self.props.onChange(self.props.estimate);
            });
        }

        upload.addEventListener("change", handleFiles, false);
        upload.click();
    }

    static getFileData(file, callback)
    {
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                callback(e.target.result);
            };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
    }

    showCrop(item, cropField, mainImageField) {
        this.setState({
            "showingCrop": true,
            "selectedItemForCrop": item,
            'cropField': cropField,
            'mainImageField': mainImageField
        });
    }

    closeCrop(item, cropField, mainImageField) {
        if (item.pixelCrop) {
            EstimateConfiguration.getCroppedImg(this.props.estimate[mainImageField], item.pixelCrop, "cropped.jpg").then((fileData) => {
                EstimateConfiguration.getFileData(fileData,
                    (dataUri) => {
                        item[cropField] = dataUri;
                        this.props.onChange(this.props.estimate);
                    });
            });
        }

        this.setState({
            "showingCrop": false
        })
    }

    onItemCropChange(item, crop, pixelCrop) {
        item.crop = crop;
        item.pixelCrop = pixelCrop;
        this.props.onChange(this.props.estimate);
    }


    /**
     * @param {File} image - Image File Object
     * @param {Object} pixelCrop - pixelCrop Object provided by react-image-crop
     * @param {String} fileName - Name of the returned file in Promise
     */
    static getCroppedImg(image, pixelCrop, fileName) {

        const imgElem = document.createElement('img');
        imgElem.setAttribute("src", image);

        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imgElem,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        // As Base64 string
        // const base64Image = canvas.toDataURL('image/jpeg');

        // As a blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(file => {
                file.name = fileName;
                resolve(file);
            }, 'image/jpeg');
        });
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
                {
                    formConfig.title ?
                        <Row>
                            <Col sm={12}>
                                <h3>{formConfig.title}</h3>
                            </Col>
                        </Row>
                        : null
                }
                <Row>
                {
                    filterConditions(formConfig.form).map((formOption) =>
                        <Col sm={formOption.gridSize || 12} key={formOption.title}>
                            <br/>
                            <FormGroup controlId="formHorizontalText">
                                <Col componentClass={ControlLabel} sm={2}>
                                    <p style={{'whiteSpace': 'normal'}}>{formOption.title}</p>
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
                                        formOption.type === 'text' ?
                                            <div>
                                                <FormControl type="text" placeholder={formOption.placeholder} value={this.props.estimate[formOption.field]} onChange={this.optionChanged.bind(this, formOption.field)}/>
                                            </div> : null
                                    }
                                    {
                                        formOption.type === 'table' ?
                                            <div>
                                                <ReactTable
                                                    data={this.props.estimate[formOption.field]}
                                                    columns={
                                                        formOption.columns.map((columnOption) => {
                                                            const options = {
                                                                Header: columnOption.title,
                                                                accessor: columnOption.field,
                                                                Cell: this.renderTableEditable.bind(this, formOption, columnOption)
                                                            };
                                                            if (columnOption.minWidth)
                                                            {
                                                                options.minWidth = columnOption.minWidth;
                                                            }
                                                            if (columnOption.maxWidth)
                                                            {
                                                                options.maxWidth = columnOption.maxWidth;
                                                            }
                                                            return options;
                                                        })
                                                    }
                                                    defaultPageSize={10}
                                                    className="-striped -highlight"
                                                />
                                            </div> : null
                                    }
                                    {
                                        formOption.type === 'image' ?
                                            <div>
                                                <Button bsStyle="default" onClick={this.uploadNewImage.bind(this, formOption.field)}>Upload {formOption.title}</Button>
                                                {
                                                    this.props.estimate[formOption.field] ?
                                                        <img src={this.props.estimate[formOption.field]} style={{"maxWidth": "50%", "maxHeight": "200px"}} alt={"UI Mockup"}/>
                                                        : null
                                                }
                                            </div> : null
                                    }
                                </Col>
                            </FormGroup>
                            <br/>
                        </Col>
                    )
                }
                </Row>
            </div>
        )
    }

    render() {
        return (
            <div>
                <Row className="show-grid">
                    {/*<pre>{JSON.stringify(this.props.estimate, null, 2)}</pre>*/}
                    <Col xs={12} md={10}>
                        {
                            this.renderForm(this.props.formOptions)
                        }
                    </Col>
                    <Col xs={4} md={2}>
                        <Button bsStyle="danger" onClick={this.deleteClicked.bind(this)} style={{"float":"left"}}>Delete</Button>
                        <div style={{'display':'inline-block'}}>
                            <h4 style={{'textAlign': 'right'}}>{this.calculateHours().toFixed(2)} hours</h4>
                            <h4 style={{'textAlign': 'right'}}>${this.calculateExpenses().toFixed(2)} expenses</h4>
                        </div>
                    </Col>
                </Row>

                { this.state.showingCrop ?
                    <div className="static-modal scrollable-modal">
                        <Modal.Dialog bsSize={'lg'}>
                            <Modal.Header>
                                <Modal.Title>Crop Mockup</Modal.Title>
                                <Button onClick={() => this.closeCrop(this.state.selectedItemForCrop, this.state.cropField, this.state.mainImageField)}>Close</Button>
                            </Modal.Header>

                            <Modal.Body>
                                <ReactCrop src={this.props.estimate[this.state.mainImageField]}
                                           crop={this.state.selectedItemForCrop.crop}
                                           onChange={(crop, pixelCrop) => this.onItemCropChange(this.state.selectedItemForCrop, crop, pixelCrop)}
                                           imageStyle={{"width": "100%"}}
                                />
                            </Modal.Body>

                            <Modal.Footer>
                                <Button onClick={() => this.closeCrop(this.state.selectedItemForCrop, this.state.cropField, this.state.mainImageField)}>Close</Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </div> : null
                }
            </div>
        );
    }
}

export default EstimateConfiguration;
