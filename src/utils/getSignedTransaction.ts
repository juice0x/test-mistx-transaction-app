import { BigNumber } from '@ethersproject/bignumber';
import { SignatureLike } from '@ethersproject/bytes';
import { Contract, PopulatedTransaction } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { keccak256, serializeTransaction } from 'ethers/lib/utils';
import isZero from './isZero';
import { isBrave } from './userAgent';

export type SwapDataArr = [string, string, string, string, string, string];

interface SignedTransactionResponse {
  raw: string;
  tx: any;
}

export default async function getSignedTransaction(
  contract: Contract,
  methodName: string,
  args: SwapDataArr,
  value: string,
  maxBaseFeePerGas: BigNumber,
  maxPriorityFeePerGas: BigNumber,
  gasLimit: BigNumber,
  chainId: number,
  library: Web3Provider,
  account: string
) {
  if (!(contract.signer instanceof JsonRpcSigner)) {
    throw new Error(`Cannot sign transactions with this wallet type`);
  }

  let nonce: number | undefined;
  try {
    nonce = await contract.signer.getTransactionCount();
  } catch (error) {
    throw new Error('There was an error. Unable to get nonce.');
  }

  const populatedTx: PopulatedTransaction = await contract.populateTransaction[
    methodName
  ](...args, {
    //modify nonce if we also have an approval
    nonce,
    gasLimit,
    type: 2,
    maxFeePerGas: maxBaseFeePerGas,
    maxPriorityFeePerGas,
    value: value && !isZero(value) ? value : '0x0',
  });

  let web3Provider: Web3Provider | undefined;
  let isMetamask: boolean | undefined;
  // ethers will change eth_sign to personal_sign if it detects metamask
  if (library instanceof Web3Provider) {
    web3Provider = library as Web3Provider;
    isMetamask = web3Provider.provider.isMetaMask;
    if (isMetamask) web3Provider.provider.isMetaMask = false;
  }

  //delete for serialize necessary
  populatedTx.chainId = chainId;
  // HANDLE METAMASK
  // MetaMask does not support eth_signTransaction so we must use eth_sign as a workaround.
  // For other wallets, use eth_signTransaction
  let signedTx: string;

  try {
    if (isMetamask && !isBrave()) {
      delete populatedTx.from;
      const serialized = serializeTransaction(populatedTx);
      const hash = keccak256(serialized);
      const signature: SignatureLike = await library.jsonRpcFetchFunc(
        'eth_sign',
        [account, hash]
      );
      // console.log('signature', signature)
      // this returns the transaction & signature serialized and ready to broadcast
      // basically does everything that AD does with hexlify etc. - kek
      signedTx = serializeTransaction(populatedTx, signature);
    } else {
      const payload = [
        {
          ...populatedTx,
          chainId: undefined,
          gas: `0x${populatedTx.gasLimit?.toNumber().toString(16)}`,
          gasLimit: `0x${populatedTx.gasLimit?.toNumber().toString(16)}`,
          maxFeePerGas: `0x${populatedTx.maxFeePerGas
            ?.toNumber()
            .toString(16)}`,
          maxPriorityFeePerGas: `0x${populatedTx.maxPriorityFeePerGas
            ?.toNumber()
            .toString(16)}`,
          nonce: `0x${populatedTx.nonce?.toString(16)}`,
          ...(value && !isZero(value) ? { value } : { value: '0x0' }),
        },
      ];
      const signedTxRes: SignedTransactionResponse =
        await library.jsonRpcFetchFunc('eth_signTransaction', payload);

      signedTx = signedTxRes.raw;
    }

    // Set isMetaMask again after signing. (workaround for an issue with isMetaMask set on the provider during signing)
    if (web3Provider && isMetamask) {
      web3Provider.provider.isMetaMask = isMetamask;
    }

    return signedTx;
  } catch (e) {
    // Set isMetaMask again after signing. (workaround for an issue with isMetaMask set on the provider during signing)
    if (web3Provider && isMetamask) {
      web3Provider.provider.isMetaMask = isMetamask;
    }
    return Promise.reject(e);
  }
}
