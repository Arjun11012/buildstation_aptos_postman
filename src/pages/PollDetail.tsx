import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Progress, Tag, Spin, message, Row, Col, Statistic } from 'antd';
import { ClockCircleOutlined, UserOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useWallet } from '../contexts/WalletContext';
import { Poll, getPollById, castVote } from '../services/votingService';

const { Title, Text } = Typography;

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (id) {
      loadPoll(parseInt(id));
    }
  }, [id]);

  const loadPoll = async (pollId: number) => {
    try {
      setLoading(true);
      const pollData = await getPollById(pollId);
      setPoll(pollData);
      
      // Check if user has voted (this would be implemented with smart contract call)
      if (address) {
        setHasVoted(false); // Placeholder
      }
    } catch (error) {
      console.error('Failed to load poll:', error);
      message.error('Failed to load poll');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!isConnected || !poll || selectedOption === null) {
      message.warning('Please connect your wallet and select an option');
      return;
    }

    try {
      setVoting(true);
      await castVote(poll.id, selectedOption);
      message.success('Vote cast successfully!');
      setHasVoted(true);
      await loadPoll(poll.id); // Refresh poll data
    } catch (error) {
      console.error('Failed to cast vote:', error);
      message.error('Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const getPollStatus = () => {
    if (!poll) return { status: 'unknown', color: 'default', text: 'Unknown' };
    
    const now = Math.floor(Date.now() / 1000);
    if (!poll.is_active) {
      return { status: 'closed', color: 'red', text: 'Closed' };
    }
    if (now > poll.end_time) {
      return { status: 'expired', color: 'orange', text: 'Expired' };
    }
    return { status: 'active', color: 'green', text: 'Active' };
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getTimeRemaining = () => {
    if (!poll) return 'Unknown';
    
    const now = Math.floor(Date.now() / 1000);
    const remaining = poll.end_time - now;
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const prepareChartData = () => {
    if (!poll) return [];
    
    return poll.options.map((option, index) => ({
      name: option,
      value: poll.votes[index] || 0,
      percentage: poll.total_votes > 0 ? ((poll.votes[index] || 0) / poll.total_votes) * 100 : 0,
    }));
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px', color: 'white' }}>Loading poll...</div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text style={{ color: 'white' }}>Poll not found</Text>
          <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const status = getPollStatus();
  const canVote = status.status === 'active' && !hasVoted && isConnected;
  const chartData = prepareChartData();

  return (
    <div className="page-container">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px' }}
      >
        Back to Polls
      </Button>

      <Title className="page-title">{poll.title}</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <Tag color={status.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {status.text}
                </Tag>
                <Space>
                  <ClockCircleOutlined />
                  <Text type="secondary">{getTimeRemaining()}</Text>
                </Space>
              </div>
              
              <Text style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {poll.description}
              </Text>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Title level={4}>Voting Options</Title>
              {poll.options.map((option, index) => {
                const voteCount = poll.votes[index] || 0;
                const percentage = poll.total_votes > 0 ? (voteCount / poll.total_votes) * 100 : 0;
                
                return (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '16px' }}>{option}</Text>
                      <Text type="secondary">{voteCount} votes ({percentage.toFixed(1)}%)</Text>
                    </div>
                    <Progress 
                      percent={percentage} 
                      strokeColor={COLORS[index % COLORS.length]}
                      showInfo={false}
                      size="large"
                    />
                  </div>
                );
              })}
            </div>

            {canVote && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={4}>Cast Your Vote</Title>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  {poll.options.map((option, index) => (
                    <Button
                      key={index}
                      type={selectedOption === index ? 'primary' : 'default'}
                      onClick={() => setSelectedOption(index)}
                      style={{ textAlign: 'center', height: '50px' }}
                      className="voting-option"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                
                {selectedOption !== null && (
                  <Button
                    type="primary"
                    onClick={handleVote}
                    loading={voting}
                    disabled={voting}
                    size="large"
                    block
                    icon={<CheckCircleOutlined />}
                  >
                    {voting ? 'Voting...' : 'Cast Vote'}
                  </Button>
                )}
              </div>
            )}

            {hasVoted && (
              <div style={{ textAlign: 'center', padding: '20px', background: '#f6ffed', borderRadius: '8px' }}>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                <Text strong style={{ display: 'block' }}>You have voted in this poll</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card>
            <Title level={4}>Poll Statistics</Title>
            
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Statistic
                  title="Total Votes"
                  value={poll.total_votes}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Options"
                  value={poll.options.length}
                />
              </Col>
            </Row>

            <div style={{ marginBottom: '24px' }}>
              <Title level={5}>Vote Distribution</Title>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Title level={5}>Vote Counts</Title>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <Text type="secondary">
                <strong>Created:</strong> {formatTime(poll.created_at)}
              </Text>
              <br />
              <Text type="secondary">
                <strong>Ends:</strong> {formatTime(poll.end_time)}
              </Text>
              <br />
              <Text type="secondary">
                <strong>Creator:</strong> {poll.creator.slice(0, 6)}...{poll.creator.slice(-4)}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PollDetail; 