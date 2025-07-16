import { Card, Typography, Popconfirm } from "antd";
import { DeleteOutlined, UserOutlined, CheckCircleTwoTone, CloseCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export default function UserCard({ user, handleDeleteUser }) {
    
    const confirmDelete = () => {
        handleDeleteUser(user.user_id, user.email);
    };

    // Combine first and last name, handling cases where they might be null
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No Name Provided';

    return (
        <Card
            style={{ width: 300, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            actions={[
                <Popconfirm
                    title="Delete the user"
                    description={`Are you sure you want to delete ${user.email}? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    okText="Yes, Delete"
                    cancelText="No"
                    placement="top"
                >
                    <DeleteOutlined key="delete" style={{color: 'red'}}/>
                </Popconfirm>,
            ]}
        >
            <Card.Meta
                avatar={<UserOutlined style={{fontSize: '24px', color: '#5890F1'}}/>}
                title={<Title level={5}>{fullName}</Title>}
                description={<Text type="secondary">{user.email}</Text>}
            />
            <div className="mt-2">
                <Text>ID: {user.user_id}</Text><br/>
                <Text>Admin: {user.is_admin 
                    ? <CheckCircleTwoTone twoToneColor="#52c41a" /> 
                    : <CloseCircleOutlined style={{color: '#eb2f96'}}/>}
                </Text>
            </div>
        </Card>
    );
}