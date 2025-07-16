import { useState } from "react";
import { Form, Input, Button, Card, Typography, Switch } from "antd";

const { Title } = Typography;

export default function CreateUserForm({ handleCreateUser, onCancel }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        // The values object now matches the required backend structure,
        // though the backend must handle hashing the 'password' field.
        await handleCreateUser(values);
        setLoading(false);
    };

    return (
        <Card style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Title level={4}>Create a New User Account</Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ isAdmin: false }} // This now correctly matches the Form.Item name
            >
                <Form.Item name="firstName" label="First Name">
                    <Input placeholder="e.g. Jane" />
                </Form.Item>
                
                <Form.Item name="lastName" label="Last Name">
                    <Input placeholder="e.g. Doe" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                        { required: true, message: "Please input an email!" },
                        { type: 'email', message: 'The input is not a valid email!' }
                    ]}
                >
                    <Input placeholder="e.g. jane.doe@example.com" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: "Please input a password!" }]}
                >
                    <Input.Password placeholder="Enter a strong password" />
                </Form.Item>
                
                <Form.Item
                    name="isAdmin" // Changed to match the database schema and initialValues
                    label="Make Administrator"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item>
                    <div className="d-flex gap-2">
                         <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            style={{ borderRadius: "20px" }}
                        >
                            Create User
                        </Button>
                        <Button 
                            onClick={onCancel}
                            style={{ borderRadius: "20px" }}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Card>
    );
}
