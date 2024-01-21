import "../styles/HomePage.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import Popup from "../components/Popup"
import token from "../assets/token.png";
import gho from "../assets/gho.svg"
import usdc from "../assets/usdc.svg"
import usdt from "../assets/usdt.svg"
import lots from "../assets/lots.png"
import { readContract } from "wagmi/actions"
import { useAccount } from "wagmi";
import { tokenAbi, ghoAddress, usdcAddress, usdtAddress } from "../utils/constants";

function HomePage() {
    const { address } = useAccount()
    const [tokenBalances, setTokenBalances] = useState({
        usdc: 0,
        usdt: 0,
        gho: 0
    })
    const states = ["Idle", "Generating FHE keys", "Encrypting your intent", "Solving your intent", "Solved"]
    const [userIntent, setUserIntent] = useState("");
    const [status, setStatus] = useState("Idle");
    const [encryptedSolution, setEncryptedSolution] = useState("")
    const [sessionId, setSessionId] = useState(0);
    const url = "https://miniature-funicular-6997qvxq94p5h5jj4-8001.app.github.dev"

    const solveIntent = async () => {
        setStatus(states[1])
        const response = await fetch(url + "/generate-keys")
        const sessionId = await response.json()
        setSessionId(sessionId)
        setStatus(states[2])
        const response2 = await fetch(url + "/encrypt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "user_id": sessionId.toString(),
                "text": userIntent
            })
        })
        const status = await response2.json()
        if (!status) {
            setStatus(states[0])
            return
        }
        setStatus(states[3])
        const response3 = await fetch(url + "/solve/" + sessionId.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
        const solution = await response3.json()
        if (!solution) {
            setStatus(states[0])
            return
        }
        setEncryptedSolution(solution)
        setStatus(states[4])
    };

    useEffect(() => {
        const fetchTokenBalances = async () => {
            const ghoBalance = await readContract({
                address: ghoAddress,
                abi: tokenAbi,
                method: "balanceOf",
                args: [address]
            })
            const usdcBalance = await readContract({
                address: usdcAddress,
                abi: tokenAbi,
                method: "balanceOf",
                args: [address]
            })
            const usdtBalance = await readContract({
                address: usdtAddress,
                abi: tokenAbi,
                method: "balanceOf",
                args: [address]
            })
            setTokenBalances({
                gho: (ghoBalance?.toString() / 10 ** 18)?.toFixed(2),
                usdc: (usdcBalance?.toString() / 10 ** 6)?.toFixed(2),
                usdt: (usdtBalance?.toString() / 10 ** 6)?.toFixed(2)
            })
        };
        fetchTokenBalances();
    }
        , []);

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
                <button className="solve-button" onClick={solveIntent}>
                    Solve
                </button>
            </div>
            {status === 'Solved' && <Popup close={setStatus} encryptedSolution={encryptedSolution}
                sessionId={sessionId} intent={userIntent} url={url} />}
        </>
    );
}

export default HomePage;