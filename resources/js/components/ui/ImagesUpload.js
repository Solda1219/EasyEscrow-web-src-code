import { Fragment, useRef, useState } from "react";
import Button from "./Button";

const ImagesUpload = ({ setFileFields }) => {

    const [filesPreviewArray, setFilesPreviewArray] = useState([]);
    const fileUploadField = useRef();

   const handleFilesField = (event) => {
       const filesList = event.target.files;
       const tempArray = [];
       for (let i = 0; i < filesList.length; i++) {
           tempArray.push(URL.createObjectURL(filesList[i]));
       }
       setFileFields(filesList);
       setFilesPreviewArray(tempArray);
   };

    return (
        <Fragment>
            {filesPreviewArray.length > 0 && (
                <div className="form-row images-array">
                    {(filesPreviewArray || []).map((url, index) => (
                        <img src={url} alt="" key={index} />
                    ))}
                </div>
            )}
            <div className="form-row">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="purchase-images"
                    ref={fileUploadField}
                    onChange={(event) => handleFilesField(event)}
                    className="hidden"
                />
                <Button onClick={() => fileUploadField.current.click()}>
                    Upload Images (upto 10)
                </Button>
            </div>
            {filesPreviewArray.length > 10 && (
                <div className="form-row error">
                    You can upload upto 10 images only!
                </div>
            )}
        </Fragment>
    );
};

export default ImagesUpload;
