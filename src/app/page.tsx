'use client'

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';

interface Holder {
  OwnerAddress: string;
  NFTCount: number;
}

interface HoldersResponse {
  totalResults: number;
  results: { OwnerAddress: string; NFTAddress: string }[];
}

export default function Home() {
  const [address, setAddress] = useState('');
  const [holders, setHolders] = useState<HoldersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uniqueHolders, setUniqueHolders] = useState<Holder[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Holder; direction: 'ascending' | 'descending' } | null>(null);
  const [apiResponseTime, setApiResponseTime] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHolders(null);
    setUniqueHolders([]);
    setApiResponseTime(null);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/holders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch NFT holders');
      }

      const data: HoldersResponse = await response.json();
      const endTime = performance.now();
      setApiResponseTime((endTime - startTime) / 1000); // Convert to seconds
      setHolders(data);
      processHolderData(data.results);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const processHolderData = (results: HoldersResponse['results']) => {
    const counts: { [key: string]: number } = {};
    results.forEach((holder) => {
      counts[holder.OwnerAddress] = (counts[holder.OwnerAddress] || 0) + 1;
    });
    const uniqueHoldersArray = Object.entries(counts).map(([OwnerAddress, NFTCount]) => ({
      OwnerAddress,
      NFTCount,
    }));
    setUniqueHolders(uniqueHoldersArray);
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
    setUniqueHolders([]);
    setApiResponseTime(null);
  };

  const handleSort = (key: keyof Holder) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedHolders = [...uniqueHolders].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    if (a[key] < b[key]) {
      return direction === 'ascending' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

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
          className="bg-blue-500 text-white p-2 mr-2"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Holders'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-red-500 text-white p-2"
        >
          Clear
        </button>
      </form>
      <div className="mb-4">
        <button onClick={() => setAddress('DyHBav1hXTWR2kQqWzLgsjVtS1x7dJF1cF3Zf83DCTni')} className="text-white bg-green-500 hover:bg-purple-500 p-2 mr-2">Solana ANZ</button>
        <button onClick={() => setAddress('H4EQ8pcE7PQSQGG1WYW4hAA1nizU6ULYipHZcYk9b64u')} className="text-white bg-green-500 hover:bg-purple-500 p-2 mr-2">Flash Beasts</button>
        <button onClick={() => setAddress('5LCDufGQwVqeTUKkiUC6YEwo3C8YSpibZn4wLXGh33xg')} className="text-white bg-green-500 hover:bg-purple-500 p-2">BlinksGG</button>
        <button onClick={() => setAddress('4oTtVn8TfdjMu4hsTBGL7xvuFN3YbUBbPn7xqatxBxjS')} className="text-white bg-green-500 hover:bg-purple-500 p-2">Space Operator</button>

      </div>
      {error && <p className="text-red-500">{error}</p>}
      {holders && (
        <div>
          <h2 className="text-xl font-semibold mb-2">NFT Holders: {holders.totalResults}</h2>
          <h3 className="text-lg font-semibold mb-2">Unique Holders: {uniqueHolders.length}</h3>
          {apiResponseTime !== null && (
            <p className="mb-2">API Response Time: {apiResponseTime.toFixed(2)} seconds</p>
          )}
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white p-2 mb-4"
          >
            Download Holders Data
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('OwnerAddress')}>
                    Owner Address {sortConfig?.key === 'OwnerAddress' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('NFTCount')}>
                    NFT Count {sortConfig?.key === 'NFTCount' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedHolders.map((holder, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border px-4 py-2 font-mono text-sm break-all">{holder.OwnerAddress}</td>
                    <td className="border px-4 py-2 text-center">{holder.NFTCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <footer className="text-xs p-5">Made by <Link className="text-red-500" target="_blank" href={"https://www.metasal.xyz"}>@metasal</Link></footer>
    </main>
  );
}