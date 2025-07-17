# 🚀 ExtSwap DEX Frontend

ExtSwap adalah decentralized exchange (DEX) frontend yang dibangun dengan teknologi modern untuk trading cryptocurrency yang aman dan efisien.

## ✨ Fitur Utama

- **🔄 Swap Trading** - Pertukaran token dengan slippage protection
- **💧 Liquidity Pools** - Tambah dan kelola likuiditas
- **📊 Real-time Charts** - Grafik harga dan volume real-time
- **👛 Multi-Wallet Support** - MetaMask, Coinbase Wallet, WalletConnect
- **🌐 Multi-Chain** - Support untuk ExatechL2 dan BSC
- **🌙 Dark/Light Theme** - UI yang responsif dan modern
- **📱 Mobile Responsive** - Optimized untuk semua device

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **UI Library:** React 19
- **Styling:** TailwindCSS 4
- **Language:** TypeScript
- **Charts:** Lightweight Charts
- **Wallet Integration:** Web3 Modal, ethers.js
- **State Management:** React Context
- **Real-time Data:** WebSocket

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm atau yarn
- Git

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/sejuaju/extswap-frontend.git
cd extswap-frontend
```

2. **Install dependencies:**
```bash
npm install
# atau
yarn install
```

3. **Setup environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` dengan konfigurasi yang sesuai:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws
NEXT_PUBLIC_PRICE_SERVICE_URL=http://localhost:8080/api/v1

# Blockchain RPC URLs
NEXT_PUBLIC_EXATECHL2_RPC_URL=https://rpc.exatech.network
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_BSC_MAINNET_RPC_URL=https://bsc-dataseed.binance.org

# Explorer URLs
NEXT_PUBLIC_EXATECHL2_EXPLORER_URL=https://explorer.exatech.network
NEXT_PUBLIC_BSC_TESTNET_EXPLORER_URL=https://testnet.bscscan.com
NEXT_PUBLIC_BSC_MAINNET_EXPLORER_URL=https://bscscan.com

# hCaptcha Configuration
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
HCAPTCHA_SECRET_KEY=your_hcaptcha_secret_key
HCAPTCHA_VERIFY_URL=https://hcaptcha.com/siteverify

# Faucet Configuration
FAUCET_PRIVATE_KEY=your_faucet_private_key

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Asset URLs
NEXT_PUBLIC_METAMASK_DOWNLOAD_URL=https://metamask.io/download/
NEXT_PUBLIC_COINBASE_DOWNLOAD_URL=https://www.coinbase.com/wallet
```

4. **Run development server:**
```bash
npm run dev
# atau
yarn dev
```

5. **Open browser:**
```
http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js 13+ App Router
│   ├── api/            # API routes
│   ├── swap/           # Swap pages
│   ├── liquidity/      # Liquidity pages
│   └── ...
├── components/         # React components
│   ├── Swap/          # Swap-related components
│   ├── Wallet/        # Wallet components
│   ├── UI/            # Reusable UI components
│   └── Layout/        # Layout components
├── hooks/             # Custom React hooks
├── context/           # React Context providers
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── styles/            # Global styles
```

## 🔧 Configuration

### Environment Variables

Proyek ini menggunakan environment variables untuk konfigurasi yang fleksibel:

- **API Endpoints** - Konfigurasi backend API
- **Blockchain RPC** - URL RPC untuk berbagai network
- **Explorer URLs** - Link ke block explorer
- **Wallet Downloads** - URL download wallet
- **hCaptcha** - Konfigurasi captcha untuk faucet
- **Redis** - Konfigurasi caching

### Supported Networks

- **ExatechL2 Testnet** (Chain ID: 0x4c6)
- **BSC Testnet** (Chain ID: 0x61)  
- **BSC Mainnet** (Chain ID: 0x38)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Connect repository di Vercel
3. Set environment variables di Vercel dashboard
4. Deploy automatically

### Netlify

1. Build project: `npm run build`
2. Deploy `out/` folder ke Netlify
3. Set environment variables di Netlify dashboard

### Docker

```bash
# Build image
docker build -t extswap-frontend .

# Run container
docker run -p 3000:3000 extswap-frontend
```

## 🔒 Security

- **Environment Variables** - Sensitive data tidak di-commit
- **Input Validation** - Validasi semua user input
- **Slippage Protection** - Proteksi dari MEV attacks
- **Transaction Confirmation** - Modal konfirmasi untuk semua transaksi
- **Network Validation** - Validasi network sebelum transaksi

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Check [Issues](https://github.com/sejuaju/extswap-frontend/issues)
2. Create new issue jika belum ada
3. Provide detailed information tentang masalah

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **TailwindCSS** - Utility-first CSS framework
- **Ethereum Community** - Web3 ecosystem
- **Contributors** - Thank you untuk semua kontribusi

---

**⚡ Built with ❤️ for the DeFi community**
