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
import { getSignedTransaction, SwapDataArr } from './utils/getSignedTransaction';
import estimateGas from './utils/estimateGas';
import sendTransaction from './utils/sendTransaction';

const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const mist = '0x88acdd2a6425c3faae4bc9650fd7e27e0bebb7ab';
const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const defaultSellAmountInput = '.01';

function App() {
  const [account, setAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [contract, setContract] = useState<Contract | undefined>();
  const [library, setLibrary] = useState<Web3Provider | undefined>()
  const [blockNumber, setBlockNumber] = useState<number | undefined>();
  const [baseFee, setBaseFee] = useState<BigNumber | undefined>();
  const [priorityFee, setPriorityFee] = useState<BigNumber | undefined>();
  const [error, setError] = useState<any | undefined>();
  const [sellAmount, setSellAmount] = useState(defaultSellAmountInput);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function connect() {
    if (!window.ethereum) return;
    try {
      await window.ethereum?.request?.({method: 'eth_requestAccounts'});
    } catch(err) {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to Wallet.');
        throw new Error('Please connect wallet.')
      } else {
        console.error(err);
        // throw new Error('Error connecting wallet. refresh to try again')
      }
    }
  }

  async function loadWeb3() {
    if (window.ethereum) {
      setError(undefined);
      try {
        await connect();
      } catch (e) {
        setError(e);
        return;
      }

      const currentProvider = new Web3Provider(window.ethereum as ExternalProvider);
      
      setLibrary(currentProvider)
      listenToBlocks(currentProvider)

      try  {
        await loadBlockchainData(currentProvider);
        await updateFees(currentProvider);
      } catch(e) {
        setError(e.message)
      }
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
    setError(undefined)
    setLoading(false)
    if (!contract || !chainId || !library || !account || !baseFee || !priorityFee) return;
    
    try {
      const quote = await getQuote(eth, usdc, parseEther('.01').toString(), [ERC20BridgeSource.UniswapV2]);
      const sellAmount = BigNumber.from(quote.sellAmount).toHexString()
      const feeAmount = parseUnits('0', 17).toHexString() // .0 ETH
      const calldata = quote.data;
      const feeToken = eth;
      const inputToken = quote.sellTokenAddress;
      const outputToken = quote.buyTokenAddress;
      const value = BigNumber.from(feeAmount).add(sellAmount).toHexString();

      setLoading(true);
      sendTransaction({
        contract,
        chainId,
        library,
        account,
        maxBaseFeePerGas: baseFee,
        maxPriorityFeePerGas: priorityFee,
        calldata,
        feeToken,
        inputToken,
        sellAmount,
        outputToken,
        feeAmount,
        value
      });
    } catch(e) {
      setError(e)
    }
    setLoading(false);
  }

  useEffect(() => {
    loadWeb3();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        amount in eth.
        <input className="input" onChange={(e:any) => setSellAmount(e.target.value)} value={sellAmount} />
        <button className="button" disabled={loading} onClick={handleSendTransaction} type="submit">Submit ETH:USDC Transaction</button>
        {loading &&
          <div>loading</div>
        }
        {error &&
          <div className="error">{error.message}</div>
        }
        {success &&
          <div className="success">{success}</div>
        }
      </header>
    </div>
  );
}

export default App;
