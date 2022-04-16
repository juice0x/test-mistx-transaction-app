import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from '@ethersproject/providers';
import { getSignedTransaction, SwapDataArr } from "./getSignedTransaction";
import estimateGas from "./estimateGas";

export default async function sendTransaction({
  contract,
  chainId,
  library,
  account,
  maxBaseFeePerGas,
  maxPriorityFeePerGas,
  calldata,
  feeToken,
  inputToken,
  sellAmount,
  outputToken,
  feeAmount,
  value,
}: {
  contract: Contract,
  chainId: number,
  library: Web3Provider,
  account: string,
  maxBaseFeePerGas: BigNumber,
  maxPriorityFeePerGas: BigNumber,
  calldata: string,
  feeToken: string,
  inputToken: string,
  sellAmount: string,
  outputToken: string,
  feeAmount: string,
  value: string,
}) {
  if (!contract || !chainId || !library || !account || !maxBaseFeePerGas || !maxPriorityFeePerGas) return;


  const methodName = 'proxiedSwap';
  const args = [
    calldata,
    feeToken,
    inputToken,
    sellAmount,
    outputToken,
    feeAmount,
  ] as SwapDataArr;

  let estimatedGas;
  try {
    estimatedGas = await estimateGas(
      contract,
      methodName,
      args,
      value,
    )
  } catch(e) {
    console.log('error estimating gas', e.message)
    throw new Error(e.message)
  }

  try {
    const signedTx = await getSignedTransaction(
      contract,
      methodName,
      args,
      value,
      maxBaseFeePerGas,
      maxPriorityFeePerGas,
      BigNumber.from(Math.round(estimatedGas.toNumber() * 1.2)),
      chainId,
      library,
      account,
    )

    console.log('successfully signed tx', signedTx);
    return signedTx;
  } catch(e) {
    console.log('error signing tx', e.message)
    throw new Error(e.message);
  }
}