# UMIq - Decentralized Prediction Markets

<div align="center">
  <h3>🔮 The Future of Crowdsourced Forecasting</h3>
  <p>Build, bet, and earn on prediction markets powered by UMI Devnet</p>
</div>

## 🌟 Vision

UMIq is a next-generation decentralized prediction market platform that democratizes forecasting through blockchain technology. By combining the wisdom of crowds with transparent, automated reward systems, UMIq enables anyone to create markets, place bets, and earn rewards based on real-world outcomes.

## ✨ Key Features

### 🎯 **Prediction Markets**
- Create custom prediction markets for any real-world event
- Set minimum/maximum bet limits and closing times
- Initial pool funding with ETH transfers
- Real-time market statistics and betting trends

### 💰 **Automated Rewards**
- Instant reward distribution when markets resolve
- Proportional payout system based on bet amounts
- Automatic balance updates for winners
- Transparent reward tracking

### 🏆 **DEFiq Scoring System**
- Intelligence scoring for prediction accuracy
- Gamified experience with reputation building
- Leaderboards and achievement tracking
- Community recognition system

### 🔗 **Web3 Integration**
- Seamless MetaMask wallet connection
- UMI Devnet blockchain integration
- On-chain deposit and withdrawal operations
- Secure transaction handling

### 📊 **Advanced Analytics**
- Real-time market statistics
- Betting trend visualizations
- User performance tracking
- Market outcome history

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Styled Components
- **State Management**: Redux Toolkit
- **Blockchain**: UMI Devnet, Ethers.js
- **Wallet**: MetaMask Integration
- **UI/UX**: React Icons, Confetti animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MetaMask wallet
- UMI Devnet network configured

### Installation

```bash
# Clone the repository
git clone https://github.com/enliven17/umiq.git
cd umiq

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Configuration

1. **Connect MetaMask** to UMI Devnet
2. **Add UMI Devnet** to your wallet:
   - Network Name: Umi Devnet
   - RPC URL: https://devnet.uminetwork.com
   - Chain ID: 42069
   - Currency Symbol: ETH
   - Block Explorer URL: https://devnet.explorer.moved.network

## 📱 How to Use

### Creating Markets
1. Navigate to "Create Market"
2. Fill in market details (title, description, closing time)
3. Set bet limits and initial pool amount
4. Review and confirm with ETH transfer
5. Market goes live for betting

### Placing Bets
1. Browse available markets
2. Select your prediction (Yes/No)
3. Enter bet amount (min 0.001 ETH)
4. Review and confirm bet
5. Wait for market resolution

### Claiming Rewards
- Rewards are automatically distributed to winners
- Check "My Bets" for reward status
- Balances update instantly upon market resolution

## 🏗️ Project Structure

```
src/
├── api/             # API clients and calls
├── assets/          # Images, fonts, animations
├── components/      # Reusable UI components
├── config/          # Environment variables
├── constants/       # App-wide constants
├── hooks/           # Custom React hooks
├── navigation/      # React Navigation logic
├── screens/         # Screen components
├── store/           # Redux Toolkit state management
├── theme/           # Styling and theme
├── types/           # TypeScript types
└── utils/           # Helper functions
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Components

- **MarketCard**: Displays market information and betting interface
- **BalanceManager**: Handles deposit/withdrawal operations
- **MarketDetailScreen**: Detailed market view with betting
- **UserBetsScreen**: Personal betting history and rewards

## 🌐 Blockchain Integration

UMIq leverages UMI Devnet for:
- **Market Creation**: On-chain market registration
- **Betting**: Transparent bet placement
- **Resolution**: Automated outcome determination
- **Rewards**: Instant payout distribution

## 🎨 Design Philosophy

- **User-Centric**: Intuitive interface for all skill levels
- **Transparent**: Clear information and real-time updates
- **Secure**: Blockchain-backed trust and verification
- **Scalable**: Modular architecture for future growth

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Advanced market types (multiple outcomes)
- [ ] Social features and comments
- [ ] API for third-party integrations
- [ ] Governance token implementation
- [ ] Cross-chain compatibility

---

<div align="center">
  <p><strong>Built with ❤️ for the UMI ecosystem</strong></p>
  <p>Join the future of decentralized prediction markets</p>
</div>
