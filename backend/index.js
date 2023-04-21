const express = require("express");
const app = express();
const port = 5001;
const Moralis = require("moralis").default;
const cors = require("cors");

require("dotenv").config({ path: ".env" });

app.use(cors());
app.use(express.json());

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

app.get("/getethprice", async(req,res) => {
  try { 
    const response = await Moralis.EvmApi.token.getTokenPrice({
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        chain: "0x1"
    });
     return res.status(200).json(response);
    } catch (e) {
        console.log(`Something went wrong ${e}`)
        return res.status(400).json();
    }
});

app.get("/getblockinfo", async (req, res) => {
    try {
        const latestblock = await Moralis.EvmApi.block.getDateToBlock({
            date: Date.now(),
            chain: "0x1"
        })

        let blockNrorParentHash = latestblock.toJSON().block;
        let previousBlockInfo = [];

        for(let i = 0; i < 5; i++) {
            const previousBlockNrs = await Moralis.EvmApi.block.getBlock({
                chain: "0x1",
                blockNumberOrHash: blockNrorParentHash
            })

            blockNrorParentHash = previousBlockNrs.toJSON().parent_hash;

            if (i == 0) {
                previousBlockInfo.push({
                    transactions: previousBlockNrs.toJSON().transactions.map((i) => {
                        return {
                            transactionHash: i.hash,
                            time: i.block_timestamp,
                            fromAddress: i.from_address,
                            toAddress: i.to_address,
                            value: i.value
                        }
                    })
                })
            }

            previousBlockInfo.push({
                blockNumber: previousBlockNrs.toJSON.number,
                totalTransactions: previousBlockNrs.toJSON().transaction_count,
                gasUsed: previousBlockNrs.toJSON().gas_used,
                miner: previousBlockNrs.toJSON().miner,
                time: previousBlockNrs.toJSON().timestamp
            });
        }

        const response = {
            latestBlock: latestblock.toJSON().block,
            previousBlockInfo
        };

        return res.status(200).json(response);
    } catch(e) {
        console.log(`something went wrong ${e}`);
        return res.status(400).json();
    }
});

app.get("/address", async(req, res) => {
    try{
        const { query } = req;
        const chain = "0x1";

        const response = await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
            address: query.address,
            chain,
        });
        return res.status(200).json(response);
    } catch(e) {
        console.log(`something went wrong ${e}`);
        return res.status(400).json();
    }
})

Moralis.start({
    apiKey: MORALIS_API_KEY,
}).then(() => {
    app.listen(port, () => {
        console.log("Listening for API calls");
    })
})