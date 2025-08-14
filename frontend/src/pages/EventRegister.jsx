import { useState, useEffect, useCallback } from 'react';
import { Select, Button, Form, Input, Spin, message, Card, Typography, InputNumber } from 'antd';
import { CalendarOutlined, MailOutlined } from '@ant-design/icons';
import eventService from '../services/event';
import eventRegisterService from '../services/eventRegister';
import ResumeUpload from '../components/eventAttendance/ResumeUploader';
import { frontendBase } from '../utils/homeUrl';

const { Title, Text } = Typography;
const { Option } = Select;

export default function EventRegisterPage() {
    const [form] = Form.useForm();
    const [pageState, setPageState] = useState('loading');
    const [curStudent, setCurStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState(null);
    const [curEvent, setCurEvent] = useState(null);
    const [eventId, setEventId] = useState(null);
    // const [resume, setResume] = useState(null);
    // const [resumeTitle, setResumeTitle] = useState(null);

    // const setResumeTitle = useCallback((title) => {
    //     form.setFieldsValue({ resumeTitle: title });
    // }, [form]);

    const togglePage = () => {
        window.location.href = frontendBase;
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setToken(params.get('token'));
        setEmail(params.get('email'));
        setEventId(params.get('eventId'));
    }, []);

    useEffect(() => {
        if (!email || !token || !eventId) {
            return;
        }

        setLoading(true);

        eventService.getByID(eventId).then(event => {
            setCurEvent(event);
            return eventRegisterService.checkStudentWithEmail({ email, token, eventId });
        }).then(student => {
            if (student && student.id) {
                setCurStudent(student);
                setPageState('existing_student');
                // Use a single, shared state for the resume
    
                form.setFieldsValue({
                    taken216: student.taken216,
                    resumeTitle: student.resume_title,
                });
            } else {
                setPageState('new_student');
            }
        }).catch(error => {
            console.error("Failed to fetch event or student details:", error);
            message.error(`Error: ${error.message || 'Could not validate your registration.'}`);
            setPageState('error');
        }).finally(() => {
            setLoading(false);
        });
    }, [email, token, eventId, form]);

    const handleRegisterNewUser = async (values) => {
        setLoading(true);
        const body = {
            token,
            eventId: curEvent.event_id,
            schoolEmail: email,
            ...values,
        };

        try {
            await eventRegisterService.registerForNewStudent(body);
            message.success('Successfully registered for the event!');
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
            token,
            email,
            eventId: curEvent.event_id,
            studentId: curStudent?.id,
            ...values,
        };

        try {
            await eventRegisterService.registerForExistingStudent(body);
            message.success(`Successfully registered ${curStudent.first_name} for the event!`);
            togglePage();
        } catch (e) {
            message.error(`Registration failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (pageState === 'existing_student') {
            return `Welcome back, ${curStudent?.first_name}!`;
        }
        if (pageState === 'new_student') {
            return 'Create Your Profile';
        }
        return 'Register';
    };

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
        let needsMajorUpdate = false;
        if(student.taken216 == 0){
            const now = new Date();
            const lastUpdate = new Date(student.last_update);
            const isCurrentlyFall = now.getMonth() >= 6 && now.getMonth() <= 11;
            const lastUpdateWasFall = lastUpdate.getMonth() >= 6 && lastUpdate.getMonth() <= 11;
            needsMajorUpdate = now.getFullYear() > lastUpdate.getFullYear() || isCurrentlyFall !== lastUpdateWasFall;
        }

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
            {curEvent?.need_resume && (
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
                        {curEvent && (
                            <Card>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Title level={4} className="mb-0">{getTitle()}</Title>
                                    <Button onClick={togglePage}>Cancel</Button>
                                </div>
                                {pageState === 'existing_student' && curStudent && <RegisterExistingUserForm student={curStudent} />}
                                {pageState === 'new_student' && <RegisterNewUserForm />}
                            </Card>
                        )}
                    </Spin>
                </div>
            </div>
        </div>
    );
}