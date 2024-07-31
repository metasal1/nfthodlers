
const fs = require("fs"); // Required to save the snapshot to a file

const url =
    "https://mainnet.helius-rpc.com/?api-key=ff0d3523-6397-47bf-bf5d-acb7d765d5ff";

const getAssetsByGroup = async () => {
    console.time("getAssetsByGroup"); // Start the timer
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
                    groupValue: "DyHBav1hXTWR2kQqWzLgsjVtS1x7dJF1cF3Zf83DCTni",
                    page: page,
                    limit: 1000,
                },
            }),
        });
        const { result } = await response.json();

        const owners = result.items.map((item) => ({
            NFTAddress: item.id,
            OwnerAddress: item.ownership.owner,
        }));
        assetList.push(...owners);
        if (result.total !== 1000) {
            page = false;
        } else {
            page++;
        }
    }
    const resultData = {
        totalResults: assetList.length,
        results: assetList,
    };
    console.log("Owners: ", resultData);
    fs.writeFile("output.json", JSON.stringify(resultData, null, 2), (err) => {
        if (err) throw err;
        console.log("Data written to file");
    });
    console.timeEnd("getAssetsByGroup"); // End the timer
};
getAssetsByGroup();
