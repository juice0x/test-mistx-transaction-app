import axios from "axios"
import { ERC20BridgeSource, ExchangeSources, Quote } from "../helpers/0x"

export default async function getQuote(
  sellToken: string,
  buyToken: string,
  sellAmount: string,
  exchanges?: ERC20BridgeSource[]
): Promise<Quote> {
  let url = `https://api.0x.org/swap/v1/quote?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${sellAmount}&slippagePercentage=0.01`
  let excludedSources = ['Native']
  if (exchanges && exchanges.length) {
    excludedSources = Object.keys(ExchangeSources)
      .map((k: string) => ExchangeSources[k])
      .filter((name) => exchanges.indexOf(name as ERC20BridgeSource) < 0)
  }
  url = `${url}&excludedSources=${excludedSources.join(',')}`
  const response = await axios.get(url)
  return response.data as Quote
}
