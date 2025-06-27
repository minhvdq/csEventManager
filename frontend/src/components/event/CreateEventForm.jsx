import { Select, Switch, Button, Form, Input, message } from 'antd';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AutoCompleteGGMap from './AutoCompleteGGMap';
import location from '../../services/location';
import axios from 'axios';
import { backendBase } from '../../utils/homeUrl';

const { Option } = Select;

export default function CreateEventForm() {
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

  useEffect(() => {
    location.getAll().then(setDbLocations);
  }, []);

  const formatDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

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

  const handleSubmit = async (values) => {
    const formData = new FormData();
  
    formData.append("name", name);
    formData.append("description", description);
    formData.append("locationId", locationId);
    formData.append("locationName", locationName);
    formData.append("address", address);
    formData.append("lat", lat);
    formData.append("lng", lng);
    formData.append("room", room);
    formData.append("startTime", formatDateTime(startTime));
    formData.append("endTime", formatDateTime(endTime));
    formData.append("need_resume", values.needResume);
    formData.append("need_major", values.needMajor);
    formData.append("on_campus", values.onCampus);
    formData.append("is_colloquium", values.isColloquium);
    formData.append("created_by", "admin123"); // Replace with actual user ID
    formData.append("capacity", isLimited ? capacity : "");
    if (poster) {
        formData.append("poster", poster); // name must match multer's field name
    }
  
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (key === "poster") {
        console.log(`${key}:`, value.name, value.type, value.size + " bytes");
      } else {
        console.log(`${key}:`, value);
      }
    }

    try {
        const response = await axios.post(`${backendBase}/api/events`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
        message.success("Event submitted successfully!");
        console.log("Response:", response.data);
    } catch (error) {
        message.error("Failed to submit event.");
        console.error("Error uploading event:", error);
    }
  };

  return (
    <>
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

            <Form.Item label="Event Description" required>
            <Input.TextArea
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                rows={3}
                required
            />
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
            />
            </div>

            <div className="mb-3">
            <label className="form-label fw-bold">End Time</label>
            <DatePicker
                selected={endTime}
                onChange={(date) => setEndTime(date)}
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
                    {loc.name}
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
                onClick={() => {
                // TODO: Add cancel logic here
                console.log("Cancel clicked");
                }}
            >
                Cancel
            </Button>
        </div>
    </>
  );
}
