import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

function App() {
  const [data, setData] = useState({ address: "", balance: "0.00" });
  const [isConnecting, setIsConnecting] = useState(false);

  // 1. Balance update function (Ab ye memoized hai performance ke liye)
  const updateAccountInfo = useCallback(async (account) => {
    if (!window.ethereum || !account) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceBigInt = await provider.getBalance(account, "latest");
      const balanceEth = ethers.formatEther(balanceBigInt);
      
      setData(prev => ({ 
        ...prev, 
        address: account, 
        balance: parseFloat(balanceEth).toFixed(4) 
      }));
    } catch (err) {
      console.error("Auto-sync error:", err);
    }
  }, []);

  // 2. Wallet Connect
  const connectWallet = async () => {
    setIsConnecting(true);
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], 
        });
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        updateAccountInfo(accounts[0]);
      } catch (err) {
        console.log("User rejected or switch failed");
      }
    }
    setIsConnecting(false);
  };

  // 3. Smart Listeners & Auto-Polling
  useEffect(() => {
    if (window.ethereum) {
      // Account ya Network badalne par
      window.ethereum.on("accountsChanged", (acc) => updateAccountInfo(acc[0]));
      window.ethereum.on("chainChanged", () => window.location.reload());

      // 🔄 Auto-Polling: Har 10 seconds mein balance check karega
      const interval = setInterval(() => {
        if (data.address) updateAccountInfo(data.address);
      }, 10000); 

      return () => {
        clearInterval(interval);
        window.ethereum.removeAllListeners();
      };
    }
  }, [data.address, updateAccountInfo]);

  return (
    <div style={containerStyle}>
      <div style={glassCard}>
        <div style={badge}>Mainnet Ready Logic</div>
        <h1 style={titleStyle}> Web3 Dashboard</h1>
        <p style={subtitleStyle}>Real-time Blockchain Sync</p>

        {!data.address ? (
          <button onClick={connectWallet} style={connectBtn}>
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div style={statsContainer}>
            <div style={statBox}>
              <span style={labelStyle}>Wallet Address</span>
              <div style={addressBox}>{data.address.slice(0, 10)}...{data.address.slice(-8)}</div>
            </div>

            <div style={statBox}>
              <span style={labelStyle}>Live Balance</span>
              <div style={balanceText}>{data.balance} <small style={{fontSize:'16px'}}>ETH</small></div>
            </div>

            <div style={liveStatus}>
              <span style={pulseDot}></span>
              Live Syncing with Sepolia...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Minimalist & Clean Styles ---
const containerStyle = {
  height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
  background: '#0f172a', fontFamily: "'Segoe UI', sans-serif", color: 'white'
};

const glassCard = {
  background: 'rgba(30, 41, 59, 0.7)', borderRadius: '32px', padding: '50px 40px',
  width: '420px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative'
};

const badge = {
  position: 'absolute', top: '20px', right: '20px', background: '#3b82f6',
  padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold'
};

const titleStyle = { fontSize: '32px', marginBottom: '8px', fontWeight: '700' };
const subtitleStyle = { color: '#64748b', marginBottom: '40px', fontSize: '15px' };

const connectBtn = {
  padding: '18px', width: '100%', borderRadius: '16px', border: 'none',
  background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white',
  fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
};

const statsContainer = { display: 'flex', flexDirection: 'column', gap: '15px' };
const statBox = { background: '#1e293b', padding: '20px', borderRadius: '20px', textAlign: 'left', border: '1px solid #334155' };
const labelStyle = { fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' };
const addressBox = { fontSize: '15px', marginTop: '8px', color: '#cbd5e1', letterSpacing: '0.5px' };
const balanceText = { fontSize: '36px', fontWeight: '800', marginTop: '5px', color: '#f8fafc' };

const liveStatus = { marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981', fontSize: '13px' };
const pulseDot = { height: '8px', width: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' };

export default App;