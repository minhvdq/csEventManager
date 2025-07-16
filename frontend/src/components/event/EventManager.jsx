import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Tabs, Form, message, Descriptions, Space, Divider, Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import eventService from '../../services/event';
import eventRegisterService from '../../services/eventRegister';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const parseMySqlDateTimeAsLocal = (dateTimeString) => {
    if (!dateTimeString) return null;
    const localDateTimeString = dateTimeString.slice(0, 19).replace('T', ' ');
    return new Date(localDateTimeString);
};

export default function EventManager({ event, togglePage, curUser, handleDeleteEventLocal }) {
    const [loading, setLoading] = useState(false);
    const [attendeesLoading, setAttendeesLoading] = useState(false);
    const [deadline, setDeadline] = useState(parseMySqlDateTimeAsLocal(event.deadline));
    const [attendees, setAttendees] = useState([]);

    const eventStartTime = parseMySqlDateTimeAsLocal(event.start_time);
    const eventEndTime = parseMySqlDateTimeAsLocal(event.end_time);

    useEffect(() => {
        setAttendeesLoading(true);
        eventRegisterService.setToken(curUser.token);
        eventRegisterService.getAttendeesForEvent(event.event_id)
            .then(students => {
                setAttendees(students);
            })
            .catch(() => message.error("Failed to load attendees"))
            .finally(() => setAttendeesLoading(false));
    }, [event.event_id, curUser.token]);

    const handleOnChangeDeadline = (date) => {
        if (date > eventStartTime) {
            message.error("Deadline cannot be after the event's start time.");
            return;
        }
        setDeadline(date);
    };

    const handleDeleteEvent = async () => {
        if (window.confirm("Are you sure you want to permanently delete this event?")) {
            setLoading(true);
            try {
                handleDeleteEventLocal(event.event_id);
                eventService.setToken(curUser.token);
                await eventService.deleteEvent(event.event_id);
                message.success("Event deleted successfully");
                togglePage();
            } catch (error) { 
                console.error(error);
                message.error("Failed to delete event.");
            } finally { 
                setLoading(false);
            }
        }
    };
    
    const handleSetDeadline = async () => {
        if (window.confirm("Are you sure you want to update the deadline?")) {
            setLoading(true);
            try {
                eventService.setToken(curUser.token);
                await eventService.updateEvent(event.event_id, { deadline });
                message.success("Deadline updated successfully");
                togglePage();
            } catch (error) { 
                console.error(error);
                message.error("Failed to update deadline");
            } finally { 
                setLoading(false);
            }
        }
    };

    const handleDownloadCSV = () => {
        const headers = ['FirstName', 'LastName', 'SchoolEmail', 'SchoolID'];
        if (event.need_major) headers.push('TakenCS216');
        if (event.need_resume) headers.push('ResumeTitle');
        headers.push('RegistrationTime');

        const csvRows = [
            headers.join(','),
            ...attendees.map(att => {
                const row = [
                    att.first_name,
                    att.last_name,
                    att.school_email,
                    att.school_id,
                ];
                if (event.need_major) row.push(att.taken_216 ? 'Yes' : 'No');
                if (event.need_resume) row.push(att.resume_title || 'N/A');
                row.push(new Date(att.registered_at).toLocaleString());
                return row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(',');
            })
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event.name.replace(/\s/g, '_')}_attendees.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const attendeeColumns = [
        { title: 'First Name', dataIndex: 'first_name', key: 'first_name', sorter: (a, b) => a.first_name.localeCompare(b.first_name) },
        { title: 'Last Name', dataIndex: 'last_name', key: 'last_name', sorter: (a, b) => a.last_name.localeCompare(b.last_name) },
        { title: 'Email', dataIndex: 'school_email', key: 'email' },
        { title: 'School ID', dataIndex: 'school_id', key: 'school_id' },
    ];

    if (event.need_major) {
        attendeeColumns.push({
            title: 'Taken CS216',
            dataIndex: 'taken_216',
            key: 'taken_216',
            render: (taken) => (taken ? 'Yes' : 'No'),
        });
    }

    if (event.need_resume) {
        attendeeColumns.push({
            title: 'Resume',
            dataIndex: 'resume',
            key: 'resume',
            render: (resumeBuffer, record) => {
                if (!resumeBuffer || !resumeBuffer.data) {
                    return 'N/A';
                }
                try {
                    const blob = new Blob([new Uint8Array(resumeBuffer.data)], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    return <a href={url} download={record.resume_title || 'resume.pdf'}>Download PDF</a>;
                } catch (e) {
                    console.error('Error creating PDF blob:', e);
                    return 'Invalid Data';
                }
            },
        });
    }

    attendeeColumns.push({
        title: 'Registered On',
        dataIndex: 'registered_at',
        key: 'registered_at',
        render: (date) => new Date(date).toLocaleString(),
        sorter: (a, b) => new Date(a.registered_at) - new Date(b.registered_at),
    });

    return (
        <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Title level={4} className="mb-0">Manage Event: {event.name}</Title>
                <Button onClick={togglePage}>Back to Events</Button>
            </div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Settings" key="1">
                    <Title level={5}>Event Details</Title>
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Starts">{eventStartTime?.toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Ends">{eventEndTime?.toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Registration Deadline">{deadline?.toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Location">{event.location?.place_name || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                    <Divider />
                    <Title level={5}>Update Deadline</Title>
                    <Form onFinish={handleSetDeadline} className="mt-3">
                        <Space align="start">
                            <Form.Item label="New Deadline" rules={[{ required: true, message: 'Please select a deadline' }]}>
                                <DatePicker
                                    selected={deadline}
                                    onChange={handleOnChangeDeadline}
                                    showTimeSelect
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    className="form-control"
                                />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>Update Deadline</Button>
                        </Space>
                    </Form>
                    <Divider />
                    <Title level={5} style={{ color: '#f5222d' }}>Danger Zone</Title>
                    <div className="d-flex justify-content-between align-items-center p-3 border border-danger rounded">
                        <Text>Permanently delete this event and all its data.</Text>
                        <Button type="primary" danger onClick={handleDeleteEvent} loading={loading}>Delete Event</Button>
                    </div>
                </TabPane>
                <TabPane tab={`Registered Attendees (${attendees.length})`} key="2">
                    <div className="d-flex justify-content-end mb-3">
                        <Button icon={<DownloadOutlined />} onClick={handleDownloadCSV} disabled={attendees.length === 0}>
                            Download as CSV
                        </Button>
                    </div>
                    <Table
                        columns={attendeeColumns}
                        dataSource={attendees}
                        loading={attendeesLoading}
                        rowKey="id"
                        scroll={{ x: true }}
                    />
                </TabPane>
            </Tabs>
        </Card>
    );
}
