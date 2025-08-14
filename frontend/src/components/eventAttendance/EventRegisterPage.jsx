import { useState} from 'react';
import { Select, Button, Form, Input, Spin, message, Card, Typography, InputNumber } from 'antd';
import { CalendarOutlined, MailOutlined } from '@ant-design/icons';
import eventRegisterService from '../../services/eventRegister';
import ResumeUpload from './ResumeUploader';

const { Title, Text } = Typography;
const { Option } = Select;

export default function EventRegisterPage({ event, togglePage }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (values) => {
        setLoading(true);
        try {
            await eventRegisterService.registerWithEmail({eventId: event.event_id, email: values.email})
            message.success(`Check your email for a link to register for the event!`);
            togglePage()
        } catch (error) {
            message.error(`Error: ${error.message || 'Could not find student'}`);
        } finally {
            setLoading(false);
        }
    };

    const EmailCheckForm = () => (
        <Form form={form} onFinish={handleEmailSubmit} layout="vertical">
            <Text type="secondary" className="mb-4 d-block">Please enter your school email to begin.</Text>
            <Form.Item
                label="School Email"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Please enter a valid school email' }]}
            >
                <Input prefix={<MailOutlined />} placeholder="your.name@gettysburg.edu" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    Next
                </Button>
            </Form.Item>
        </Form>
    );

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <Spin spinning={loading}>
                        <Card>
                            <EmailCheckForm />
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <Button onClick={togglePage}>Cancel</Button>
                            </div>
                        </Card>
                    </Spin>
                </div>
            </div>
        </div>
    );
}
