import React from 'react';
import { Layout, Button, Space, Typography, Avatar } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { WalletOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useWallet } from '../contexts/WalletContext';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header: React.FC = () => {
  const { isConnected, address, connect, disconnect } = useWallet();
  const location = useLocation();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AntHeader style={{ 
      background: 'rgba(255, 255, 255, 0.1)', 
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          🗳️ Aptos Voting
        </Title>
      </Link>

      <Space size="large">
        <Space size="middle">
          <Link to="/">
            <Button 
              type={isActive('/') ? 'primary' : 'text'} 
              style={{ color: isActive('/') ? 'white' : 'rgba(255, 255, 255, 0.8)' }}
            >
              Home
            </Button>
          </Link>
          <Link to="/create">
            <Button 
              type={isActive('/create') ? 'primary' : 'text'} 
              style={{ color: isActive('/create') ? 'white' : 'rgba(255, 255, 255, 0.8)' }}
            >
              Create Poll
            </Button>
          </Link>
        </Space>

        <Space>
          {isConnected ? (
            <Space>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#667eea' }} />
              <Text style={{ color: 'white' }}>{formatAddress(address!)}</Text>
              <Button 
                icon={<LogoutOutlined />} 
                onClick={disconnect}
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                Disconnect
              </Button>
            </Space>
          ) : (
            <Button 
              type="primary" 
              icon={<WalletOutlined />} 
              onClick={connect}
              size="large"
            >
              Connect Wallet
            </Button>
          )}
        </Space>
      </Space>
    </AntHeader>
  );
};

export default Header; 