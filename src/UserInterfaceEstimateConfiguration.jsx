import React, {Component} from 'react';
import {Button, Modal} from 'react-bootstrap';

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


class UserInterfaceEstimateConfiguration extends Component {
    constructor ()
    {
        super();

        this.state = {};
    }


    componentWillMount() {
        const added = this.ensureEmptyComponent(this.props.estimate);
        if (added) {
            this.props.onChange(this.props.estimate);
        }
    }


    changeTaskType(taskInfo, event) {
        taskInfo.type = event.target.value;
        this.props.onChange(this.props.estimate);
    }

    // This function always makes sure there is an empty task at the end of the list.
    ensureEmptyComponent(estimate) {
        if (!estimate.components) {
            estimate.components = [];
        }

        let isEmptyTask = false;
        for (let task of estimate.components) {
            if (!(task.title.trim())) {
                isEmptyTask = true;
            }
        }
        if (!isEmptyTask) {
            estimate.components.push({
                type: 'feature',
                title: " ",
                hours: 0,
                groups: []
            })
        }

        // Return true if we added an empty task
        return !isEmptyTask;
    }

    renderTaskType(cellInfo) {
        const taskInfo = cellInfo.original;
        return (
            <div>
                <select value={taskInfo.type} defaultValue='component'
                        onChange={this.changeTaskType.bind(this, taskInfo)}>
                    <option value="component">Component</option>
                    <option value="script">Script</option>
                    <option value="feature">Feature</option>
                    <option value="function">Function</option>
                    <option value="task">Task</option>
                    <option value="document">Document</option>
                </select>
            </div>
        );
    }

    renderEditable(cellInfo) {
        return (
            <div
                style={{backgroundColor: "#fafafa"}}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const estimate = this.props.estimate;
                    let content = e.target.textContent.replace(/<br\s+\/?>/g, "");
                    if (cellInfo.column.id === 'hours') {
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

                    estimate.components[cellInfo.index][cellInfo.column.id] = content;
                    this.ensureEmptyComponent(estimate);
                    this.props.onChange(estimate);
                }}
                dangerouslySetInnerHTML={{
                    __html: this.props.estimate.components[cellInfo.index][cellInfo.column.id].toString().replace(/\s/g, "&nbsp;")
                }}
            />
        );
    }

    uploadNewStoreMap() {
        const upload = document.createElement('input');
        upload.setAttribute('type', 'file');
        const self = this;

        function handleFiles() {
            var fileList = this.files;
            const file = fileList[0];

            UserInterfaceEstimateConfiguration.getFileData(file, (dataUri) =>
            {
                self.props.estimate.mockup = dataUri;
                self.props.onChange(self.props.estimate);
            });
        }

        upload.addEventListener("change", handleFiles, false);
        upload.click();
    }

    showCrop(component) {
        this.setState({
            "showingCrop": true,
            "selectedComponent": component
        });
    }

    closeCrop(component) {

        console.log("cropping ", component);
        UserInterfaceEstimateConfiguration.getCroppedImg(this.props.estimate.mockup, component.pixelCrop, "cropped.jpg").then((fileData) =>
        {
            UserInterfaceEstimateConfiguration.getFileData(fileData,
                (dataUri) =>
                {
                    component.mockup = dataUri;
                    this.props.onChange(this.props.estimate);
                });
        });

        this.setState({
            "showingCrop": false
        })
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


    onComponentCropChange(component, crop, pixelCrop) {
        // component.mockup = null;
        component.crop = crop;
        component.pixelCrop = pixelCrop;
        this.props.onChange(this.props.estimate);
    }


    render() {
        return (
            <div>
                <h3>User Interface Estimate</h3>

                <Button bsStyle="default" onClick={this.uploadNewStoreMap.bind(this)}>Upload Mockup</Button>

                {
                    this.props.estimate.mockup ?
                        <img src={this.props.estimate.mockup} style={{"maxWidth": "50%", "maxHeight": "200px"}}/>
                        : null
                }

                <ReactTable
                    data={this.props.estimate.components}
                    columns={[
                        {
                            Header: "Type",
                            accessor: "type",
                            Cell: this.renderTaskType.bind(this)
                        },
                        {
                            Header: "Title",
                            accessor: "title",
                            Cell: this.renderEditable.bind(this)
                        },
                        {
                            Header: "Hours",
                            accessor: "hours",
                            Cell: this.renderEditable.bind(this)
                        },
                        {
                            Header: "Mockup",
                            accessor: "mockup",
                            minWidth: 200,
                            Cell: (cellInfo) =>
                                <div>
                                    {
                                        this.props.estimate.components[cellInfo.index].mockup ?
                                        <img src={this.props.estimate.components[cellInfo.index].mockup} style={{"maxWidth": "100%", "maxHeight": "200px"}}/>
                                        : null
                                    }
                                </div>
                        },
                        {
                            Header: "Action",
                            accessor: "cropMockup",
                            Cell: (cellInfo) => <Button bsStyle="primary" onClick={() => this.showCrop(this.props.estimate.components[cellInfo.index])}>Crop Mockup</Button>
                        }
                    ]}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />


                { this.state.showingCrop ?
                    <div className="static-modal">
                        <Modal.Dialog bsSize={'lg'}>
                            <Modal.Header>
                                <Modal.Title>Crop Mockup</Modal.Title>
                                <Button onClick={() => this.closeCrop(this.state.selectedComponent)}>Close</Button>
                            </Modal.Header>

                            <Modal.Body>
                                <ReactCrop src={this.props.estimate.mockup}
                                           crop={this.state.selectedComponent.crop}
                                           onChange={(crop, pixelCrop) => this.onComponentCropChange(this.state.selectedComponent, crop, pixelCrop)}
                                           imageStyle={{"width": "100%"}}
                                />
                            </Modal.Body>

                            <Modal.Footer>
                                <Button onClick={() => this.closeCrop(this.state.selectedComponent)}>Close</Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </div> : null
                }

            </div>
        );
    }
}

export default UserInterfaceEstimateConfiguration;

