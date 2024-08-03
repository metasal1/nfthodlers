import { PublicKey } from '@solana/web3.js';
import { NextResponse } from 'next/server';

// Solana ANZ = DyHBav1hXTWR2kQqWzLgsjVtS1x7dJF1cF3Zf83DCTni
export async function GET(request: Request) {

    const mint = new PublicKey('DyHBav1hXTWR2kQqWzLgsjVtS1x7dJF1cF3Zf83DCTni');
    const url = process.env.RPC || 'https://api.mainnet-beta.solana.com';

    try {
        let page = 1;
        let assetList = [];

        while (page) {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "my-id",
                    method: "getAssetsByGroup",
                    params: {
                        groupKey: "collection",
                        groupValue: mint.toBase58(),
                        page: page,
                        limit: 1000,
                    },
                }),
            });
            const { result } = await response.json();

            const owners = result.items.map((item: { id: any; ownership: { owner: any; }; }) => ({
                NFTAddress: item.id,
                OwnerAddress: item.ownership.owner,
            }));
            assetList.push(...owners);
            if (result.total !== 1000) {
                page = 0;
            } else {
                page++;
            }
        }
        const resultData = {
            totalResults: assetList.length,
            results: assetList,
        };

        return NextResponse.json(resultData);

    } catch (error) {
        return NextResponse.json({ message: 'Error fetching nft holders' }, { status: 500 });
    }
}

