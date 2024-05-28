import { WalletContractV4 } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";

import CryptoJS from 'crypto-js';

console.log(process.env.SECRET_KEY);

const secretKey = CryptoJS.enc.Hex.parse(process.env.SECRET_KEY!); // 256-bit key
const iv = CryptoJS.enc.Hex.parse(process.env.IV_KEY!); // 128-bit IV

function encryptArray(arr: string[]) {
    const text = arr.join('||'); // Join the array into a single string with a delimiter
    const encrypted = CryptoJS.AES.encrypt(text, secretKey, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}

function decryptArray(cipherText: string) {
    const decrypted = CryptoJS.AES.decrypt(cipherText, secretKey, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    const text = decrypted.toString(CryptoJS.enc.Utf8);
    return text.split('||'); // Split the string back into an array using the delimiter
}

export const createWallet = async () => {
    try {
        let mnemonics = await mnemonicNew();
        const encrypted = encryptArray(mnemonics);
        console.log('Encrypted:', encrypted);
        const decrypted = decryptArray(encrypted);
        console.log('Decrypted:', decrypted);
        let keyPair = await mnemonicToPrivateKey(mnemonics);
        console.log(mnemonics);
        let workchain = 0; // Usually you need a workchain 0
        let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
        const hexAdd = wallet.address.toRawString();
        const bounceable = wallet.address.toString({ testOnly: false });
        const nonBounceable = wallet.address.toString({ bounceable: false, testOnly: false });

        console.log("Hex : ", hexAdd);
        console.log("Bouncable : ", bounceable);
        console.log("Non Bounceable : ", nonBounceable); // Need to store non bouncable
    } catch (error) {
        console.error("Error in creating", createWallet);
    }
}