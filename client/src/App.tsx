import { useState } from "react";
import { StartCollection } from "./components/StartCollection";
import { BankIdLogin } from "./components/BankIdLogin";
import { InvestmentResults } from "./components/InvestmentResults";

type Screen = "start" | "bankid" | "results";

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [sessionId, setSessionId] = useState<string>();

  function handleSessionCreated(id: string) {
    setSessionId(id);
    setScreen("bankid");
  }

  function handleAuthComplete() {
    setScreen("results");
  }

  function handleReset() {
    setSessionId(undefined);
    setScreen("start");
  }

  return (
    <main>
      {screen === "start" && (
        <StartCollection onSessionCreated={handleSessionCreated} />
      )}
      {screen === "bankid" && sessionId && (
        <BankIdLogin
          sessionId={sessionId}
          onComplete={handleAuthComplete}
          onError={handleReset}
        />
      )}
      {screen === "results" && sessionId && (
        <InvestmentResults sessionId={sessionId} onReset={handleReset} />
      )}
    </main>
  );
}

export default App;
