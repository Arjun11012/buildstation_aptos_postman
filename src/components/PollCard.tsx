import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Progress, Tag } from 'antd';
import { ClockCircleOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Poll } from '../services/votingService';

const { Title, Text } = Typography;

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: number, optionIndex: number) => void;
  voting: boolean;
  userAddress: string | null;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onVote, voting, userAddress }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Check if user has already voted in this poll
    if (userAddress) {
      // This would be implemented with the smart contract call
      // For now, we'll assume they haven't voted
      setHasVoted(false);
    }
  }, [userAddress, poll.id]);

  const getPollStatus = () => {
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

  const status = getPollStatus();
  const canVote = status.status === 'active' && !hasVoted && userAddress;

  return (
    <Card className="poll-card" style={{ height: '100%' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <Title level={4} style={{ margin: 0, flex: 1 }}>
            {poll.title}
          </Title>
          <Tag color={status.color}>{status.text}</Tag>
        </div>
        
        <Text style={{ color: 'rgba(0, 0, 0, 0.65)', display: 'block', marginBottom: '12px' }}>
          {poll.description}
        </Text>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Space>
            <ClockCircleOutlined />
            <Text type="secondary">{getTimeRemaining()}</Text>
          </Space>
          <Space>
            <UserOutlined />
            <Text type="secondary">{poll.total_votes} votes</Text>
          </Space>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        {poll.options.map((option, index) => {
          const voteCount = poll.votes[index] || 0;
          const percentage = poll.total_votes > 0 ? (voteCount / poll.total_votes) * 100 : 0;
          
          return (
            <div key={index} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Text>{option}</Text>
                <Text type="secondary">{voteCount} votes ({percentage.toFixed(1)}%)</Text>
              </div>
              <Progress 
                percent={percentage} 
                size="small" 
                strokeColor="#667eea"
                showInfo={false}
              />
            </div>
          );
        })}
      </div>

      {canVote && (
        <div style={{ marginBottom: '16px' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            Select your vote:
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
            {poll.options.map((option, index) => (
              <Button
                key={index}
                type={selectedOption === index ? 'primary' : 'default'}
                onClick={() => setSelectedOption(index)}
                style={{ textAlign: 'center' }}
                className="voting-option"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {canVote && selectedOption !== null && (
          <Button
            type="primary"
            onClick={() => onVote(poll.id, selectedOption)}
            loading={voting}
            disabled={voting}
            block
          >
            {voting ? 'Voting...' : 'Cast Vote'}
          </Button>
        )}
        
        {hasVoted && (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Voted
          </Tag>
        )}
        
        {status.status === 'closed' && (
          <Text type="secondary">Poll closed</Text>
        )}
      </div>

      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Created: {formatTime(poll.created_at)}
        </Text>
      </div>
    </Card>
  );
};

export default PollCard; 