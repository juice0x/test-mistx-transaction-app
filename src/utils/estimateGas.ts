import { Contract } from "@ethersproject/contracts";
import { SwapDataArr } from "./getSignedTransaction";
import isZero from "./isZero";

export default async function estimateGas(
  contract: Contract,
  methodName: string,
  args: SwapDataArr,
  value: string
) {
  const options = !value || isZero(value) ? {} : { gasLimit: 350000, value };
  try {
    const estimatedGas = await contract.estimateGas[methodName](...args, options);
    return estimatedGas;
  } catch(e) {
    throw new Error(`[estimateGas]: ${e.message}`);
  }
}
