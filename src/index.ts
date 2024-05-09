import { mnemonicToWalletKey } from "@ton/crypto";
import { TonClient, WalletContractV4, fromNano } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { internal } from "@ton/core";

const isTest = true;

const sleep = (ms:number) => {
  return new Promise( resolve => setTimeout(resolve, ms));
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

    
    const mnemonic = 'thought permit hip cycle bicycle amazing grain open brass vendor theory walk manage goat traffic noise hole smooth bleak arrest fork domain address before';
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const workchain = 0;
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain });

    // const hexAdd = wallet.address.toRawString();
    // const bounceable = wallet.address.toString({ testOnly: isTest });
    // const nonBounceable = wallet.address.toString({ bounceable: false, testOnly: isTest });



    // console.log("Hex : ", hexAdd);
    // console.log("Bouncable : ", bounceable);
    // console.log("Non Bounceable : ", nonBounceable);





    const contract = client.open(wallet);

    // const balance = await contract.getBalance();

    // console.log("Balance is : ", fromNano(balance));

    // const isContractDeployed = await client.isContractDeployed(wallet.address);

    // console.log("Is Contract depyloyed : ", isContractDeployed);

    let seqno = await contract.getSeqno();

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

    await contract.sendTransfer({
      secretKey : key.secretKey,
      seqno,
      messages : [
        internal({
          to : 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e',
          value : '0.05',
          body : 'Hello',
          bounce : false
        })
      ]
    })

    let currentSeqNo = seqno;

    while(currentSeqNo == seqno) {
      console.log("Waiting for transaction to confirm...");
      await sleep(1500);
      currentSeqNo = await contract.getSeqno()
    }
    console.log("Transaction confirmed", currentSeqNo);
    
  } catch (error) {
    console.error(error);
  }

}



init();