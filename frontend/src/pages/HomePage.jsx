import "../styles/HomePage.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import Popup from "../components/Popup"
import token from "../assets/token.png";
import gho from "../assets/gho.svg"
import usdc from "../assets/usdc.svg"
import usdt from "../assets/usdt.svg"
import lots from "../assets/lots.png"

function HomePage() {
    const [tokenBalances, setTokenBalances] = useState({
        usdc: 0,
        usdt: 0,
        gho: 0
    })
    const states = ["Idle", "Generating FHE keys", "Encrypting your intent", "Solving your intent", "Solved"]
    const [userIntent, setUserIntent] = useState("");
    const [status, setStatus] = useState("Idle");

    const handleSolveIntent = () => {
        setStatus(states[4])
    };

    return (
        <>
            <div className="container">
                <div className="main-content">
                    <div className="token-balances">
                        <div className="balances-heading">
                            <img src={token} alt="Token Balances Icon" className="heading-icon" />
                            <h2>Token Balances</h2>
                        </div>
                        <ul className="token-list">
                            <li>
                                <img src={gho} alt="GHO Icon" className="token-icon" />
                                GHO: {tokenBalances.gho}
                            </li>
                            <li>
                                <img src={usdc} alt="USDC Icon" className="token-icon" />
                                USDC: {tokenBalances.usdc}
                            </li>
                            <li>
                                <img src={usdt} alt="USDT Icon" className="token-icon" />
                                USDT: {tokenBalances.usdt}
                            </li>
                        </ul>
                    </div>
                    <header>
                        <img src={lots} alt="" className="lots-logo" />
                        <h1>One solver to solve them all</h1>
                    </header>
                    <div>
                        <ConnectButton showBalance={false} />
                    </div>
                </div>
            </div>
            <div className="intent-section">
                <h2>What do you wish to do?</h2>
                <input
                    type="text"
                    placeholder="Tell us your wish"
                    value={userIntent}
                    onChange={(e) => setUserIntent(e.target.value)}
                />
                {status !== 'Idle' && <h3>{status}...</h3>}
                <button className="solve-button" onClick={handleSolveIntent}>
                    Solve
                </button>
            </div>
            {status === 'Solved' && <Popup close={setStatus} />}
        </>
    );
}

export default HomePage;