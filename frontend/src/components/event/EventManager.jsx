import React, { useState, useEffect } from 'react';
// Changed: Added Tooltip for better UX, but not strictly required by the prompt.
import { Card, Button, Typography, Tabs, Form, message, Descriptions, Space, Divider, Table, Upload, Image, List } from 'antd';
// Changed: Imported DeleteOutlined icon
import { DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import eventService from '../../services/event';
import eventRegisterService from '../../services/eventRegister';
import photoService from '../../services/photo';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Helper function to parse MySQL DATETIME string as a local Date object
const parseMySqlDateTimeAsLocal = (dateTimeString) => {
    if (!dateTimeString) return null;
    // Strips 'T' and 'Z' and treats the string as local time
    const localDateTimeString = dateTimeString.slice(0, 19).replace('T', ' ');
    return new Date(localDateTimeString);
};

export default function EventManager({ event, togglePage, curUser, handleDeleteEventLocal }) {
    // State for general loading, attendees loading, and upload loading
    const [loading, setLoading] = useState(false);
    const [attendeesLoading, setAttendeesLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // State for event data
    const [deadline, setDeadline] = useState(parseMySqlDateTimeAsLocal(event.deadline));
    const [attendees, setAttendees] = useState([]);
    const [photos, setPhotos] = useState([]);
    
    // State for photo upload
    const [fileList, setFileList] = useState([]);

    // Parse event times
    const eventStartTime = parseMySqlDateTimeAsLocal(event.start_time);
    const eventEndTime = parseMySqlDateTimeAsLocal(event.end_time);

    useEffect(() => {
        console.log(JSON.stringify(photos))
    }, [photos ])

    // Effect to fetch initial photos and attendees for the event
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
    }, [event.event_id, curUser.token]);

    // Handler for changing the deadline date picker
    const handleOnChangeDeadline = (date) => {
        if (date > eventStartTime) {
            message.error("Deadline cannot be after the event's start time.");
            return;
        }
        setDeadline(date);
    };

    // Handler to permanently delete the event
    const handleDeleteEvent = async () => {
        if (window.confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) {
            setLoading(true);
            try {
                handleDeleteEventLocal(event.event_id);
                eventService.setToken(curUser.token);
                await eventService.deleteEvent(event.event_id);
                message.success("Event deleted successfully");
                togglePage(); // Navigate back
            } catch (error) { 
                console.error("Error deleting event:", error);
                message.error("Failed to delete event.");
            } finally { 
                setLoading(false);
            }
        }
    };
    
    // Handler to update the registration deadline
    const handleSetDeadline = async () => {
        if (window.confirm("Are you sure you want to update the deadline?")) {
            setLoading(true);
            try {
                eventService.setToken(curUser.token);
                await eventService.updateEvent(event.event_id, { deadline });
                message.success("Deadline updated successfully");
                togglePage(); // Refresh or navigate back
            } catch (error) { 
                console.error("Error updating deadline:", error);
                message.error("Failed to update deadline");
            } finally { 
                setLoading(false);
            }
        }
    };

    // Handler to download attendee list as CSV
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

    // Handler for uploading selected photos
    const handleUploadPhotos = async () => {
        if (fileList.length === 0) {
            message.warning("Please select photos to upload.");
            return;
        }
        setUploading(true);
        // Extract file data and captions from the fileList state
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
            setFileList([]); // Clear the file list
            // Refresh the photos list from the server
            const updatedPhotos = await photoService.getForEvent(event.event_id);
            setPhotos(updatedPhotos);
        } catch (error) {
            console.error("Photo upload failed:", error);
            message.error("Photo upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePhoto = async (photo) => {
        if(window.confirm("Are you sure you want to delete this photo?")){
            setLoading(true)
            try{
                photoService.setToken(curUser.token)
                await photoService.deletePhoto(photo.photo_id)
                const updatedPhotos = photos.filter(p => p.photo_id !== photo.photo_id)
                setPhotos(updatedPhotos)
                message.success("Photo deleted successfully.");
            }catch(error){
                console.error("Photo deletion failed:", error);
                message.error("Photo deletion failed. Please try again.");
            }finally{
                setLoading(false)
            }
        }
    }

    // Handler for when the file list changes in the Upload component
    const handlePhotoChange = ({ fileList: newFileList }) => {
        // Enforce the 5-file limit by slicing the array
        const limitedList = newFileList.slice(-5);
        setFileList(limitedList);

        if (newFileList.length > 5) {
            message.error('You can only upload a maximum of 5 photos at a time.');
        }
    };

    // Props for the Ant Design Upload component
    const uploadProps = {
        listType: "picture",
        fileList: fileList,
        onChange: handlePhotoChange,
        // beforeUpload is crucial to prevent the component from uploading the file automatically.
        // We want to handle the upload manually with our own service call.
        beforeUpload: () => false,
        multiple: true,
        accept: "image/*",
    };

    // Columns configuration for the attendees table
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
                <TabPane tab={`Photos (${photos.length})`} key="3">
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
                                {/* --- Start of Changes --- */}
                                <Card
                                    hoverable
                                    cover={<Image alt={item.caption} src={item.photo_data} style={{ height: 150, objectFit: 'cover' }} />}
                                    actions={[
                                        <DeleteOutlined key="delete" style={{ color: 'red' }} onClick={() => handleDeletePhoto(item)} />
                                    ]}
                                >
                                    <Card.Meta title={item.caption} />
                                </Card>
                                {/* --- End of Changes --- */}
                            </List.Item>
                        )}
                    />
                </TabPane>
            </Tabs>
        </Card>
    );
}