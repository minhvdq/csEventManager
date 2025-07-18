import { useState, useEffect } from 'react';
import { Select, Button, Form, Input, Spin, message, Card, Typography, InputNumber } from 'antd';
import { CalendarOutlined, MailOutlined } from '@ant-design/icons';
import studentService from '../../services/student';
import eventRegisterService from '../../services/eventRegister';
import ResumeUpload from './ResumeUploader';

const { Title, Text } = Typography;
const { Option } = Select;

export default function EventRegisterPage({ event, togglePage }) {
    const [form] = Form.useForm();
    const [pageNumber, setPageNumber] = useState(1);
    const [curStudent, setCurStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const resetFields = () => {
        form.resetFields();
        setEmail("");
        setCurStudent(null);
        setPageNumber(1);
        setLoading(false);
    };

    const handleEmailSubmit = async (values) => {
        setLoading(true);
        try {
            const checkStudentResponse = await studentService.getByEmail(values.email);
            setEmail(values.email);

            if (!checkStudentResponse.exists) {
                setPageNumber(3);
            } else {
                const studentData = checkStudentResponse.student;
                setCurStudent(studentData);

                const now = new Date();
                const lastUpdate = new Date(studentData.last_update);
                const currentMonth = now.getMonth();
                const isCurrentlyFall = currentMonth >= 6 && currentMonth <= 11;
                const lastUpdateWasFall = lastUpdate.getMonth() >= 6 && lastUpdate.getMonth <= 11;
                const needsMajorUpdate = now.getFullYear() > lastUpdate.getFullYear() || isCurrentlyFall !== lastUpdateWasFall;
                
                const needsResumeDisplay = event.need_resume;

                if (!needsMajorUpdate && !needsResumeDisplay) {
                    await eventRegisterService.registerForExistingStudent({
                        eventId: event.event_id,
                        studentId: studentData.id,
                    });
                    message.success(`Successfully registered ${studentData.firstName} for the event!`);
                    resetFields();
                    togglePage();
                } else {
                    setPageNumber(2);
                }
            }
        } catch (error) {
            message.error(`Error: ${error.message || 'Could not find student'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterNewUser = async (values) => {
        setLoading(true);
        const body = {
            eventId: event.event_id,
            schoolEmail: email,
            ...values,
        };

        try {
            await eventRegisterService.registerForNewStudent(body);
            message.success('Successfully registered for the event!');
            resetFields();
            togglePage();
        } catch (e) {
            message.error(`Registration failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterExistingUser = async (values) => {
        setLoading(true);
        const body = {
            eventId: event.event_id,
            studentId: curStudent?.id,
            ...values,
        };

        try {
            await eventRegisterService.registerForExistingStudent(body);
            message.success(`Successfully registered ${curStudent.firstName} for the event!`);
            resetFields();
            togglePage();
        } catch (e) {
            message.error(`Registration failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (pageNumber) {
            case 1:
                return `Register for ${event.name}`;
            case 2:
                return `Welcome back, ${curStudent?.firstName}!`;
            case 3:
                return 'Create Your Profile';
            default:
                return 'Register';
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

    const RegisterNewUserForm = () => (
        <Form form={form} onFinish={handleRegisterNewUser} layout="vertical">
             <Text type="secondary" className="mb-4 d-block">We didn't find an account with that email. Please fill out your details.</Text>

            <div className="row">
                <div className="col-md-6">
                    <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </div>
                <div className="col-md-6">
                    <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </div>
            </div>

            <Form.Item label="School ID" name="schoolId" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item 
                label="Class Year" 
                name="classYear" 
                rules={[{ required: true, type: 'integer', message: 'Please enter a valid graduation year' }]}
            >
                <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="e.g., 2026" 
                    min={new Date().getFullYear()} 
                />
            </Form.Item>

            <Form.Item label="Have you taken or are you currently taking CS216?" name="taken216" rules={[{ required: true, message: 'This field is required' }]}>
                <Select>
                    <Option value={true}>Yes</Option>
                    <Option value={false}>No</Option>
                </Select>
            </Form.Item>

            <Form.Item label="Upload your resume" name="resume" required={event.need_resume}>
                <ResumeUpload 
                    setResume={(file) => form.setFieldsValue({ resume: file })} 
                    setResumeTitle={(title) => form.setFieldsValue({ resumeTitle: title })}
                />
            </Form.Item>
            
            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    Register
                </Button>
            </Form.Item>
        </Form>
    );

    const RegisterExistingUserForm = ({ student }) => {
        const now = new Date();
        const lastUpdate = new Date(student.last_update);
        const isCurrentlyFall = now.getMonth() >= 6 && now.getMonth() <= 11;
        const lastUpdateWasFall = lastUpdate.getMonth() >= 6 && lastUpdate.getMonth() <= 11;
        const needsMajorUpdate = now.getFullYear() > lastUpdate.getFullYear() || isCurrentlyFall !== lastUpdateWasFall;

        return (
         <Form form={form} onFinish={handleRegisterExistingUser} layout="vertical">
            <Text type="secondary" className="mb-4 d-block">Please confirm or update your information below.</Text>

            {needsMajorUpdate && (
                <Form.Item
                    name="taken216"
                    label={<span className="fw-bold"><CalendarOutlined className="me-1" /> Have you taken or are you currently taking CS 216?</span>}
                    rules={[{ required: true, message: 'Please select an option' }]}
                >
                    <Select placeholder="Select an option">
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                    </Select>
                </Form.Item>
            )}

            {event.need_resume && (
                <Form.Item 
                    label="Your Resume" 
                    name="resume" 
                    help="Upload a new PDF to replace your existing one."
                >
                     <ResumeUpload 
                        setResume={(file) => form.setFieldsValue({ resume: file })} 
                        setResumeTitle={(title) => form.setFieldsValue({ resumeTitle: title })}
                        existingResumeTitle={student?.resume_title}
                        existingResumeUrl={student?.resume}
                    />
                </Form.Item>
            )}

            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    Complete Registration
                </Button>
            </Form.Item>
        </Form>
    )};

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <Spin spinning={loading}>
                        <Card>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <Title level={4} className="mb-0">{getTitle()}</Title>
                                <Button onClick={togglePage}>Cancel</Button>
                            </div>
                            
                            {pageNumber === 1 && <EmailCheckForm />}
                            {pageNumber === 2 && curStudent && <RegisterExistingUserForm student={curStudent} />}
                            {pageNumber === 3 && <RegisterNewUserForm />}

                            {pageNumber !== 1 && (
                                <Button className="mt-3" onClick={resetFields}>
                                    Back
                                </Button>
                            )}
                        </Card>
                    </Spin>
                </div>
            </div>
        </div>
    );
}
