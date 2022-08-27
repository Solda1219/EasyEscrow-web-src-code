import { Fragment } from "react";
import Button from "./Button";

import closeIcon from "../../../images/close.svg";

const ImagesUploadCopy = ({ fileFields, setFileFields }) => {

    const addFileField = () => {
        if (fileFields.length < 10) {
            const lastId = fileFields[fileFields.length - 1].id;
            setFileFields([...fileFields, { id: lastId + 1 }]);
        }
    };

    const removeFileField = (fieldId) => {
        let fieldsTemp = [...fileFields];
        fieldsTemp = fieldsTemp.filter((field) => field.id !== fieldId);
        setFileFields(fieldsTemp);
    };

    const handleFileChange = (event, id) => {
        let fieldsTemp = [...fileFields];
        const index = fieldsTemp.findIndex((field) => field.id === id);
        fieldsTemp[index] = { id: id, file: event.target.files[0] };
        setFileFields(fieldsTemp);
    };

    return (
        <Fragment>
            <div className="form-row">
                <label htmlFor="purchase-images">Upload Images (upto 10)</label>
            </div>
            {fileFields.map((field) => {
                return (
                    <div
                        className="form-row upload-row"
                        key={field.id}
                        data-key={field.id}
                    >
                        <div className="upload-wrap">
                            <input
                                type="file"
                                accept="image/*"
                                id={`purchase-images-${field.id}`}
                                onChange={(e) => handleFileChange(e, field.id)}
                            />
                        </div>
                        {field.id > 1 && (
                            <img
                                src={closeIcon}
                                alt="Remove File"
                                className="remove-file"
                                onClick={() => removeFileField(field.id)}
                            />
                        )}
                    </div>
                );
            })}
            {fileFields.length < 10 && (
                <div className="form-row">
                    <Button label="Add another image" onClick={addFileField} />
                </div>
            )}
        </Fragment>
    );
};

export default ImagesUploadCopy;
