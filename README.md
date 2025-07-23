# SolVault 🔐

<div align="center">
  <strong>A secure Solana wallet generator built with React and Vite</strong>
  <br><br>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana">
</div>

<br>

SolVault allows users to generate new Solana wallets or import existing ones using BIP39 mnemonic phrases.

## Features

- 🔑 Generate new Solana wallets with BIP39 mnemonic phrases
- 📥 Import existing wallets using seed phrases
- 👁️ Toggle visibility for sensitive information (seed phrases, private keys)
- 📋 Copy wallet details to clipboard
- 💰 Check wallet balance on Solana devnet
- 🔒 Security-focused design with warnings and best practices
- 📱 Responsive design for all devices

## Tech Stack

- **React** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling
- **@solana/web3.js** - Solana blockchain interaction
- **bip39** - Mnemonic phrase generation and validation
- **Buffer** - Browser polyfill for Node.js Buffer
- **Lucide React** - Icons

## Installation

1. Clone the repository:

```bash
git clone https://github.com/riteshkrkarn/SolVault.git
cd SolVault
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Generate New Wallet**: Leave the input field blank and click "Generate" to create a new wallet
2. **Import Existing Wallet**: Enter your BIP39 mnemonic phrase in the input field and click "Generate"
3. **View Seed Phrase**: Click "Show" to reveal your mnemonic words
4. **Copy Details**: Use the copy buttons to copy seed phrase, public key, or private key
5. **Check Balance**: The balance will be automatically fetched for imported wallets

## Security Features

- Seed phrases are hidden by default
- Private keys are masked with dots and require manual reveal
- Security warnings and best practices are displayed
- No data is stored or transmitted to external servers

## Project Structure

```
SolVault/
├── public/
│   └── logo.svg          # Gemini-generated logo
├── src/
│   ├── components/
│   │   └── SecretPhraseGrid.jsx
│   ├── utils/
│   │   └── wallet.js     # Wallet generation and management
│   ├── App.jsx           # Main application component
│   ├── index.css         # Tailwind CSS imports
│   └── main.jsx          # Application entry point
├── README.md
└── package.json
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Disclaimer

⚠️ **This application is built for learning purposes only.**

- Always verify transactions on mainnet
- Never share your seed phrase or private keys
- Use at your own risk for actual funds
- Test thoroughly before using with real assets

## Author

**Ritesh Kumar Karn**

- 🐦 Twitter: [@riteshkrkarn](https://twitter.com/riteshkrkarn)
- 💼 LinkedIn: [riteshkrkarn](https://linkedin.com/in/riteshkrkarn)
- 🐙 GitHub: [riteshkrkarn](https://github.com/riteshkrkarn)
- 📧 Email: riteshkumarkarn414@gmail.com

## Credits

- Logo generated using **Google Gemini AI**
- Built with React + Vite template
- Icons by Lucide React

## License

This project is open source and available under the [MIT License](LICENSE).
