"use client";
import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<null | {
    ont: string;
    ong: string;
    height: string;
  }>(null);
  const [error, setError] = useState("");

  const fetchBalance = async () => {
    try {
      const res = await fetch(
        `https://dappnode1.ont.io:10334/api/v1/balancev2/${address}`
      );
      const data = await res.json();

      if (data.Error === 0) {
        const ontFormatted = (BigInt(data.Result.ont) / 10n ** 9n).toString();
        const ongFormatted = (BigInt(data.Result.ong) / 10n ** 18n).toString();

        setBalance({
          ont: ontFormatted,
          ong: ongFormatted,
          height: data.Result.height,
        });
        setError("");
      } else {
        setError("Failed to fetch balance. Check the address.");
        setBalance(null);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching balance.");
      setBalance(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">🔍 ONT Wallet Balance Viewer</h1>

      <input
        type="text"
        placeholder="Enter ONT address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border p-2 rounded w-full max-w-md"
      />
      <button
        onClick={fetchBalance}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Get Balance
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {balance && (
        <div className="mt-6 bg-gray-100 text-black p-4 rounded w-full max-w-md">
          <h2 className="font-semibold text-lg">🔐 Wallet Info</h2>
          <p>ONT: {balance.ont}</p>
          <p>ONG: {balance.ong}</p>
          <p>Block Height: {balance.height}</p>
        </div>
      )}
    </main>
  );
}
