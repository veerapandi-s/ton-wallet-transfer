import { KeyPair, mnemonicToPrivateKey } from "ton-crypto";
import {
    beginCell,
    Cell,
    OpenedContract,
    TonClient,
    WalletContractV4,
} from "ton";
import { Network, getHttpEndpoint } from "@orbs-network/ton-access";

export type OpenedWallet = {
    contract: OpenedContract<WalletContractV4>;
    keyPair: KeyPair;
};

export async function openWallet(mnemonic: string[], testnet: boolean) {
    const keyPair = await mnemonicToPrivateKey(mnemonic);
    const network: Network = testnet
        ? "testnet"
        : "mainnet";

    const endpoint = await getHttpEndpoint({
        network: network,
    });

    const client = new TonClient({
        endpoint: endpoint
    });
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });

    const contract = client.open(wallet);
    return { contract, keyPair };
}

