import { useState, useEffect } from 'react';
import { Upload, Button, message, Typography, Space } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';

const { Text } = Typography;

export default function ResumeUpload({ setResume, setResumeTitle, existingResumeTitle, existingResumeUrl }) {
    const [file, setFile] = useState(null); // Tracks the new file uploaded by the user
    const [displayFileName, setDisplayFileName] = useState(null);

    useEffect(() => {
        // Set the initial display name from props
        setDisplayFileName(existingResumeTitle || null);
    }, [existingResumeTitle]);

    const handleFileChange = (info) => {
        const selectedFile = info.file.originFileObj;
        if (selectedFile) {
            setFile(selectedFile);
            setDisplayFileName(selectedFile.name);
            setResume(selectedFile);
            setResumeTitle(selectedFile.name);
        }
    };
    
    const handleRemove = () => {
        setFile(null);
        setDisplayFileName(null);
        setResume(null);
        setResumeTitle(null); 
    };

    const handlePreview = () => {
        if (file) {
            // Case 1: Preview a NEW file the user just selected
            const newFileUrl = URL.createObjectURL(file);
            window.open(newFileUrl);
        } else if (existingResumeUrl) {
            // Case 2: Preview the EXISTING resume using the Data URL from the backend
            window.open(existingResumeUrl, '_blank');
        } else {
            message.info("No resume is available for preview.");
        }
    };
    
    const uploadProps = {
        accept: ".pdf",
        showUploadList: false,
        beforeUpload: () => false,
        onChange: handleFileChange,
    };

    const canPreview = !!file || !!existingResumeUrl;

    return (
        <div className="p-3 border rounded shadow-sm bg-light">
            <h5 className="mb-3">Upload Resume</h5>
            {displayFileName ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="d-flex justify-content-between align-items-center p-2 border rounded bg-white">
                        <Text ellipsis={true} className="flex-grow-1">{displayFileName}</Text>
                        <Space>
                            <Button icon={<EyeOutlined />} onClick={handlePreview} disabled={!canPreview}>
                                Preview
                            </Button>
                            <Button icon={<DeleteOutlined />} onClick={handleRemove} danger>
                                Change
                            </Button>
                        </Space>
                    </div>
                </Space>
            ) : (
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Select PDF</Button>
                </Upload>
            )}
        </div>
    );
}