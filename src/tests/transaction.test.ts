/*
* @jest-environment node
*/

import { expect } from 'chai'
import { MockProvider } from 'ethereum-waffle'; 
import { BigNumber, Contract, PopulatedTransaction, utils } from 'ethers'
import { ethSignTransaction } from '../utils/getSignedTransaction'
import { ROUTER_ADDRESSES } from '../constants/addresses'
import ROUTER_ABI from '../constants/abis/router-abi.json'
import getQuote from '../utils/getQuote'
import { ERC20BridgeSource } from '../helpers/0x'
import isZero from '../utils/isZero'

describe('transaction tests', function () {
  const provider = new MockProvider()
  const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
  const gasPrice = '200000000000';
  const priorityFee = '20000000000';

  it(`proxiedSwap ETH -> USDC: Fee In ETH`, async function () {
    const accounts = await provider.getWallets();
    const feeData = await provider.getFeeData();
    const signer = accounts[0]

    const contract = new Contract(ROUTER_ADDRESSES[1], ROUTER_ABI.abi, signer)
    const quote = await getQuote(
      eth,
      usdc,
      utils.parseUnits('.1', 18).toString(),
      [ERC20BridgeSource.UniswapV2]
    )

    // swap params
    const sellAmount = BigNumber.from(quote.sellAmount)
    const feeAmount = utils.parseUnits('0', 18) // 0 ETH
    const totalSellAmount = sellAmount.add(feeAmount)
    const feeToken = eth
    const inputToken = quote.sellTokenAddress
    const outputToken = quote.buyTokenAddress
    const value = sellAmount.add(feeAmount).toHexString();
    const calldata = quote.data;

    const methodName = 'proxiedSwap';
    const args = [
      calldata,
      feeToken,
      inputToken,
      sellAmount.toHexString(),
      outputToken,
      feeAmount.toHexString(),
    ];

    const nonce = signer.getTransactionCount();
    const populatedTx: PopulatedTransaction = await contract.populateTransaction[
      methodName
    ](...args, {
      //modify nonce if we also have an approval
      nonce,
      gasLimit: BigNumber.from(375000),
      type: 2,
      maxFeePerGas: BigNumber.from(gasPrice),
      maxPriorityFeePerGas: BigNumber.from(priorityFee),
      value: value && !isZero(value) ? value : '0x0',
    });

    const signedTx = await ethSignTransaction(provider, populatedTx, value)

    expect(signedTx).to.be('string')
  })
})