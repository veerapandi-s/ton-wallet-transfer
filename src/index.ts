import * as dotenv from "dotenv";
dotenv.config();
import { TonClient, WalletContractV4, fromNano } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { transferNFT } from "./contracts/utils";
import { openWallet } from "./utils";
import { Address } from "ton-core";

const isTest = true;

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const init = async () => {
  try {
    // get the decentralized RPC endpoint
    const endpoint = await getHttpEndpoint({
      network: "testnet",
    });
    const client = new TonClient({
      // endpoint: 'https://toncenter.com/api/v2/jsonRPC', // Main Net
      // endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC' // Test net
      endpoint
    });


    
    const wallet = await openWallet(process.env.MNEMONIC!.split(" "), true);

    const hexAdd = wallet.contract.address.toRawString();
    const bounceable = wallet.contract.address.toString({ testOnly: isTest });
    const nonBounceable = wallet.contract.address.toString({ bounceable: false, testOnly: isTest });



    console.log("Hex : ", hexAdd);
    console.log("Bouncable : ", bounceable);
    console.log("Non Bounceable : ", nonBounceable);








    // const balance = await contract.getBalance();

    // console.log("Balance is : ", fromNano(balance));

    // const isContractDeployed = await client.isContractDeployed(wallet.address);

    // console.log("Is Contract depyloyed : ", isContractDeployed);

    let seqno = await wallet.contract.getSeqno();

    // console.log("Sequence No is : ", seqno);


    // let transfer = contract.createTransfer({
    //   seqno: seqno,
    //   secretKey: key.secretKey,
    //   messages: [internal({
    //     value: '0.1',
    //     to: 'EQB0Qd1s_EEMKp9cdHS4y4mRUPNeD7p619gqbzx2Ka8nu804',
    //     body: 'Test'
    //   })
    //   ]
    // });

    // let txnRes = await contract.send(transfer);

    // console.log("Transaction Result : ", txnRes);

    // await contract.sendTransfer({
    //   secretKey : key.secretKey,
    //   seqno,
    //   messages : [
    //     internal({
    //       to : 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e',
    //       value : '0.05',
    //       body : 'Hello',
    //       bounce : false
    //     })
    //   ]
    // })


    const nftItemAddress = "EQCjLbPs8uPe6wiWvDpIacosiSD97RMaohpvwddnRPDQFiw7";
    const toAddress = "0QABTwH5TicCa-iK9QGyy3f7iCAQ4qDooL5kU_qZCO8zs57w";

    await transferNFT(wallet, Address.parse(nftItemAddress), Address.parse(toAddress));
    let currentSeqNo = seqno;

    while (currentSeqNo == seqno) {
      console.log("Waiting for transaction to confirm...");
      await sleep(1500);
      currentSeqNo = await wallet.contract.getSeqno()
    }
    console.log("Transaction confirmed", currentSeqNo);
  } catch (error) {
    console.error(error);
  }

}



init();