# 🗳️ Aptos Decentralized Voting App

A full-stack decentralized voting application built on the Aptos blockchain using Move language for smart contracts and React for the frontend.

## ✨ Features

- **Smart Contract (Move)**
  - Create polls with multiple options
  - Secure on-chain voting with wallet authentication
  - Prevent double voting
  - Real-time vote counting
  - Poll management (create, close)

- **Frontend (React + TypeScript)**
  - Beautiful, modern UI with Ant Design
  - Wallet connection (Petra/Martian ready)
  - Poll creation interface
  - Real-time voting dashboard
  - Interactive charts and statistics
  - Responsive design for all devices

## 🏗️ Architecture

```
├── sources/
│   └── voting.move          # Move smart contract
├── src/
│   ├── components/          # React components
│   ├── contexts/            # Wallet context
│   ├── pages/               # Page components
│   ├── services/            # Smart contract integration
│   └── App.tsx             # Main application
├── Move.toml               # Move package configuration
└── package.json            # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Aptos CLI (for smart contract deployment)
- Aptos wallet (Petra, Martian, etc.)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd postman_aptos
npm install
```

### 2. Deploy Smart Contract

```bash
# Build the Move contract
aptos move build

# Deploy to testnet
aptos move publish --named-addresses voting=0x<your-address>

# Or deploy to mainnet
aptos move publish --named-addresses voting=0x<your-address> --network mainnet
```

### 3. Update Contract Address

After deployment, update the contract address in:
- `src/services/votingService.ts` - Update `MODULE_ADDRESS`
- `Move.toml` - Update the addresses section

### 4. Start Frontend

```bash
npm start
```

The application will open at `http://localhost:3000`

## 🔧 Configuration

### Smart Contract Configuration

The Move contract is configured in `Move.toml`:

```toml
[addresses]
voting = "_"  # Will be set during deployment

[dev-addresses]
voting = "0x1"  # Development address
```

### Frontend Configuration

Update the following in `src/services/votingService.ts`:

```typescript
const MODULE_ADDRESS = '0x<your-deployed-contract-address>';
const APTOS_NODE_URL = 'https://fullnode.testnet.aptoslabs.com'; // or mainnet
```

## 📱 Usage

### Creating a Poll

1. Connect your Aptos wallet
2. Navigate to "Create Poll"
3. Fill in poll details:
   - Title and description
   - Multiple options (minimum 2)
   - Duration in hours
4. Submit transaction

### Voting

1. Browse available polls on the home page
2. Select your preferred option
3. Confirm vote with wallet
4. View real-time results

### Poll Management

- **Active Polls**: Can be voted on until expiration
- **Expired Polls**: Automatically marked as inactive
- **Closed Polls**: Can be manually closed by creator

## 🛠️ Development

### Smart Contract Development

```bash
# Test the contract
aptos move test

# Run specific tests
aptos move test --filter test_create_poll
```

### Frontend Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Adding New Features

1. **Smart Contract**: Add new functions in `sources/voting.move`
2. **Frontend**: Create new components in `src/components/`
3. **Services**: Update `src/services/votingService.ts`
4. **Types**: Update interfaces as needed

## 🔒 Security Features

- **Double Voting Prevention**: Smart contract ensures one vote per address per poll
- **Access Control**: Only poll creators can close polls
- **Input Validation**: Comprehensive validation on both frontend and smart contract
- **Wallet Authentication**: Secure wallet-based user identification

## 🌐 Network Support

- **Testnet**: `https://fullnode.testnet.aptoslabs.com`
- **Mainnet**: `https://fullnode.mainnet.aptoslabs.com`
- **Devnet**: `https://fullnode.devnet.aptoslabs.com`

## 📊 Smart Contract Functions

### Entry Functions
- `create_poll(title, description, options, duration_seconds)`
- `cast_vote(poll_id, option_index)`
- `close_poll(poll_id)`

### View Functions
- `get_poll_count()`
- `get_poll_by_id(poll_id)`
- `get_all_polls()`
- `has_user_voted_in_poll(poll_id, voter)`
- `get_user_voted_polls(user)`

## 🎨 UI Components

- **Header**: Navigation and wallet connection
- **PollCard**: Individual poll display with voting
- **CreatePoll**: Poll creation form
- **PollDetail**: Detailed poll view with charts
- **Home**: Main dashboard with all polls

## 🔗 Integration

### Wallet Integration

The app is ready for:
- **Petra Wallet**: Most popular Aptos wallet
- **Martian Wallet**: Feature-rich Aptos wallet
- **Any Wallet Standard**: Compatible with standard-compliant wallets

### API Integration

The service layer can be easily extended to:
- Add caching layer
- Integrate with indexing services
- Add analytics and monitoring
- Support multiple networks

## 🚀 Deployment

### Smart Contract Deployment

```bash
# Deploy to testnet
aptos move publish --named-addresses voting=0x<your-address> --network testnet

# Deploy to mainnet
aptos move publish --named-addresses voting=0x<your-address> --network mainnet
```

### Frontend Deployment

```bash
# Build production bundle
npm run build

# Deploy to your preferred hosting service
# (Vercel, Netlify, AWS S3, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: Check the Move and React documentation
- **Community**: Join Aptos Discord for blockchain support

## 🔮 Future Enhancements

- **Governance Tokens**: Weighted voting based on token holdings
- **Multi-Signature**: Advanced poll management
- **Voting Delegation**: Proxy voting capabilities
- **Advanced Analytics**: Detailed voting patterns and insights
- **Mobile App**: Native mobile application
- **API Gateway**: Public API for third-party integrations

---

Built with ❤️ on Aptos blockchain 