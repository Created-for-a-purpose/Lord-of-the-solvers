import "../styles/Popup.css";

const Popup = ({ close }) => {
    const decryptSolution = () => { }

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>🧙‍♂️ <span>Unbelievable fact:</span> We can't see your intents, <br />but can still solve them.</h2>
                <div className="solution-section">
                    <p></p>
                </div>
                <button className="decrypt-button" onClick={decryptSolution}>
                🔑 Decrypt
                </button>
            </div>
        </div>
    );
}

export default Popup;