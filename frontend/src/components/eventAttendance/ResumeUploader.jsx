import { useState, useEffect } from 'react';
import { Upload, Button, message, Typography, Space } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const { Text } = Typography;

export default function ResumeUpload({ setResume, setResumeTitle }) {
    const [fileList, setFileList] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Effect to clean up the blob URL to prevent memory leaks
    useEffect(() => {
        // This function is called when the component unmounts or when previewUrl changes.
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (info) => {
        // We only work with the latest file in the list.
        let newFileList = [...info.fileList].slice(-1);

        if (newFileList.length > 0) {
            const file = newFileList[0].originFileObj;
            if (file) {
                console.log("file name is " + file.name)
                // If there's a file, update the state and inform the parent component.
                setFileList(newFileList);
                setResume(file);
                setResumeTitle(file.name);
                
                // Create a new preview URL
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
        } else {
            // If the list is empty (e.g., file removed), clear everything.
            handleRemove();
        }
    };
    
    const handleRemove = () => {
        setFileList([]);
        setResume(null);
        setResumeTitle(null);
        // The useEffect cleanup will handle revoking the old previewUrl
        setPreviewUrl(null); 
    };

    const handlePreview = () => {
        if (previewUrl) {
            window.open(previewUrl, '_blank');
        }
    };
    
    const uploadProps = {
        accept: ".pdf",
        fileList: fileList,
        beforeUpload: (file) => {
            const isPdf = file.type === 'application/pdf';
            if (!isPdf) {
                message.error('You can only upload PDF files!');
            }
            // Returning false prevents Ant Design's default upload behavior.
            // If the file is not a PDF, we also prevent it from being added to the list.
            return isPdf ? false : Upload.LIST_IGNORE;
        },
        onChange: handleFileChange,
        onRemove: handleRemove, // Use the built-in remove icon logic
    };

    return (
        <div className="p-3 border rounded shadow-sm bg-light">
            <h5 className="mb-3">Upload Resume</h5>
            {fileList.length > 0 ? (
                // View shown when a file is selected
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="d-flex justify-content-between align-items-center p-2 border rounded bg-white">
                        <Text ellipsis={true} className="flex-grow-1">
                            {fileList[0].name}
                        </Text>
                        <Space>
                            <Button icon={<EyeOutlined />} onClick={handlePreview}>
                                Preview
                            </Button>
                            <Button icon={<DeleteOutlined />} onClick={handleRemove} danger>
                                Remove
                            </Button>
                        </Space>
                    </div>
                </Space>
            ) : (
                // View shown when no file is selected
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Select PDF</Button>
                </Upload>
            )}
        </div>
    );
}