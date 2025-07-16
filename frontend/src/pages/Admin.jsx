import { useEffect, useState } from "react";
import userService from "../services/user";
import NavBar from "../components/NavBar";
import CreateUserForm from "../components/admin/CreateUserForm";
import { Button, Table, Typography, message, Popconfirm, Tag, Space } from "antd";
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Admin({ curUser, handleLogout }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        if (!curUser || !curUser.isAdmin) {
            setLoading(false);
            return;
        }

        userService.setToken(curUser.token);
        userService.getAll()
            .then(initialUsers => {
                // console.log("initialUsers are " + JSON.stringify(initialUsers))
                setUsers(initialUsers.filter(u => u.user_id !== curUser.user_id));
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch users:", error);
                message.error("Could not load user data.");
                setLoading(false);
            });
    }, [curUser]);

    const handleDeleteUser = async (user_id, email) => {
        try {
            await userService.deleteUser(user_id);
            setUsers(users.filter(user => user.user_id !== user_id));
            message.success(`User ${email} has been deleted.`);
        } catch (error) {
            console.error("Failed to delete user:", error);
            message.error("Failed to delete the user. Please try again.");
        }
    };

    const handleCreateUser = async (newUserObject) => {
        try {
            const returnedUser = await userService.createUser(newUserObject);
            setUsers(users.concat(returnedUser));
            setShowCreateForm(false);
            message.success(`New user ${returnedUser.email} created successfully!`);
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to create user.";
            console.error("Failed to create user:", error);
            message.error(errorMsg);
        }
    };

    // Define columns for the Ant Design Table
    const columns = [
        {
            title: 'ID',
            dataIndex: 'user_id',
            key: 'user_id',
            sorter: (a, b) => a.user_id - b.user_id,
        },
        {
            title: 'First Name',
            dataIndex: 'first_name',
            key: 'first_name',
            sorter: (a, b) => (a.first_name || '').localeCompare(b.first_name || ''),
        },
        {
            title: 'Last Name',
            dataIndex: 'last_name',
            key: 'last_name',
            sorter: (a, b) => (a.last_name || '').localeCompare(b.last_name || ''),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Role',
            dataIndex: 'is_admin',
            key: 'is_admin',
            render: (isAdmin) => (
                <Tag color={isAdmin ? 'green' : 'blue'}>
                    {isAdmin ? 'ADMIN' : 'USER'}
                </Tag>
            ),
            filters: [
                { text: 'Admin', value: true },
                { text: 'User', value: false },
            ],
            onFilter: (value, record) => record.is_admin === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <Popconfirm
                    title="Delete the user"
                    description={`Are you sure you want to delete ${record.email}?`}
                    onConfirm={() => handleDeleteUser(record.user_id, record.email)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    if (!curUser || !curUser.isAdmin) {
        return (
            <>
                <NavBar curUser={curUser} handleLogout={handleLogout} />
                <div className="container py-4 text-center">
                    <Title level={2} type="danger">Access Denied</Title>
                    <Text>You must be an administrator to view this page.</Text>
                </div>
            </>
        );
    }

    return (
        <div className="bg-light min-vh-100">
            <NavBar curUser={curUser} handleLogout={handleLogout} />
            <div className="container py-4">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Title level={2} style={{ margin: 0 }}>User Management</Title>
                            <Text>Create, view, and manage user accounts.</Text>
                        </div>
                        <Button
                            type="primary"
                            style={{ borderRadius: "20px", background: "#5890F1" }}
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            {showCreateForm ? 'Cancel' : 'Create New User'}
                        </Button>
                    </div>

                    {showCreateForm && (
                        <CreateUserForm
                            handleCreateUser={handleCreateUser}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    )}

                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="user_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }} // for better responsiveness
                    />
                </Space>
            </div>
        </div>
    );
}