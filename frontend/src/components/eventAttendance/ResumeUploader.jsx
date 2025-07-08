import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, EyeOutlined } from '@ant-design/icons';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ResumeUpload({ setResume, setResumeTitle }) {
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (info) => {
        const file = info.file.originFileObj;
        if (file && file.type === 'application/pdf') {
        setResume(file);
        setResumeTitle(file.name);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        } else {
        message.error('Only PDF files are allowed.');
        }
    };

    const handlePreview = () => {
        if (previewUrl) {
        window.open(previewUrl, '_blank');
        }
    };

    return (
        <div className="p-3 border rounded shadow-sm">
        <h5 className="mb-3">Upload Resume (PDF)</h5>
        <Upload
            accept=".pdf"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleFileChange}
        >
            <Button icon={<UploadOutlined />}>Select PDF</Button>
        </Upload>

        {previewUrl && (
            <Button
            icon={<EyeOutlined />}
            className="mt-2 ms-2"
            onClick={handlePreview}
            type="default"
            >
            Preview
            </Button>
        )}
        </div>
    );
}
