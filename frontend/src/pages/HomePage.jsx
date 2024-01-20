import "../styles/HomePage.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function HomePage() {
    return (
        <>
            <ConnectButton showBalance={false} />
        </>
    );
}

export default HomePage;