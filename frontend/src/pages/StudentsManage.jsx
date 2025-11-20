import { useState, useEffect } from 'react';
import { Table, Typography, message, Popconfirm, Button, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import studentService from '../services/student';
import NavBar from '../components/NavBar';
import { frontendBase } from '../utils/homeUrl';

const { Title, Text } = Typography;

export default function StudentsManage({ curUser, handleLogout }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (!curUser && !window.localStorage.getItem("localUser")) {
            window.location.href = `${frontendBase}/authen`;
        }

        const user = curUser ? curUser : JSON.parse(window.localStorage.getItem("localUser"))

        console.log(JSON.stringify(user))

        studentService.setToken(user.token);
        fetchStudents();
    }, [curUser]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const allStudents = await studentService.getAll();
            setStudents(allStudents || []);
        } catch (error) {
            console.error("Failed to fetch students:", error);
            message.error("Could not load student data.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (studentId, email) => {
        try {
            await studentService.deleteById(studentId);
            setStudents(students.filter(student => student.id !== studentId));
            message.success(`Student ${email || 'account'} has been deleted.`);
        } catch (error) {
            console.error("Failed to delete student:", error);
            message.error("Failed to delete the student. Please try again.");
        }
    };

    // Define columns for the Ant Design Table
    const columns = [
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
            title: 'School Email',
            dataIndex: 'school_email',
            key: 'school_email',
            sorter: (a, b) => (a.school_email || '').localeCompare(b.school_email || ''),
        },
        {
            title: 'School ID',
            dataIndex: 'school_id',
            key: 'school_id',
            sorter: (a, b) => (a.school_id || '').localeCompare(b.school_id || ''),
        },
        {
            title: 'Class Year',
            dataIndex: 'class_year',
            key: 'class_year',
            sorter: (a, b) => (a.class_year || 0) - (b.class_year || 0),
        },
        {
            title: 'Taken CS216',
            dataIndex: 'taken_216',
            key: 'taken_216',
            render: (taken) => taken ? 'Yes' : 'No',
            filters: [
                { text: 'Yes', value: true },
                { text: 'No', value: false },
            ],
            onFilter: (value, record) => record.taken_216 === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Popconfirm
                    title="Delete Student"
                    description={`Are you sure you want to delete ${record.first_name} ${record.last_name} (${record.school_email})? This action cannot be undone.`}
                    onConfirm={() => handleDeleteStudent(record.id, record.school_email)}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                    >
                        Delete
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="bg-light min-vh-100">
            <NavBar curUser={curUser} handleLogout={handleLogout} />
            <div className="container py-4">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Student Management</Title>
                        <Text>View and manage all registered students.</Text>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={students}
                        rowKey="id"
                        loading={loading}
                        pagination={{ 
                            pageSize: 10, 
                            showSizeChanger: true, 
                            showTotal: (total) => `Total ${total} students` 
                        }}
                        scroll={{ x: 'max-content' }}
                    />
                </Space>
            </div>
        </div>
    );
}
