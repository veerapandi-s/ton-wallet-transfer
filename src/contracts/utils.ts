import { OpenedWallet } from "../utils";
import { Address, beginCell, Cell, internal, SendMode, toNano } from "ton-core";

const createTransferBody = (params: {
    newOwner: Address;
    responseTo?: Address;
    forwardAmount?: bigint;
}): Cell => {
    const msgBody = beginCell();
    msgBody.storeUint(0x5fcc3d14, 32); // op-code 
    msgBody.storeUint(0, 64); // query-id
    msgBody.storeAddress(params.newOwner);
    msgBody.storeAddress(params.responseTo || null);
    msgBody.storeBit(false); // no custom payload
    msgBody.storeCoins(params.forwardAmount || 0);
    msgBody.storeBit(0); // no forward_payload 

    return msgBody.endCell();
}

export const transferNFT = async (
    wallet: OpenedWallet,
    nftAddress: Address,
    newOwner: Address
): Promise<number> => {
    try {
        const seqno = await wallet.contract.getSeqno();

    await wallet.contract.sendTransfer({
        seqno,
        secretKey: wallet.keyPair.secretKey,
        messages: [
            internal({
                value: "0.05",
                to: nftAddress,
                body: createTransferBody({
                    newOwner,
                    responseTo: wallet.contract.address,
                    forwardAmount: toNano("0.02"),
                }),
            }),
        ],
        sendMode: SendMode.IGNORE_ERRORS + SendMode.PAY_GAS_SEPARATELY,
    });
    return seqno;
    } catch (error) {
        return Promise.reject({
            status : false,
            rawError : error,
            error : "Error in transfer NFT"
        });
    }
    
}