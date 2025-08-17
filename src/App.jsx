import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Vault from "./solVault/Vault";
import Faucet from "./solDrop/Faucet";
import TransactionSol from "./transactionSol/TransactionSol";
import Mintify from "./mintify/Mintify";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/faucet" element={<Faucet />} />
        <Route path="/transaction" element={<TransactionSol />} />
        <Route path="/mintify" element={<Mintify />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
