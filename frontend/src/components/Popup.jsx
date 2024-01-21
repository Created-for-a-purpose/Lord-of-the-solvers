import "../styles/Popup.css";
import { useState } from "react";
import { tokenizer } from "../utils/tokenizer.js"
import { useAccount } from "wagmi";
import { tokenAbi, ghoAddress } from "../utils/constants";

const Popup = ({ close, url, intent, encryptedSolution, sessionId }) => {
    const [buttonText, setButtonText] = useState("🔑 Decrypt")
    const [solution, setSolution] = useState("")
    const [txData, setTxData] = useState(null)
    const { address } = useAccount()

    const decryptSolution = async () => {
        if (buttonText === "Confirm ✅") return confirm()
        const response = await fetch(url + "/decrypt/" + sessionId, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const solution = await response.json()
        const { decodedIntent, txData } = tokenizer(solution, intent)
        setTxData(txData)
        setSolution(decodedIntent)
        setButtonText("Confirm ✅")
    }

    const confirm = async () => {
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>🧙‍♂️ <span>Unbelievable fact:</span> We can't see your intents, <br />but we can still solve them.</h2>
                <div className="solution-section">
                    {solution === "" ? (<p>{encryptedSolution?.slice(0, 50)} <br />
                        {encryptedSolution?.slice(51, 100)} <br />
                        {encryptedSolution?.slice(101, 150)} <br />
                        {encryptedSolution?.slice(151, 200)} <br />
                        {encryptedSolution?.slice(201, 250)}
                    </p>) : (<p>Decrypted Solution:<br /><br />{solution} </p>)}
                </div>
                <button className="decrypt-button" onClick={decryptSolution}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

export default Popup;