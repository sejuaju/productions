# ExtSwap - Layer 2 DeFi Platform

ExtSwap adalah platform pertukaran terdesentralisasi (DEX) Layer 2 yang dibangun dengan Next.js 15, React 19, dan TailwindCSS 4. Platform ini menyediakan pengalaman trading yang cepat, aman, dan dengan biaya rendah.

## 🚀 Fitur Utama

### Wallet Integration
- **Koneksi Multi-Wallet**: Mendukung MetaMask, Coinbase Wallet, WalletConnect, Trust Wallet, Rabby, dan Rainbow
- **Auto-Detection**: Deteksi otomatis wallet yang terinstall
- **Real-Time Balance**: Menampilkan saldo wallet secara real-time
- **Network Switching**: Beralih jaringan langsung dari aplikasi

### ExatechL2 Testnet Focus
- **Jaringan Utama**: ExatechL2 Testnet (Chain ID: 0x4c6)
- **Auto Network Addition**: Otomatis menambahkan ExatechL2 ke wallet
- **Testnet Support**: Dukungan lengkap untuk Sepolia, Goerli, Mumbai, BSC Testnet
- **Development Ready**: Siap untuk testing dan development

### Trading Features
- **Token Swap**: Pertukaran token instan dengan slippage protection
- **Liquidity Pools**: Tambah/hapus likuiditas dengan APY rewards
- **Yield Farming**: Stake LP tokens untuk mendapatkan yield
- **Real-time Rates**: Harga dan rate real-time

### UI/UX
- **Dark/Light Mode**: Theme switching dengan persistensi
- **Responsive Design**: Optimal di semua ukuran layar
- **Loading States**: Feedback visual untuk semua operasi
- **Error Handling**: Penanganan error yang comprehensive

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- MetaMask atau wallet lain yang kompatibel

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/ext-dex.git
cd ext-dex

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Setup
Buat file `.env.local`:
```env
NEXT_PUBLIC_APP_NAME=ExtSwap
NEXT_PUBLIC_CHAIN_ID=0x4c6
NEXT_PUBLIC_RPC_URL=https://rpc-l2.exatech.ai
NEXT_PUBLIC_EXPLORER_URL=https://exatech.tech
```

## 🌐 Jaringan yang Didukung

### Testnets (Focus)
- **ExatechL2 Testnet** (Chain ID: 0x4c6) - Jaringan utama
- Sepolia Testnet (Chain ID: 0xaa36a7)
- Goerli Testnet (Chain ID: 0x5)
- Polygon Mumbai (Chain ID: 0x13881)
- BSC Testnet (Chain ID: 0x61)

### Mainnets
- Ethereum Mainnet (Chain ID: 0x1)
- Polygon (Chain ID: 0x89)
- BNB Smart Chain (Chain ID: 0x38)
- Arbitrum One (Chain ID: 0xa4b1)
- Optimism (Chain ID: 0xa)

## 🔧 Komponen Utama

### WalletContext
Context provider untuk manajemen wallet state:
- Connection management
- Balance tracking
- Network switching
- Event listeners untuk account/network changes

### WalletModal
Modal untuk koneksi wallet:
- Multiple wallet options
- Installation detection
- Error handling
- Terms & conditions

### NetworkSelector
Selector untuk switching network:
- Testnet/Mainnet toggle
- Auto network addition
- Real-time network status
- ExatechL2 focus

### SwapForm
Form untuk token swapping:
- Real wallet balance
- Token selection
- Slippage settings
- Transaction preview

## 🚀 Testing di ExatechL2 Testnet

1. **Connect Wallet**: Klik "Connect Wallet" dan pilih wallet
2. **Switch Network**: Akan otomatis prompt untuk switch ke ExatechL2
3. **Add Network**: Jika belum ada, wallet akan menambahkan ExatechL2 otomatis
4. **Get Testnet ETH**: Gunakan faucet ExatechL2 untuk mendapatkan test ETH
5. **Start Trading**: Mulai swap, add liquidity, atau farming

## 📝 Development Notes

### Wallet Integration
- Semua komponen swap/pool/farm memerlukan koneksi wallet
- Balance dan network status real-time
- Error handling untuk wallet operations
- Support untuk semua wallet populer

### ExatechL2 Implementation
- Custom network configuration
- Auto-addition ke wallet
- Optimized untuk development testing
- Gas fee estimates

### State Management
- React Context untuk wallet state
- Real-time updates via event listeners
- Persistent theme preferences
- Loading states untuk semua operations

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

MIT License - lihat file LICENSE untuk details.

## 🔗 Links

- [ExatechL2 Explorer](https://exatech.tech)
- [ExatechL2 RPC](https://rpc-l2.exatech.ai)
- [Documentation](https://docs.exatech.io)
- [Discord Community](https://discord.gg/exatech)

---

**Note**: Aplikasi ini dalam tahap development dan fokus pada testnet. Jangan gunakan wallet mainnet dengan nilai signifikan untuk testing.
