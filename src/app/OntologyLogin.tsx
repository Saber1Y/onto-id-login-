"use client";
import React, { useState } from "react";
import { Shield, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

const OntologyLogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [result, setResult] = useState("");
  interface Provider {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    isONTO?: boolean;
  }
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setResult("");

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
      if (provider.isONTO || provider === window.onto) {
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
      setResult("✅ Successfully authenticated with ONT ID");
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
        message = String(error.message);
      } else {
        message = JSON.stringify(error);
      }
      setResult(`❌ Authentication failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("walletAddress");
      updateUI(false);
      setResult("👋 Successfully logged out");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult(`❌ Logout failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <div className="relative z-10 bg-neutral-900 border border-white/10 backdrop-blur-2xl rounded-2xl p-8 max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">ONT Login</h1>
          <p className="text-gray-400 text-sm">
            Secure Decentralized Identity Authentication
          </p>
        </div>

        <div className="mb-6">
          {!isLoggedIn ? (
            <button
              onClick={handleLogin}
              disabled={isLoading || !provider}
              className="w-full bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-6 h-6" />
                  <span>Connect & Login</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full bg-red-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-6 h-6" />
                  <span>Disconnect</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Wallet Address */}
        {walletAddress && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">
                  Connected Wallet
                </h3>
                <p className="text-white font-mono text-sm">
                  {formatAddress(walletAddress)}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {result && (
          <div
            className={`p-4 rounded-xl border ${
              result.includes("❌")
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-white/5 border-white/20 text-white"
            }`}
          >
            <div className="flex items-start space-x-3">
              {result.includes("❌") ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm">{result}</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Powered by{" "}
            <span className="text-white font-semibold">Ontology Network</span>
          </p>
          <p className="mt-3">Built by Saber</p>
          <p className="flex justify-center items-center gap-4 mt-4">
            <Link href="https://Github.com/Saber1Y">
              <FaGithub className="ml-2" />
            </Link>
            <Link href="https://X.com/Sabercodes123">
              <FaXTwitter className="ml-2" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OntologyLogin;
