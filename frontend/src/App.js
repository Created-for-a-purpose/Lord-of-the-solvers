import './App.css';
import HomePage from './pages/HomePage';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import {
  polygonMumbai, sepolia
} from 'wagmi/chains';

const { chains, publicClient } = configureChains(
  [sepolia, polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'CB',
  projectId: 'cbabb06b3a049fce0e9231318d94998e',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <HomePage />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
