"use client";

import { useState } from "react";

export default function OntologyViewer() {
  const [inputAddress, setInputAddress] = useState("");
  const [address, setAddress] = useState("");
  const [ontBalance, setOntBalance] = useState("0");
  const [ongBalance, setOngBalance] = useState("0");
  const [unboundOng, setUnboundOng] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState("");

  const isValidOntologyAddress = (addr: string) => {
    return addr.startsWith("A") && addr.length === 34;
  };

  const fetchProfileData = async (addr: string) => {
    setLoading(true);
    try {
      setError("");
      setOntBalance("0");
      setOngBalance("0");
      setUnboundOng("0");
      setApiResponse("");

      console.log(`Fetching data for address: ${addr}`);

      const baseUrls = [
        "http://dappnode1.ont.io:20334/api/v1",
        "http://dappnode2.ont.io:20334/api/v1",
        "http://dappnode3.ont.io:20334/api/v1",
      ];

      let success = false;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying API: ${baseUrl}`);

          const balanceResponse = await fetch(`${baseUrl}/balance/${addr}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          });

          console.log(`Balance API Status: ${balanceResponse.status}`);

          if (!balanceResponse.ok) {
            throw new Error(`HTTP ${balanceResponse.status}`);
          }

          const balanceData = await balanceResponse.json();
          console.log("Balance API Response:", balanceData);

          // Check if the API returned success (Error: 0)
          if (balanceData.Error === 0) {
            const result = balanceData.Result;

            // The API returns: { "ont": "2500", "ong": "0" }
            setOntBalance(result.ont || "0");
            setOngBalance(result.ong || "0");

            setApiResponse(JSON.stringify(balanceData, null, 2));

            // Fetch unbound ONG
            try {
              const unboundResponse = await fetch(
                `${baseUrl}/unboundong/${addr}`
              );
              if (unboundResponse.ok) {
                const unboundData = await unboundResponse.json();
                if (unboundData.Error === 0) {
                  // Convert from smallest unit to ONG (divide by 10^9)
                  const unboundValue =
                    parseFloat(unboundData.Result) / 1000000000;
                  setUnboundOng(unboundValue.toFixed(9));
                }
              }
            } catch (unboundErr) {
              console.log("Unbound ONG fetch failed:", unboundErr);
            }

            success = true;
            break;
          } else {
            throw new Error(`API Error: ${balanceData.Desc}`);
          }
        } catch (apiErr) {
          console.error(`API ${baseUrl} failed:`, apiErr);
          continue;
        }
      }

      if (!success) {
        throw new Error(
          "All API endpoints failed. The address might be invalid or the servers might be down."
        );
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Could not load data for this address.");
      setApiResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!inputAddress.trim()) {
      setError("Please enter an address.");
      return;
    }

    if (!isValidOntologyAddress(inputAddress.trim())) {
      setError(
        "Please enter a valid Ontology address (starts with 'A' and is 34 characters long)."
      );
      return;
    }

    setAddress(inputAddress.trim());
    fetchProfileData(inputAddress.trim());
  };

  const loadTestAddress = () => {
    const testAddress = "AQLASLtT6pWbThcSCYU1biVqhMnzhTgLFq";
    setInputAddress(testAddress);
    setAddress(testAddress);
    fetchProfileData(testAddress);
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toLocaleString();
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ontology Address Viewer</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Ontology Address
              </label>
              <input
                type="text"
                placeholder="Enter ONT address (e.g., AN6ctnUc2gPzgy88qSC7iPXW5JH4VaDAUe)"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                className="w-full border border-gray-300 text-black px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex-1 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {loading ? "Loading..." : "View Address"}
              </button>
              <button
                onClick={loadTestAddress}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Test
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {address && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
                alt="Avatar"
                className="w-16 h-16 rounded-full border"
              />
              <div>
                <h2 className="font-semibold text-gray-800">Address</h2>
                <p className="font-mono text-xs text-gray-600 break-all">
                  {address}
                </p>
              </div>
            </div>

            <div className="grid gap-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-blue-800">
                    ONT Balance
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatBalance(ontBalance)}
                  </div>
                </div>
                <div className="text-blue-500">🔵</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-yellow-800">
                    ONG Balance
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatBalance(ongBalance)}
                  </div>
                </div>
                <div className="text-yellow-500">🟡</div>
              </div>

              {parseFloat(unboundOng) > 0 && (
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-green-800">
                      Unbound ONG
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {unboundOng}
                    </div>
                  </div>
                  <div className="text-green-500">💰</div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>About ONT & ONG:</strong>
              </p>
              <p>• ONT: Ontology native token (governance)</p>
              <p>• ONG: Ontology gas token (transaction fees)</p>
              <p>• Unbound ONG: Claimable gas generated from holding ONT</p>
            </div>
          </div>
        )}
      </div>

      {/* Debug Section */}
      {apiResponse && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            API Response (Debug)
          </h3>
          <pre className="text-xs text-gray-600 overflow-x-auto max-h-40 whitespace-pre-wrap">
            {apiResponse}
          </pre>
        </div>
      )}
    </main>
  );
}
