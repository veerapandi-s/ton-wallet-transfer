import * as dotenv from "dotenv";
import { updateMetadataFiles, uploadFolderToIPFS } from "./metadata";

import { openWallet } from "./utils";
import { readdir } from "fs/promises";
import { NftCollection } from "./contracts/NFTCollection";
import { waitSeqno } from "./delay";
import { NftItem } from "./contracts/NftItem";
import { toNano } from "ton-core";

dotenv.config();

async function init() {
  const metadataFolderPath = "./data/metadata/";
  const imagesFolderPath = "./data/images/";
  const wallet = await openWallet(process.env.MNEMONIC!.split(" "), true);

  try {
    console.log("Started uploading images to IPFS...");
    const imagesIpfsHash = await uploadFolderToIPFS(imagesFolderPath);
    console.log(
      `Successfully uploaded the pictures to ipfs: https://gateway.pinata.cloud/ipfs/${imagesIpfsHash}`
    );

    console.log("Started uploading metadata files to IPFS...");
    await updateMetadataFiles(metadataFolderPath, imagesIpfsHash);
    const metadataIpfsHash = await uploadFolderToIPFS(metadataFolderPath);
    console.log(
      `Successfully uploaded the metadata to ipfs: https://gateway.pinata.cloud/ipfs/${metadataIpfsHash}`
    );

    console.log("Start deploy of nft collection...");
    const collectionData = {
      ownerAddress: wallet.contract.address,
      royaltyPercent: 0.05, // 0.05 = 5%
      royaltyAddress: wallet.contract.address,
      nextItemIndex: 0,
      collectionContentUrl: `ipfs://${metadataIpfsHash}/collection.json`,
      commonContentUrl: `ipfs://${metadataIpfsHash}/`,
    };
    const collection = new NftCollection(collectionData);
    let seqno = await collection.deploy(wallet);
    console.log(`Collection deployed: ${collection.address}`);
    await waitSeqno(seqno, wallet);

    const files = await readdir(metadataFolderPath);
    files.pop();

    seqno = await collection.topUpBalance(wallet, files.length);
    await waitSeqno(seqno, wallet);
    console.log(`Balance top-upped`);

    let index = 0;

    for (const file of files) {
      console.log(`Start deploy of ${index + 1} NFT`);
      const mintParams = {
        queryId: 0,
        itemOwnerAddress: wallet.contract.address,
        itemIndex: index,
        amount: toNano("0.05"),
        commonContentUrl: file,
      };
  
      const nftItem = new NftItem(collection);
      seqno = await nftItem.deploy(wallet, mintParams);
      console.log(`Successfully deployed ${index + 1} NFT`);
      await waitSeqno(seqno, wallet);
      index++;
    }
  } catch (error) {
    console.error("Error in upload", error);
  }
}

void init();