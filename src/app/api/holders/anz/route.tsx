import { PublicKey } from '@solana/web3.js';
import { NextResponse, NextRequest } from 'next/server';

// Solana ANZ = DyHBav1hXTWR2kQqWzLgsjVtS1x7dJF1cF3Zf83DCTni
export async function GET(request: NextRequest) {
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

        return new NextResponse(JSON.stringify(resultData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });

    } catch (error) {
        return new NextResponse(JSON.stringify({ message: 'Error fetching nft holders' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}