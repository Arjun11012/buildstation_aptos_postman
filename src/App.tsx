import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import { WalletProvider } from './contexts/WalletContext';
import Header from './components/Header';
import Home from './pages/Home';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';
import './App.css';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
          borderRadius: 8,
        },
      }}
    >
      <WalletProvider>
        <Router>
          <Layout className="app-layout">
            <Header />
            <Content className="app-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreatePoll />} />
                <Route path="/poll/:id" element={<PollDetail />} />
              </Routes>
            </Content>
          </Layout>
        </Router>
      </WalletProvider>
    </ConfigProvider>
  );
};

export default App; 