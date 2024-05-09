import * as dotenv from "dotenv";
import { updateMetadataFiles, uploadFolderToIPFS } from "./metadata";

import { openWallet } from "./utils";
import { readdir } from "fs/promises";

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
  } catch (error) {
    console.error("Error in upload", error);
  }
}

void init();