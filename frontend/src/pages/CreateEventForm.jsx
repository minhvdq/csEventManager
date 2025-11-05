import { Select, Switch, Button, Form, Input, Spin, message} from 'antd';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AutoCompleteGGMap from '../components/event/AutoCompleteGGMap';
import location from '../services/location';
import eventService from '../services/event'
import { frontendBase } from '../utils/homeUrl';

const { Option } = Select; 

export default function CreateEventForm({curUser}) {
    const [form] = Form.useForm();
    // State for components not managed by Antd Form (like DatePicker)
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [deadline, setDeadline] = useState(new Date());
    
    // State for UI control and external data
    const [locationId, setLocationId] = useState(null);
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [preview, setPreview] = useState(null);
    const [poster, setPoster] = useState(null);
    const [isLimited, setIsLimited] = useState(false);
    const [dbLocations, setDbLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (!curUser && !window.localStorage.getItem("localUser")) {
            window.location.href = `${frontendBase}/authen`;
        }
        location.getAll().then(locations => {
            setDbLocations(locations);
            setLoading(false);
        });
    }, [curUser]);

    useEffect(() => {
        // When startTime changes, adjust endTime and deadline if they are invalid
        if(deadline > startTime){
            setDeadline(startTime);
        }
        if(endTime < startTime){
            setEndTime(startTime);
        }
    }, [startTime, endTime, deadline]);

    const handlePosterChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setPoster(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            message.error('Please select a valid image file.');
            setPoster(null);
            setPreview(null);
        }
    };

    const handleOnChangeEndTime = (date) => {
        if(date < startTime){
            message.error("End time cannot be before the start time.");
            return;
        }
        setEndTime(date);
    }

    const handleOnChangeDeadline = (date) => {
        if(date > startTime){
            message.error("Deadline cannot be after the start time.");
            return;
        }
        setDeadline(date);
    }

    const handleSubmit = async (values) => {
        // All form values are now in the 'values' object from Antd's onFinish
        const body = {
            ...values, // Includes name, description, locationName, room, etc.
            locationId,
            address,
            lat,
            lng,
            startTime,
            endTime,
            deadline,
            isLimited,
            poster,
        };
      
        try {
            setLoading(true);
            eventService.setToken(curUser.token);
            await eventService.createEvent(body);
            message.success("Event submitted successfully!");
            window.location.href = frontendBase;
        } catch (error) {
            message.error("Failed to submit event.");
            console.error("Error uploading event:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Spin spinning={loading} tip="Loading..." size="large">
                <div
                className="container mt-4 p-4 bg-white border rounded shadow"
                style={{
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
                >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleSubmit}
                    initialValues={{
                    needResume: false,
                    needMajor: false,
                    onCampus: true,
                    isColloquium: false,
                    room: ''
                    }}
                >
                    <Form.Item label="Event Name" name="name" rules={[{ required: true, message: 'Please enter the event name.' }]}>
                        <Input maxLength={100} className="form-control" />
                    </Form.Item>

                    <Form.Item label="Event Description" name="description">
                        <Input.TextArea maxLength={1000} className="form-control" rows={3} />
                    </Form.Item>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Start Time</label>
                        <DatePicker
                            selected={startTime}
                            onChange={(date) => setStartTime(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">End Time</label>
                        <DatePicker
                            selected={endTime}
                            onChange={handleOnChangeEndTime}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="form-control"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Registration Deadline</label>
                        <DatePicker
                            selected={deadline}
                            onChange={handleOnChangeDeadline}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="form-control"
                        />
                    </div>

                    <Form.Item label="Upload Poster">
                        <input type="file" accept="image/*" onChange={handlePosterChange} className="form-control" />
                        {preview && (
                            <div className="mt-3">
                            <img src={preview} alt="Preview" className="img-thumbnail" style={{ maxWidth: '200px' }} />
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item label="Select Location" required>
                        <Select
                            placeholder="Select a location or choose 'Other'"
                            onChange={(value) => {
                                setLocationId(value === 'other' ? null : value);
                                if (value !== 'other') {
                                    form.setFieldsValue({ locationName: '' });
                                }
                            }}
                            value={locationId || 'other'}
                            allowClear
                        >
                            {dbLocations.map(loc => (
                            <Option key={loc.location_id} value={loc.location_id}>
                                {loc.place_name}
                            </Option>
                            ))}
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>

                    {!locationId && (
                    <>
                        <Form.Item
                            label="New Location Name"
                            name="locationName"
                            rules={[
                                { required: true, message: 'Please enter a location name.' },
                                {
                                    validator: (_, value) => {
                                        const isDuplicate = dbLocations.some(loc => loc.place_name.toLowerCase() === (value || '').toLowerCase());
                                        if (isDuplicate) {
                                            return Promise.reject(new Error('This location already exists. Please select it from the list.'));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input className="form-control" />
                        </Form.Item>

                        <Form.Item label="Address">
                            <AutoCompleteGGMap
                                address={address}
                                setAddress={setAddress}
                                lat={lat}
                                setLat={setLat}
                                lng={lng}
                                setLng={setLng}
                            />
                        </Form.Item>

                        <Form.Item label="Room (Optional)" name="room">
                            <Input className="form-control" />
                        </Form.Item>
                    </>
                    )}

                    <Form.Item label="Limit Capacity?">
                        <Switch checked={isLimited} onChange={setIsLimited} />
                        {isLimited && (
                            <Form.Item name="capacity" noStyle rules={[{ required: true, message: 'Please enter a capacity.'}]}>
                                <Input type="number" className="form-control mt-2" placeholder="Enter capacity" />
                            </Form.Item>
                        )}
                    </Form.Item>

                    <Form.Item name="onCampus" label="Is this event on-campus?" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="isColloquium" label="Does it count as colloquium?" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="needMajor" label="Do students need to be CS majors?" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="needResume" label="Require resume submission?" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="sendNoti" label="Send notification to all students?" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="mt-3">
                            Create Event
                        </Button>
                    </Form.Item>
                </Form>
                </div>
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        background: '#fff',
                        borderTop: '1px solid #ccc',
                        padding: '10px 20px',
                        textAlign: 'right',
                        zIndex: 1000,
                    }}
                >
                    <Button
                        type="primary"
                        danger
                        onClick={() => window.location.href = frontendBase}
                    >
                        Cancel
                    </Button>
                </div>
            </Spin>
        </>
    );
}
