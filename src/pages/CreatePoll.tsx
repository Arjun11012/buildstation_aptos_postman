import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, message, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { createPoll } from '../services/votingService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface PollFormData {
  title: string;
  description: string;
  options: string[];
  duration: number;
}

const CreatePoll: React.FC = () => {
  const { isConnected, address } = useWallet();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (values: PollFormData) => {
    if (!isConnected) {
      message.warning('Please connect your wallet first');
      return;
    }

    // Validate options
    const validOptions = options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      message.error('Please provide at least 2 options');
      return;
    }

    try {
      setLoading(true);
      
      const pollData = {
        title: values.title,
        description: values.description,
        options: validOptions,
        duration_seconds: values.duration * 3600, // Convert hours to seconds
      };

      await createPoll(pollData);
      message.success('Poll created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to create poll:', error);
      message.error('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="page-container">
        <Title className="page-title">Create New Poll</Title>
        <div className="wallet-connect">
          <Title level={4} style={{ color: 'white', textAlign: 'center' }}>
            Connect Your Wallet to Create Polls
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', display: 'block' }}>
            You need to connect your Aptos wallet to create and manage polls
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Title className="page-title">Create New Poll</Title>
      <Text className="page-subtitle">
        Create a new decentralized poll on the Aptos blockchain
      </Text>

      <div className="form-container">
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              duration: 24, // Default 24 hours
            }}
          >
            <Form.Item
              name="title"
              label="Poll Title"
              rules={[
                { required: true, message: 'Please enter a poll title' },
                { min: 3, message: 'Title must be at least 3 characters' },
                { max: 100, message: 'Title must be less than 100 characters' }
              ]}
            >
              <Input 
                placeholder="Enter poll title" 
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter a description' },
                { min: 10, message: 'Description must be at least 10 characters' },
                { max: 500, message: 'Description must be less than 500 characters' }
              ]}
            >
              <TextArea
                placeholder="Describe what this poll is about..."
                rows={4}
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration (hours)"
              rules={[
                { required: true, message: 'Please enter duration' },
                { type: 'number', min: 1, message: 'Duration must be at least 1 hour' },
                { type: 'number', max: 720, message: 'Duration must be less than 30 days' }
              ]}
            >
              <Input
                type="number"
                placeholder="24"
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>

            <Divider>Poll Options</Divider>

            <div style={{ marginBottom: '24px' }}>
              <Text strong style={{ display: 'block', marginBottom: '16px' }}>
                Add at least 2 options for voters to choose from:
              </Text>
              
              {options.map((option, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    style={{ flex: 1, borderRadius: '8px' }}
                  />
                  {options.length > 2 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeOption(index)}
                      style={{ minWidth: '40px' }}
                    />
                  )}
                </div>
              ))}
              
              <Button
                type="dashed"
                onClick={addOption}
                icon={<PlusOutlined />}
                style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }}
              >
                Add Option
              </Button>
            </div>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                  style={{ minWidth: '150px' }}
                >
                  {loading ? 'Creating...' : 'Create Poll'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreatePoll; 
 