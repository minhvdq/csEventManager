import { useState, useEffect } from "react";
import { Input, Select, Button, Typography, Spin, Form, message, Modal } from "antd";
import { MessageOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import EventCard from "../components/event/EventCard";
import EventRegisterPage from "../components/eventAttendance/EventRegisterPage";
import EventManager from "../components/event/EventManager";
import NavBar from "../components/NavBar";
import { frontendBase } from "../utils/homeUrl";
import sendFeedbackService from "../services/sendFeedback";

const { Option } = Select;
const { Title } = Typography;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

// Parse datetime string - handles both MySQL format (YYYY-MM-DD HH:MM:SS) and ISO 8601 format
// new Date() correctly handles ISO 8601 strings and converts them to local timezone.
// For MySQL format strings without timezone, we parse them as local time (consistent with EventCard.jsx).
const parseMySqlDateTimeAsLocal = (dateTimeString) => {
    if (!dateTimeString) return null;
    // If it's already a Date object, return it
    if (dateTimeString instanceof Date) return dateTimeString;
    
    // new Date() handles ISO 8601 format (with 'T') correctly
    // For MySQL format (YYYY-MM-DD HH:MM:SS), replace space with 'T' to make it ISO-like
    // This ensures consistent parsing behavior across browsers
    const normalized = dateTimeString.slice(0, 19).replace(' ', 'T');
    return new Date(normalized);
};

export default function Home({ events, setEvents, curUser, handleLogout }) {
    const [presentEvents, setPresentEvents] = useState(events);
    const [search, setSearch] = useState("");
    const [term, setTerm] = useState("All");
    const [year, setYear] = useState("All");
    const [sort, setSort] = useState("Latest");
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(false);

    const [registeringEvent, setRegisteringEvent] = useState(null);
    const [managingEvent, setManagingEvent] = useState(null);
    const [feedbackForm] = Form.useForm();
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [showFAQModal, setShowFAQModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            let filteredEvents = [...events];

            if (search.trim()) {
                filteredEvents = filteredEvents.filter((event) =>
                    event.name.toLowerCase().includes(search.toLowerCase())
                );
            }

            if (filter === "Colloquium") {
                filteredEvents = filteredEvents.filter((event) => event.is_colloquium);
            } else if (filter === "NoColloquium") {
                filteredEvents = filteredEvents.filter((event) => !event.is_colloquium);
            }

            if (year !== "All") {
                filteredEvents = filteredEvents.filter(event => {
                    const eventYear = parseMySqlDateTimeAsLocal(event.start_time)?.getFullYear();
                    return eventYear?.toString() === year.toString();
                });
            }

            if (term === "Spring") {
                filteredEvents = filteredEvents.filter((event) => {
                    const month = parseMySqlDateTimeAsLocal(event.start_time)?.getMonth() + 1;
                    return month >= 1 && month <= 6;
                });
            } else if (term === "Fall") {
                filteredEvents = filteredEvents.filter((event) => {
                    const month = parseMySqlDateTimeAsLocal(event.start_time)?.getMonth() + 1;
                    return month >= 7 && month <= 12;
                });
            }

            filteredEvents.sort((a, b) => {
                const aTime = parseMySqlDateTimeAsLocal(a.start_time)?.getTime() || 0;
                const bTime = parseMySqlDateTimeAsLocal(b.start_time)?.getTime() || 0;
                return sort === "Latest" ? bTime - aTime : aTime - bTime;
            });
            console.log("filteredEvents are: " + JSON.stringify(filteredEvents))
            setPresentEvents(filteredEvents);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [events, search, term, year, sort, filter]);
    
    const toggleRegisterPage = (event = null) => {
        setRegisteringEvent(event);
    };

    const toggleManagePage = (event = null) => {
        setManagingEvent(event);
    };

    const handleDeleteEventLocal = (eventId) => {
        setEvents(events.filter((event) => event.event_id !== eventId));
    }
    
    const handleClickCreateEvent = (e) => {
        e.preventDefault();
        window.location.href = `${frontendBase}/create`;
    };

    const toggleFeedbackForm = () => {
        setShowFeedbackForm(!showFeedbackForm);
        if (showFeedbackForm) {
            feedbackForm.resetFields();
        }
    };

    const handleFeedbackSubmit = async (values) => {
        setFeedbackLoading(true);
        try {
            await sendFeedbackService.sendFeedback({
                name: values.name || undefined,
                message: values.message
            });
            message.success('Thank you for your feedback! We appreciate your input.');
            feedbackForm.resetFields();
            setShowFeedbackForm(false);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to send feedback. Please try again.');
        } finally {
            setFeedbackLoading(false);
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <NavBar curUser={curUser} handleLogout={handleLogout}/>
            <div className="container py-4">
                {managingEvent ? (
                    <EventManager 
                        event={managingEvent}
                        setEvents={setEvents}
                        togglePage={() => toggleManagePage(null)}
                        curUser={curUser}
                        handleDeleteEventLocal={handleDeleteEventLocal}
                    />
                ) : registeringEvent ? (
                    <EventRegisterPage 
                        event={registeringEvent}
                        togglePage={() => toggleRegisterPage(null)}
                    />
                ) : (
                    <>
                        <div className="d-flex flex-wrap align-items-center mb-4 gap-3">
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    flex: 1,
                                    minWidth: "250px",
                                    borderRadius: "20px",
                                    paddingLeft: "20px",
                                    height: "40px"
                                }}
                            />
                            <Select value={term} onChange={setTerm} style={{ width: 100, borderRadius: "20px" }}>
                                <Option value="All">All</Option>
                                <Option value="Spring">Spring</Option>
                                <Option value="Fall">Fall</Option>
                            </Select>
                            <Select value={year} onChange={setYear} style={{ width: 120 }}>
                                <Option value="All">All</Option>
                                {yearOptions.map((y) => <Option key={y} value={y}>{y}</Option>)}
                            </Select>
                            <Select value={sort} onChange={setSort} style={{ width: 120 }}>
                                <Option value="Latest">Latest</Option>
                                <Option value="Earliest">Earliest</Option>
                            </Select>
                            <Select value={filter} onChange={setFilter} style={{ width: 140 }}>
                                <Option value="All">--All--</Option>
                                <Option value="Colloquium">Colloquium</Option>
                                <Option value="NoColloquium">No Colloquium</Option>
                            </Select>
                            <Button type="primary" onClick={handleClickCreateEvent} style={{ borderRadius: "20px", background: "#5890F1" }}>
                                New Event
                            </Button>
                        </div>
                        <Spin spinning={loading} tip="Loading events..." size="large">
                            {presentEvents.map((event) => (
                                <EventCard 
                                    key={event.event_id} 
                                    event={event}
                                    curUser={curUser}
                                    onRegisterClick={() => toggleRegisterPage(event)}
                                    onManageClick={() => toggleManagePage(event)}
                                />
                            ))}
                        </Spin>
                    </>
                )}
            </div>
            
            {/* FAQ and Feedback Buttons */}
            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
                {/* FAQ Button */}
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<QuestionCircleOutlined />}
                        onClick={() => setShowFAQModal(true)}
                        style={{
                            width: '60px',
                            height: '60px',
                            background: '#52c41a',
                            borderColor: '#52c41a',
                            boxShadow: '0 4px 12px rgba(82, 196, 26, 0.4)',
                            fontSize: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                </div>

                {/* FAQ Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <QuestionCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                            <span>Frequently Asked Questions - Account Types & Authority System</span>
                        </div>
                    }
                    open={showFAQModal}
                    onCancel={() => setShowFAQModal(false)}
                    footer={[
                        <Button key="close" type="primary" onClick={() => setShowFAQModal(false)}>
                            Got it, thanks!
                        </Button>
                    ]}
                    width={700}
                >
                    <div style={{ padding: '10px 0' }}>
                        <Typography.Paragraph style={{ fontSize: '16px', marginBottom: '24px', color: '#555' }}>
                            Many users have questions about the different account types on this website. 
                            Here's a simple explanation of what each account type can do:
                        </Typography.Paragraph>

                        <Typography.Title level={4} style={{ color: '#5890F1', marginTop: '24px', marginBottom: '12px' }}>
                            🎓 Student Account
                        </Typography.Title>
                        <Typography.Paragraph style={{ marginBottom: '20px', lineHeight: '1.8' }}>
                            Students are for anyone who wants to receive notifications about upcoming events and sign up to attend them. 
                            This account type has no administrative authority—you can only view events, receive notifications, and register to attend. 
                            Your information is saved so you don't need to re-enter it every time you sign up for a new event.
                        </Typography.Paragraph>

                        <Typography.Title level={4} style={{ color: '#5890F1', marginTop: '24px', marginBottom: '12px' }}>
                            👤 User Account
                        </Typography.Title>
                        <Typography.Paragraph style={{ marginBottom: '20px', lineHeight: '1.8' }}>
                            Users are for ACM students who help organize events. With this account, you can create and manage events, 
                            view who has registered, and handle event-related tasks. However, you <strong>cannot</strong> create or delete other User or Admin accounts.
                            <br/><br/>
                            If you also want to receive notifications or sign up for events as an attendee, you'll need a separate Student account as well.
                        </Typography.Paragraph>

                        <Typography.Title level={4} style={{ color: '#5890F1', marginTop: '24px', marginBottom: '12px' }}>
                            🔑 Admin Account
                        </Typography.Title>
                        <Typography.Paragraph style={{ marginBottom: '20px', lineHeight: '1.8' }}>
                            Admins are for professors and high-level ACM officials who need full control over the platform. 
                            With this account, you can do everything a User can do (manage events) plus you can create and delete User and Admin accounts.
                            <br/><br/>
                            If you also want to receive notifications or sign up for events as an attendee, you'll need a separate Student account as well.
                        </Typography.Paragraph>

                        <div style={{ 
                            background: '#f0f9ff', 
                            borderLeft: '4px solid #5890F1', 
                            padding: '15px 20px', 
                            marginTop: '24px',
                            borderRadius: '4px'
                        }}>
                            <Typography.Text strong style={{ color: '#2c3e50' }}>
                                💡 Why separate Student accounts?
                            </Typography.Text>
                            <Typography.Paragraph style={{ marginBottom: 0, marginTop: '8px', lineHeight: '1.8' }}>
                                Student accounts are designed to be quick and convenient to create. If you have a User or Admin account 
                                and want to receive notifications or attend events, you can simply register as a Student using the same email address. 
                                This keeps the signup process simple for everyone!
                            </Typography.Paragraph>
                        </div>
                    </div>
                </Modal>

                {/* Feedback Chat Button and Form */}
                {showFeedbackForm && (
                    <div 
                        style={{
                            position: 'absolute',
                            bottom: '80px',
                            right: '0',
                            width: '320px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            padding: '20px',
                            marginBottom: '10px'
                        }}
                    >
                        <Form
                            form={feedbackForm}
                            onFinish={handleFeedbackSubmit}
                            layout="vertical"
                        >
                            <div style={{ marginBottom: '12px' }}>
                                <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                                    💬 Share your feedback so we can improve!
                                </Typography.Text>
                            </div>
                            
                            <Form.Item
                                label="Name (Optional)"
                                name="name"
                            >
                                <Input 
                                    placeholder="Your name" 
                                    size="middle"
                                />
                            </Form.Item>
                            
                            <Form.Item
                                label="Message"
                                name="message"
                                rules={[
                                    { required: true, message: 'Please enter your feedback message' },
                                    { min: 5, message: 'Message must be at least 5 characters' }
                                ]}
                            >
                                <Input.TextArea 
                                    placeholder="Tell us what you think..."
                                    rows={4}
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>
                            
                            <Form.Item style={{ marginBottom: 0 }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <Button 
                                        onClick={toggleFeedbackForm}
                                        size="middle"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit"
                                        loading={feedbackLoading}
                                        size="middle"
                                        style={{ background: '#5890F1', borderColor: '#5890F1' }}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    </div>
                )}
                
                {/* Feedback Button */}
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<MessageOutlined />}
                    onClick={toggleFeedbackForm}
                    style={{
                        width: '60px',
                        height: '60px',
                        background: '#5890F1',
                        borderColor: '#5890F1',
                        boxShadow: '0 4px 12px rgba(88, 144, 241, 0.4)',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                />
            </div>
        </div>
    );
}
