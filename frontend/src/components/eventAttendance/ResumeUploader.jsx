import { useState, useEffect } from 'react';
import { Upload, Button, message, Typography, Space } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function ResumeUpload({ setResume, existingResumeTitle, existingResumeUrl }) {
    const [file, setFile] = useState(null);
    const [displayFileName, setDisplayFileName] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [resumeManuallyCleared, setResumeManuallyCleared] = useState(false);

    // Show existing resume on first load only if user hasn’t removed or uploaded a file
    useEffect(() => {
        if (!file && !resumeManuallyCleared && existingResumeTitle) {
            setDisplayFileName(existingResumeTitle);
        }
    }, [existingResumeTitle, file, resumeManuallyCleared]);

    const handleFileChange = ({ file: selectedFile }) => {
        const raw = selectedFile.originFileObj || selectedFile;
        // console.log("raw: " + JSON.stringify(raw))

        if (raw?.type !== 'application/pdf') {
            message.error("Only PDF files are allowed.");
            return;
        }

        const wrapped = {
            uid: raw.uid || Date.now().toString(),
            name: raw.name,
            status: 'done',
            originFileObj: raw,
        };

        setFile(raw);
        setResume(raw);
        setDisplayFileName(raw.name);
        setFileList([wrapped]);
        setResumeManuallyCleared(false); // Reset manual clear state
    };

    const handleRemove = () => {
        setFile(null);
        setResume(null);
        setDisplayFileName(null);
        setFileList([]);
        setResumeManuallyCleared(true); // Prevent fallback to existing resume
    };

    const handlePreview = () => {
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            window.open(previewUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        if (existingResumeUrl && !resumeManuallyCleared) {
            if (existingResumeUrl.startsWith('data:application/pdf;base64,')) {
                const base64 = existingResumeUrl.replace('data:application/pdf;base64,', '');
                const binary = atob(base64);
                const byteArray = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    byteArray[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank', 'noopener,noreferrer');
            } else {
                window.open(existingResumeUrl, '_blank', 'noopener,noreferrer');
            }
            return;
        }

        message.info("No resume is available to preview.");
    };

    const uploadProps = {
        accept: ".pdf",
        beforeUpload: () => false,
        onChange: handleFileChange,
        showUploadList: false,
        fileList,
        maxCount: 1,
    };

    return (
        <div className="p-2 border rounded bg-white">
            {displayFileName ? (
                <div className="d-flex justify-content-between align-items-center">
                    <Text ellipsis className="me-3 flex-grow-1" title={displayFileName}>
                        {displayFileName}
                    </Text>
                    <Space>
                        <Button icon={<EyeOutlined />} onClick={handlePreview}>Preview</Button>
                        <Button icon={<DeleteOutlined />} onClick={handleRemove} danger>Remove</Button>
                    </Space>
                </div>
            ) : (
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Select PDF</Button>
                </Upload>
            )}
        </div>
    );
}
