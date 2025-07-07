import { Select, Switch, Button, Form, Input, Spin, message} from 'antd';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AutoCompleteGGMap from '../components/event/AutoCompleteGGMap';
import location from '../services/location';
import axios from 'axios';
import eventService from '../services/event'
import { backendBase, frontendBase } from '../utils/homeUrl';

const { Option } = Select; 

export default function CreateEventForm({curUser}) {
    const [form] = Form.useForm();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [locationId, setLocationId] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [room, setRoom] = useState('');
    const [preview, setPreview] = useState(null);
    const [poster, setPoster] = useState(null);
    const [isLimited, setIsLimited] = useState(false);
    const [capacity, setCapacity] = useState(null);
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

    const handlePosterChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setPoster(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            const msg = 'Please select a valid image file.'
            message.error(msg);
            setPoster(null);
            setPreview(null);
        }
    };

    const handleOnChangeEndTime = (date) => {
        if(date < startTime){
            const msg = "End time is currently before startTime"
            message.error(msg)
            return
        }
        setEndTime(date)
    }



    const handleSubmit = async (values) => {
        const body = {
            name,
            description,
            locationId,
            locationName,
            address,
            lat,
            lng,
            room,
            startTime,
            endTime,
            needResume: values.needResume,
            needMajor: values.needMajor,
            onCampus: values.onCampus,
            isColloquium: values.isColloquium,
            isLimited,
            capacity,
            poster,
        };
      
        try {
            eventService.setToken(curUser.token)
            const result = await eventService.createEvent(body);
            message.success("Event submitted successfully!");
            console.log("Response:", result);
            window.location.href = frontendBase
        } catch (error) {
            message.error("Failed to submit event.");
            console.error("Error uploading event:", error);
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
                    isColloquium: false
                    }}
                >
                    <Form.Item label="Event Name" required>
                    <Input
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-control"
                        required
                    />
                    </Form.Item>

                    <Form.Item label="Event Description">
                    <Input.TextArea
                        maxLength={1000}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-control"
                        rows={3}
                    />
                    </Form.Item>

                    <div className="mb-3">
                    <label className="form-label fw-bold" required>Start Time</label>
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
                    <label className="form-label fw-bold" required>End Time</label>
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
                        placeholder="Other"
                        onChange={(value) => {
                        if (value === 'other') {
                            setLocationId(null);
                            return;
                        }
                        setLocationId(value);
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
                        <Form.Item label="New Location Name" required>
                        <Input
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            className="form-control"
                        />
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

                        <Form.Item label="Room (Optional)">
                        <Input
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            className="form-control"
                            maxLength={10}
                        />
                        </Form.Item>
                    </>
                    )}

                    <Form.Item label="Limit Capacity?">
                    <Switch checked={isLimited} onChange={(checked) => {
                        setIsLimited(checked);
                        if (!checked) setCapacity(null);
                    }} />
                    {isLimited && (
                        <Input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="form-control mt-2"
                        />
                    )}
                    </Form.Item>

                    <Form.Item name="onCampus" label="Is this event on-campus?" valuePropName="checked">
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>

                    <Form.Item name="isColloquium" label="Does it count as colloquium?" valuePropName="checked">
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>

                    <Form.Item name="needMajor" label="Do students need to be CS majors?" valuePropName="checked">
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>

                    <Form.Item name="needResume" label="Require resume submission?" valuePropName="checked">
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
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
                        onClick={(e) => {
                            e.preventDefault()
                            console.log("Cancel clicked");

                            window.location.href = frontendBase
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </Spin>
        </>
    );
}
