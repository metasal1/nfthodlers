'use client'

import { ReactNode, useState } from 'react';
import Link from 'next/link';
export default function Home() {
  const [address, setAddress] = useState('');
  interface Holder {
    OwnerAddress: ReactNode;
    address: string;
    balance: number;
  }

  interface HoldersResponse {
    totalResults: number;
    results: Holder[];
  }

  const [holders, setHolders] = useState<HoldersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHolders(null);

    try {
      const response = await fetch('/api/holders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch <NFT></NFT> holders');
      }

      const data = await response.json();
      setHolders(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!holders) return;

    const dataStr = JSON.stringify(holders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `nft_holders_${address}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClear = () => {
    setAddress('');
    setHolders(null);
    setError(null);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solana NFT Holders</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter token mint address"
          className="border p-2 mr-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2  mr-2"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Holders'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-red-500 text-white p-2 "
        >
          Clear
        </button>
      </form>
      <div>
        <button onClick={() => setAddress('DyHBav1hXTWR2kQqWzLgsjVtS1x7dJF1cF3Zf83DCTni')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">Solana ANZ</button>
        <button onClick={() => setAddress('H4EQ8pcE7PQSQGG1WYW4hAA1nizU6ULYipHZcYk9b64u')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">Flash Beasts</button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {holders && (
        <div>
          <h2 className="text-xl font-semibold mb-2">NFT Holders: {holders.totalResults}</h2>
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white p-2  mb-4"
          >
            Download Holders Data
          </button>
          <ul className="max-h-96 overflow-y-auto">
            {holders.results.map((holder, index) => (
              <li key={index} className="mb-1">
                {holder.OwnerAddress}
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="text-xs p-5">Made by <Link className="text-red-500" target="_blank" href={"https://www.metasal.xyz"}>@metasal</Link></footer>
    </main>
  );
}