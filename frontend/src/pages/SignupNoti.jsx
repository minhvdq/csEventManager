import { useState, useEffect } from 'react';
import { Select, Button, Form, Input, Spin, message, Card, Typography, InputNumber, Space } from 'antd';
import { MailOutlined, UserOutlined, IdcardOutlined } from '@ant-design/icons';
import signupNotiService from '../services/signupNoti';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

export default function SignupNotiPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [pageState, setPageState] = useState('loading');
    const [curStudent, setCurStudent] = useState(null);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fetchedEmail = params.get('email');
        const fetchedToken = params.get('token');

        // If email and token are provided in URL, validate and check student
        if (fetchedToken && fetchedEmail) {
            setToken(fetchedToken);
            setEmail(fetchedEmail);
            checkStudent(fetchedEmail, fetchedToken);
        } else {
            // If no token/email in URL, show email input form
            setPageState('email_check');
            setLoading(false);
        }
    }, []);

    const checkStudent = async (emailToCheck, tokenToCheck) => {
        setLoading(true);
        try {
            const student = await signupNotiService.checkStudentWithEmail({ 
                email: emailToCheck, 
                token: tokenToCheck 
            });
            if (student && student.id) {
                setCurStudent(student);
                setPageState('student_found');
            } else {
                setPageState('student_not_found');
            }
        } catch (error) {
            console.error("Failed to check student:", error);
            message.error(`Error: ${error.response?.data?.error || error.message || 'Could not validate your registration.'}`);
            setPageState('error');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (values) => {
        setLoading(true);
        try {
            await signupNotiService.signupWithEmail({ email: values.email });
            message.success('Check your email for a link to complete your signup!');
            setPageState('email_sent');
        } catch (error) {
            message.error(`Error: ${error.response?.data?.message || error.message || 'Could not send signup email'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSignupNoti = async (values) => {
        setLoading(true);
        try {
            await signupNotiService.signupNoti({
                token,
                schoolEmail: email,
                ...values,
            });
            message.success('Successfully created your account!');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            message.error(`Error: ${error.response?.data?.error || error.message || 'Could not complete signup'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSignoutNoti = async () => {
        if (!curStudent?.id) {
            message.error('No student account found to delete.');
            return;
        }

        setLoading(true);
        try {
            await signupNotiService.signoutNoti({
                email,
                token
            });
            message.success('Your account has been deleted successfully!');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            message.error(`Error: ${error.response?.data?.error || error.message || 'Could not delete account'}`);
        } finally {
            setLoading(false);
        }
    };

    const backToMainPage = () => {
        navigate('/');
    };

    const EmailCheckForm = () => (
        <div>
            <Title level={3} className="mb-4">Student Account Signup</Title>
            <Text type="secondary" className="mb-4 d-block">
                Please enter your school email to receive a signup link.
            </Text>
            <Form form={form} onFinish={handleEmailSubmit} layout="vertical">
                <Form.Item
                    label="School Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Please enter your school email' },
                        { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                >
                    <Input 
                        prefix={<MailOutlined />} 
                        placeholder="your.name@gettysburg.edu"
                        size="large"
                    />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            Send Signup Link
                        </Button>
                        <Button onClick={backToMainPage} size="large">
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );

    const EmailSentConfirmation = () => (
        <div className="text-center">
            <Title level={3} className="mb-4">Check Your Email</Title>
            <Text type="secondary" className="mb-4 d-block">
                We've sent a signup link to your email address. Please check your inbox and click the link to complete your registration.
            </Text>
            <Button type="primary" onClick={backToMainPage} size="large">
                Back to Home
            </Button>
        </div>
    );

    const SignupForm = () => (
        <div>
            <Title level={3} className="mb-4">Create Your Student Account</Title>
            <Text type="secondary" className="mb-4 d-block">
                Please fill out your information to create your student account.
            </Text>
            <Form form={form} onFinish={handleSignupNoti} layout="vertical">
                <div className="row">
                    <div className="col-md-6">
                        <Form.Item 
                            label="First Name" 
                            name="firstName" 
                            rules={[{ required: true, message: 'Please enter your first name' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="John" />
                        </Form.Item>
                    </div>
                    <div className="col-md-6">
                        <Form.Item 
                            label="Last Name" 
                            name="lastName" 
                            rules={[{ required: true, message: 'Please enter your last name' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Doe" />
                        </Form.Item>
                    </div>
                </div>
                <Form.Item 
                    label="School ID" 
                    name="schoolId" 
                    rules={[{ required: true, message: 'Please enter your school ID' }]}
                >
                    <Input prefix={<IdcardOutlined />} placeholder="e.g., 123456" />
                </Form.Item>
                <Form.Item
                    label="Class Year"
                    name="classYear"
                    rules={[
                        { required: true, message: 'Please enter your graduation year' },
                        { type: 'integer', message: 'Please enter a valid year' }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="e.g., 2026"
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 10}
                    />
                </Form.Item>
                <Form.Item 
                    label="Have you taken or are you currently taking CS216?" 
                    name="taken216" 
                    rules={[{ required: true, message: 'Please select an option' }]}
                >
                    <Select placeholder="Select an option">
                        <Option value="true">Yes</Option>
                        <Option value="false">No</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            Create Account
                        </Button>
                        <Button onClick={backToMainPage} size="large">
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );

    const StudentFoundView = () => (
        <div>
            <Title level={3} className="mb-4">Account Already Exists</Title>
            <Text type="secondary" className="mb-4 d-block">
                An account with the email <strong>{email}</strong> already exists.
            </Text>
            <Text className="mb-4 d-block">
                <strong>Name:</strong> {curStudent.first_name} {curStudent.last_name}<br />
                <strong>School ID:</strong> {curStudent.school_id}<br />
                <strong>Class Year:</strong> {curStudent.class_year}
            </Text>
            <Space>
                <Button 
                    type="primary" 
                    danger 
                    onClick={handleSignoutNoti} 
                    loading={loading}
                    size="large"
                >
                    Delete Account
                </Button>
                <Button onClick={backToMainPage} size="large">
                    Back to Home
                </Button>
            </Space>
        </div>
    );

    const ErrorView = () => (
        <div className="text-center">
            <Title level={3} className="mb-4">Error</Title>
            <Text type="secondary" className="mb-4 d-block">
                There was an error processing your request. The link may be invalid or expired.
            </Text>
            <Button type="primary" onClick={backToMainPage} size="large">
                Back to Home
            </Button>
        </div>
    );

    const renderContent = () => {
        switch (pageState) {
            case 'email_check':
                return <EmailCheckForm />;
            case 'email_sent':
                return <EmailSentConfirmation />;
            case 'student_not_found':
                return <SignupForm />;
            case 'student_found':
                return <StudentFoundView />;
            case 'error':
                return <ErrorView />;
            default:
                return <EmailCheckForm />;
        }
    };

    return (
        <div className="container mt-4 mb-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <Card>
                        <Spin spinning={loading && pageState !== 'loading'}>
                            {renderContent()}
                        </Spin>
                    </Card>
                </div>
            </div>
        </div>
    );
}
