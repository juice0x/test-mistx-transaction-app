import './App.css';
import { useEffect, useState } from 'react';
import { BigNumber  } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { ROUTER_ADDRESSES } from './constants/addresses';
import { ERC20BridgeSource } from './helpers/0x';
import ROUTER_ABI from './constants/abis/router-abi.json';
import getQuote from './utils/getQuote';
import getSignedTransaction, { SwapDataArr } from './utils/getSignedTransaction';

const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const mist = '0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab'

function App() {
  const [account, setAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [contract, setContract] = useState<Contract | undefined>();
  const [library, setLibrary] = useState<Web3Provider | undefined>()
  const [blockNumber, setBlockNumber] = useState<number | undefined>();
  const [baseFee, setBaseFee] = useState<BigNumber | undefined>();
  const [priorityFee, setPriorityFee] = useState<BigNumber | undefined>();

  async function connect() {
    if (!window.ethereum) return;
    try {
      // window.web3 = new Web3(window.ethereum as any);
      await window.ethereum?.request?.({method: 'eth_requestAccounts'});
    } catch(err) {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to Wallet.');
      } else {
        console.error(err);
      }
    }
  }

  async function loadWeb3() {
    if (window.ethereum) {
      await connect();

      const currentProvider = new Web3Provider(window.ethereum as ExternalProvider);
      
      setLibrary(currentProvider)
      listenToBlocks(currentProvider)

      await loadBlockchainData(currentProvider);
      await updateFees(currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected.');
    }
  }

  async function updateFees(provider: Web3Provider) {
    const feeData = await provider.getFeeData();

    if (feeData) {
      setBaseFee(feeData.maxFeePerGas || undefined);
      setPriorityFee(feeData.maxPriorityFeePerGas || undefined);
    }
  }

  function listenToBlocks(currentProvider: Web3Provider) {
    currentProvider.on('block', (blockNumber: number) => {
      console.log('block change', blockNumber)
      setBlockNumber(blockNumber)
      updateFees(currentProvider);
    })
  }

  async function loadBlockchainData(currentProvider: Web3Provider) {
    // load account
    if (!currentProvider) return;

    const signer = await currentProvider.getSigner()
    const address = await signer.getAddress()
    setAccount(address)

    const { chainId: currentChainId } = await currentProvider.getNetwork();
    const contractAddress = ROUTER_ADDRESSES[currentChainId];

    setChainId(currentChainId)

    if (contractAddress) {
      const abi = ROUTER_ABI.abi;
      const contract = new Contract(ROUTER_ABI.address, abi, signer);

      setContract(contract)
    }
  }

  async function handleSendTransaction() {
    if (!contract || !chainId || !library || !account || !baseFee || !priorityFee) return;

    const quote = await getQuote(eth, mist, parseEther('.01').toString(), [ERC20BridgeSource.UniswapV2]);
    const sellAmount = BigNumber.from(quote.sellAmount).toHexString()
    const feeAmount = parseUnits('0', 17).toHexString() // .0 ETH
    const calldata = quote.data;
    const feeToken = eth;
    const inputToken = quote.sellTokenAddress;
    const outputToken = quote.buyTokenAddress;
    const value = feeAmount;

    const maxBaseFeePerGas = baseFee;
    const maxPriorityFeePerGas = priorityFee;

    const methodName = 'proxiedSwap';
    const args = [
      calldata,
      feeToken,
      inputToken,
      sellAmount,
      outputToken,
      feeAmount,
    ] as SwapDataArr;

    try {
      const signedTx = await getSignedTransaction(
        contract,
        methodName,
        args,
        value,
        maxBaseFeePerGas,
        maxPriorityFeePerGas,
        BigNumber.from(375000),
        chainId,
        library,
        account,
      )

      console.log('successfully signed tx', signedTx);
    } catch(e) {
      console.log('error signing tx', e.message)
    }
  }

  useEffect(() => {
    loadWeb3();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <button className="button" onClick={handleSendTransaction} type="submit">Submit ETH:MIST Transaction</button>
      </header>
    </div>
  );
}

export default App;
