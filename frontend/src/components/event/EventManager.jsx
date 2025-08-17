import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Tabs, Form, message, Descriptions, Space, Divider, Table, Upload, Image, List, Input, Tooltip } from 'antd';
import { DownloadOutlined, UploadOutlined, DeleteOutlined, PlusOutlined, FileOutlined } from '@ant-design/icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import eventService from '../../services/event';
import eventRegisterService from '../../services/eventRegister';
import photoService from '../../services/photo';
import resourceService from '../../services/resource';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Helper function to parse MySQL DATETIME string as a local Date object
const parseMySqlDateTimeAsLocal = (dateTimeString) => {
    if (!dateTimeString) return null;
    const localDateTimeString = dateTimeString.slice(0, 19).replace('T', ' ');
    return new Date(localDateTimeString);
};

export default function EventManager({ event, setEvents, togglePage, curUser, handleDeleteEventLocal }) {
    // State for general loading, attendees loading, and upload loading
    const [loading, setLoading] = useState(false);
    const [attendeesLoading, setAttendeesLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [resourceLoading, setResourceLoading] = useState(false);

    // State for event data
    const [deadline, setDeadline] = useState(parseMySqlDateTimeAsLocal(event.deadline));
    const [attendees, setAttendees] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [resources, setResources] = useState([]);

    // State for photo upload
    const [fileList, setFileList] = useState([]);

    // Parse event times
    const eventStartTime = parseMySqlDateTimeAsLocal(event.start_time);
    const eventEndTime = parseMySqlDateTimeAsLocal(event.end_time);

    const [addResourceForm] = Form.useForm();

    // Effect to fetch initial data for the event
    useEffect(() => {
        // Fetch photos
        photoService.getForEvent(event.event_id)
            .then(initialPhotos => setPhotos(initialPhotos))
            .catch(error => {
                console.error("Failed to load photos:", error);
                message.error("Failed to load photos.");
            });

        // Fetch attendees
        setAttendeesLoading(true);
        eventRegisterService.setToken(curUser.token);
        eventRegisterService.getAttendeesForEvent(event.event_id)
            .then(students => {
                setAttendees(students);
            })
            .catch(() => message.error("Failed to load attendees"))
            .finally(() => setAttendeesLoading(false));

        // Fetch resources
        setResourceLoading(true);
        resourceService.setToken(curUser.token);
        resourceService.getForEvent(event.event_id)
            .then(initialResources => setResources(initialResources))
            .catch(error => {
                console.error("Failed to load resources:", error);
                message.error("Failed to load resources.");
            })
            .finally(() => setResourceLoading(false));

    }, [event.event_id, curUser.token]);

    const handleOnChangeDeadline = (date) => {
        if (date > eventStartTime) {
            message.error("Deadline cannot be after the event's start time.");
            return;
        }
        setDeadline(date);
    };

    const handleDeleteEvent = async () => {
        if (window.confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) {
            setLoading(true);
            try {
                handleDeleteEventLocal(event.event_id);
                eventService.setToken(curUser.token);
                await eventService.deleteEvent(event.event_id);
                message.success("Event deleted successfully");
                togglePage();
            } catch (error) {
                console.error("Error deleting event:", error);
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
                setEvents(prevEvents => prevEvents.map(e => e.event_id === event.event_id ? { ...e, deadline: deadline.toISOString() } : e));
                togglePage();
            } catch (error) {
                console.error("Error updating deadline:", error);
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

    const handleUploadPhotos = async () => {
        if (fileList.length === 0) {
            message.warning("Please select photos to upload.");
            return;
        }
        setUploading(true);
        const captions = fileList.map(file => file.name);
        const photoFiles = fileList.map(file => file.originFileObj);

        try {
            photoService.setToken(curUser.token)
            await photoService.uploadPhotos({
                eventId: event.event_id,
                photos: photoFiles,
                captions: captions
            });
            message.success(`${fileList.length} photos uploaded successfully!`);
            setFileList([]);
            setTimeout(async () => {
                setLoading(true);
                const updatedPhotos = await photoService.getForEvent(event.event_id);
                console.log("photos: " + updatedPhotos.length)
                setPhotos(updatedPhotos);
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error("Photo upload failed:", error);
            message.error("Photo upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePhoto = async (photo) => {
        if (window.confirm("Are you sure you want to delete this photo?")) {
            setLoading(true)
            try {
                photoService.setToken(curUser.token)
                await photoService.deletePhoto(photo.photo_id)
                const updatedPhotos = photos.filter(p => p.photo_id !== photo.photo_id)
                setPhotos(updatedPhotos)
                message.success("Photo deleted successfully.");
            } catch (error) {
                console.error("Photo deletion failed:", error);
                message.error("Photo deletion failed. Please try again.");
            } finally {
                setLoading(false)
            }
        }
    }

    const handlePhotoChange = ({ fileList: newFileList }) => {
        const limitedList = newFileList.slice(-5);
        setFileList(limitedList);
        if (newFileList.length > 5) {
            message.error('You can only upload a maximum of 5 photos at a time.');
        }
    };

    const uploadProps = {
        listType: "picture",
        fileList: fileList,
        onChange: handlePhotoChange,
        beforeUpload: () => false,
        multiple: true,
        accept: "image/*",
    };

    const handleAddResource = async (values) => {
        setResourceLoading(true);
        try {
            resourceService.setToken(curUser.token);
            const newResource = await resourceService.addResource({
                eventId: event.event_id,
                title: values.title,
                description: values.description,
                fileUrl: values.fileUrl,
            });
            console.log(JSON.stringify(newResource))
            setResources(prevResources => [...prevResources, {
                resource_id: newResource.insertId,
                title: values.title,
                description: values.description,
                file_url: values.fileUrl,
            }]);
            message.success("Resource added successfully!");
            addResourceForm.resetFields();
        } catch (error) {
            console.error("Failed to add resource:", error);
            message.error("Failed to add resource. Please check the URL and try again.");
        } finally {
            setResourceLoading(false);
        }
    };

    const handleDeleteResource = async (resourceId) => {
        if (window.confirm("Are you sure you want to delete this resource?")) {
            setResourceLoading(true);
            try {
                resourceService.setToken(curUser.token);
                await resourceService.deleteResource(resourceId);
                setResources(prevResources => prevResources.filter(r => r.resource_id !== resourceId));
                message.success("Resource deleted successfully.");
            } catch (error) {
                console.error("Failed to delete resource:", error);
                message.error("Failed to delete resource. Please try again.");
            } finally {
                setResourceLoading(false);
            }
        }
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
                if (!resumeBuffer || !resumeBuffer.data) return 'N/A';
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <Title level={4} style={{ marginBottom: 0 }}>Manage Event: {event.name}</Title>
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
                    <Form onFinish={handleSetDeadline} style={{ marginTop: '1rem' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #ff4d4f', borderRadius: '8px' }}>
                        <Text>Permanently delete this event and all its data.</Text>
                        <Button type="primary" danger onClick={handleDeleteEvent} loading={loading}>Delete Event</Button>
                    </div>
                </TabPane>
                <TabPane tab={`Registered Attendees (${attendees.length})`} key="2">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
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
                <TabPane tab={`Resources (${photos.length + resources.length})`} key="3">
                    <Tabs defaultActiveKey="photos" size="small">
                        <TabPane tab={`Photos (${photos.length})`} key="photos">
                            <Title level={5}>Upload New Photos</Title>
                            <Text type="secondary">You can upload up to 5 photos at a time. The filename will be used as the caption.</Text>
                            <div style={{ marginTop: '1rem' }}>
                                <Upload {...uploadProps}>
                                    <Button icon={<UploadOutlined />}>Select Files</Button>
                                </Upload>
                                <Button
                                    type="primary"
                                    onClick={handleUploadPhotos}
                                    disabled={fileList.length === 0}
                                    loading={uploading}
                                    style={{ marginTop: 16 }}
                                >
                                    {uploading ? 'Uploading...' : 'Start Upload'}
                                </Button>
                            </div>
                            <Divider />
                            <Title level={5}>Event Photo Gallery</Title>
                            <List
                                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 5 }}
                                dataSource={photos}
                                renderItem={item => (
                                    <List.Item>
                                        <Card
                                            hoverable
                                            cover={<Image alt={item.caption} src={item.photo_data} style={{ height: 150, objectFit: 'cover' }} />}
                                            actions={[
                                                <Tooltip title="Delete Photo"><DeleteOutlined key="delete" style={{ color: 'red' }} onClick={() => handleDeletePhoto(item)} /></Tooltip>
                                            ]}
                                        >
                                            <Card.Meta title={item.caption} />
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        </TabPane>
                        <TabPane tab={`Files (${resources.length})`} key="files">
                            <Title level={5}>Add New Resource</Title>
                            <Form
                                form={addResourceForm}
                                onFinish={handleAddResource}
                                layout="vertical"
                                style={{ marginTop: '1rem' }}
                            >
                                <Form.Item
                                    name="title"
                                    label="Title"
                                    rules={[{ required: true, message: 'Please enter a title' }]}
                                >
                                    <Input prefix={<FileOutlined />} placeholder="e.g., Presentation Slides" />
                                </Form.Item>
                                <Form.Item
                                    name="description"
                                    label="Description"
                                >
                                    <TextArea rows={2} placeholder="Optional description of the resource." />
                                </Form.Item>
                                <Form.Item
                                    name="fileUrl"
                                    label="Link (URL)"
                                    rules={[{ required: true, message: 'Please enter a valid URL', type: 'url' }]}
                                >
                                    <Input placeholder="e.g., https://example.com/slides.pdf" />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={resourceLoading} icon={<PlusOutlined />}>
                                        Add Resource
                                    </Button>
                                </Form.Item>
                            </Form>
                            <Divider />
                            <Title level={5}>Event Resources</Title>
                            <List
                                loading={resourceLoading}
                                dataSource={resources}
                                renderItem={item => (
                                    <List.Item
                                        actions={[
                                            <Tooltip title="Delete Resource">
                                                <DeleteOutlined
                                                    style={{ color: 'red', cursor: 'pointer' }}
                                                    onClick={() => handleDeleteResource(item.resource_id)}
                                                />
                                            </Tooltip>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={<a href={item.file_url} target="_blank" rel="noopener noreferrer">{item.title}</a>}
                                            description={item.description}
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>
                    </Tabs>
                </TabPane>
            </Tabs>
        </Card>
    );
}