export type FillData = {
  tokenAddressPath: string[]
  router: string
}

export type Order = {
  makerToken: string
  takerToken: string
  makerAmount: string
  takerAmount: string
  fillData: FillData
  source: string
  sourcePathId: string
  type: number
}

export type Quote = {
  price: string
  guaranteedPrice: string
  buyTokenAddress: string
  sellTokenAddress: string
  buyAmount: string
  sellAmount: string
  data: string
  orders: Order[]
}

export const ExchangeSources: { [key: string]: string } = {
  Native: 'Native',
  Uniswap: 'Uniswap',
  UniswapV2: 'Uniswap_V2',
  Eth2Dai: 'Eth2Dai',
  Kyber: 'Kyber',
  Curve: 'Curve',
  LiquidityProvider: 'LiquidityProvider',
  MultiBridge: 'MultiBridge',
  Balancer: 'Balancer',
  BalancerV2: 'Balancer_V2',
  Cream: 'CREAM',
  Bancor: 'Bancor',
  MakerPsm: 'MakerPsm',
  MStable: 'mStable',
  Mooniswap: 'Mooniswap',
  MultiHop: 'MultiHop',
  Shell: 'Shell',
  Swerve: 'Swerve',
  SnowSwap: 'SnowSwap',
  SushiSwap: 'SushiSwap',
  Dodo: 'DODO',
  DodoV2: 'DODO_V2',
  CryptoCom: 'CryptoCom',
  Linkswap: 'Linkswap',
  KyberDmm: 'KyberDMM',
  Smoothy: 'Smoothy',
  Component: 'Component',
  Saddle: 'Saddle',
  XSigma: 'xSigma',
  UniswapV3: 'Uniswap_V3',
  CurveV2: 'Curve_V2',
  Lido: 'Lido',
  ShibaSwap: 'ShibaSwap',
  Clipper: 'Clipper',
  // BSC only
  PancakeSwap: 'PancakeSwap',
  PancakeSwapV2: 'PancakeSwap_V2',
  BakerySwap: 'BakerySwap',
  Nerve: 'Nerve',
  Belt: 'Belt',
  Ellipsis: 'Ellipsis',
  ApeSwap: 'ApeSwap',
  CafeSwap: 'CafeSwap',
  CheeseSwap: 'CheeseSwap',
  JulSwap: 'JulSwap',
  ACryptos: 'ACryptoS',
  // Polygon only
  QuickSwap: 'QuickSwap',
  ComethSwap: 'ComethSwap',
  Dfyn: 'Dfyn',
  WaultSwap: 'WaultSwap',
  Polydex: 'Polydex',
  FirebirdOneSwap: 'FirebirdOneSwap',
  JetSwap: 'JetSwap',
  IronSwap: 'IronSwap',
}

export enum ERC20BridgeSource {
  Native = 'Native',
  Uniswap = 'Uniswap',
  UniswapV2 = 'Uniswap_V2',
  Eth2Dai = 'Eth2Dai',
  Kyber = 'Kyber',
  Curve = 'Curve',
  LiquidityProvider = 'LiquidityProvider',
  MultiBridge = 'MultiBridge',
  Balancer = 'Balancer',
  BalancerV2 = 'Balancer_V2',
  Cream = 'CREAM',
  Bancor = 'Bancor',
  MakerPsm = 'MakerPsm',
  MStable = 'mStable',
  Mooniswap = 'Mooniswap',
  MultiHop = 'MultiHop',
  Shell = 'Shell',
  Swerve = 'Swerve',
  SnowSwap = 'SnowSwap',
  SushiSwap = 'SushiSwap',
  Dodo = 'DODO',
  DodoV2 = 'DODO_V2',
  CryptoCom = 'CryptoCom',
  Linkswap = 'Linkswap',
  KyberDmm = 'KyberDMM',
  Smoothy = 'Smoothy',
  Component = 'Component',
  Saddle = 'Saddle',
  XSigma = 'xSigma',
  UniswapV3 = 'Uniswap_V3',
  CurveV2 = 'Curve_V2',
  Lido = 'Lido',
  ShibaSwap = 'ShibaSwap',
  Clipper = 'Clipper',
  // BSC only
  PancakeSwap = 'PancakeSwap',
  PancakeSwapV2 = 'PancakeSwap_V2',
  BakerySwap = 'BakerySwap',
  Nerve = 'Nerve',
  Belt = 'Belt',
  Ellipsis = 'Ellipsis',
  ApeSwap = 'ApeSwap',
  CafeSwap = 'CafeSwap',
  CheeseSwap = 'CheeseSwap',
  JulSwap = 'JulSwap',
  ACryptos = 'ACryptoS',
  // Polygon only
  QuickSwap = 'QuickSwap',
  ComethSwap = 'ComethSwap',
  Dfyn = 'Dfyn',
  WaultSwap = 'WaultSwap',
  Polydex = 'Polydex',
  FirebirdOneSwap = 'FirebirdOneSwap',
  JetSwap = 'JetSwap',
  IronSwap = 'IronSwap',
}
