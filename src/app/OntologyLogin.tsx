"use client";

import React, { useState } from "react";

const OntologyLogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [result, setResult] = useState("");
  const [provider, setProvider] = useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setProvider(window.onto || window.ethereum || null);
    }
  }, []);

  const updateUI = (loggedIn: boolean) => {
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      setWalletAddress("");
      setResult("");
    }
  };

  const handleLogin = async () => {
    try {
      if (!provider)
        throw new Error(
          "ONTO wallet not found. Please install the ONTO wallet extension."
        );

      const authRequest = {
        type: "AuthRequest",
        chain: "eth",
        app: "ONT ID Demo App",
        name: "ONT ID Demo",
        version: "1.0",
        challenge: "login-challenge",
        domain: window.location.hostname,
        issuer: "did:ont:issuer",
        requestId: Date.now().toString(),
        callbackUrl: `${window.location.protocol}//${window.location.host}/submit-auth`,
      };

      const challengeResponse = await fetch("/api/getChallenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authRequest }),
      });

      if (!challengeResponse.ok) throw new Error("Challenge fetch failed");

      const challenge = await challengeResponse.json();
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      const did = `did:etho:${account.replace("0x", "")}`;

      let signature;
      // Use personal_sign for ONTO wallet, fallback to eth_signTypedData_v4 for others
      if (provider.isONTO || provider === window.onto) {
        // ONTO wallet: use personal_sign
        const message = JSON.stringify({
          nonce: challenge.nonce,
          did,
          created: new Date().toISOString(),
        });
        signature = await provider.request({
          method: "personal_sign",
          params: [message, account],
        });
      } else {
        // Fallback: try eth_signTypedData_v4
        const signData = {
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" },
            ],
            AuthChallenge: [
              { name: "nonce", type: "string" },
              { name: "did", type: "string" },
              { name: "created", type: "string" },
            ],
          },
          domain: {
            name: "ONT ID Demo",
            version: "1.0",
            chainId: 1,
            verifyingContract: "0x0000000000000000000000000000000000000000",
          },
          primaryType: "AuthChallenge",
          message: {
            nonce: challenge.nonce,
            did,
            created: new Date().toISOString(),
          },
        };
        signature = await provider.request({
          method: "eth_signTypedData_v4",
          params: [account, JSON.stringify(signData)],
        });
      }

      const authResponse = {
        ver: "1.0",
        type: "ClientResponse",
        nonce: challenge.nonce,
        did,
        proof: {
          type: "ecdsa",
          verificationMethod: `${did}#key-1`,
          created: new Date().toISOString(),
          value: signature,
        },
        VPs: [],
      };

      const resultResponse = await fetch("/api/submitAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResponse),
      });

      const resultData = await resultResponse.json();
      if (resultData.error) throw new Error(resultData.error);

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("walletAddress", account);
      setWalletAddress(account);
      setResult("✅ Logged in");
      updateUI(true);
    } catch (error) {
      let message = "";
      if (error instanceof Error) {
        message = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        message = String((error as any).message);
      } else {
        message = JSON.stringify(error);
      }
      setResult(`❌ Login failed: ${message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("walletAddress");
      updateUI(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult(`❌ Logout failed: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">ONT Login</h1>
          <p className="text-gray-300 text-sm">
            Decentralized Identity Authentication
          </p>
        </div>

        <div className="text-center">
          {!isLoggedIn ? (
            <button
              onClick={handleLogin}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          )}
        </div>

        {walletAddress && (
          <div className="mt-4 text-center text-white">
            <p>Wallet Address: {walletAddress}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 text-center text-white">
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OntologyLogin;
