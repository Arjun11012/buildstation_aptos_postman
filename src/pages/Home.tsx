import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Progress, Tag, Empty, Spin, message } from 'antd';
import { Link } from 'react-router-dom';
import { ClockCircleOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useWallet } from '../contexts/WalletContext';
import { Poll, getPolls, castVote } from '../services/votingService';
import PollCard from '../components/PollCard';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const pollsData = await getPolls();
      setPolls(pollsData);
    } catch (error) {
      console.error('Failed to load polls:', error);
      message.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: number, optionIndex: number) => {
    if (!isConnected) {
      message.warning('Please connect your wallet first');
      return;
    }

    try {
      setVoting(pollId);
      await castVote(pollId, optionIndex);
      message.success('Vote cast successfully!');
      await loadPolls(); // Refresh polls to show updated results
    } catch (error) {
      console.error('Failed to cast vote:', error);
      message.error('Failed to cast vote');
    } finally {
      setVoting(null);
    }
  };

  const getPollStatus = (poll: Poll) => {
    const now = Math.floor(Date.now() / 1000);
    if (!poll.is_active) {
      return { status: 'closed', color: 'red', text: 'Closed' };
    }
    if (now > poll.end_time) {
      return { status: 'expired', color: 'orange', text: 'Expired' };
    }
    return { status: 'active', color: 'green', text: 'Active' };
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px', color: 'white' }}>Loading polls...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Title className="page-title">🗳️ Decentralized Voting</Title>
      <Text className="page-subtitle">
        Create and participate in polls on the Aptos blockchain
      </Text>

      {!isConnected && (
        <div className="wallet-connect">
          <Title level={4} style={{ color: 'white', textAlign: 'center' }}>
            Connect Your Wallet to Start Voting
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', display: 'block' }}>
            Use your Aptos wallet to create polls and cast votes securely on-chain
          </Text>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          All Polls ({polls.length})
        </Title>
        <Link to="/create">
          <Button type="primary" size="large">
            Create New Poll
          </Button>
        </Link>
      </div>

      {polls.length === 0 ? (
        <Empty
          description="No polls available"
          style={{ color: 'white' }}
        >
          <Link to="/create">
            <Button type="primary">Create the first poll</Button>
          </Link>
        </Empty>
      ) : (
        <div className="poll-grid">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={handleVote}
              voting={voting === poll.id}
              userAddress={address}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 