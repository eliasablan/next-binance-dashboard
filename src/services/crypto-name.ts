// Servicio para mapear símbolos de criptomonedas a nombres legibles
export class CryptoNameService {
  // Mapeo de símbolos a nombres comunes
  private static symbolToNameMap: Record<string, string> = {
    BTCUSDT: "Bitcoin",
    ETHUSDT: "Ethereum",
    BNBUSDT: "BNB",
    XRPUSDT: "XRP",
    ADAUSDT: "Cardano",
    SOLUSDT: "Solana",
    DOGEUSDT: "Dogecoin",
    AVAXUSDT: "Avalanche",
    DOTUSDT: "Polkadot",
    MATICUSDT: "Polygon",
    LINKUSDT: "Chainlink",
    LTCUSDT: "Litecoin",
    UNIUSDT: "Uniswap",
    ATOMUSDT: "Cosmos",
    FILUSDT: "Filecoin",
    ALGOUSDT: "Algorand",
    MANAUSDT: "Decentraland",
    AXSUSDT: "Axie Infinity",
    CHZUSDT: "Chiliz",
    ENJUSDT: "Enjin Coin",
    BALUSDT: "Balancer",
    COMPUSDT: "Compound",
    YFIUSDT: "yearn.finance",
    MKRUSDT: "Maker",
    SNXUSDT: "Synthetix",
    AAVEUSDT: "Aave",
    CRVUSDT: "Curve DAO Token",
    SUSHIUSDT: "SushiSwap",
    "1INCHUSDT": "1inch",
    THETAUSDT: "THETA",
    VETUSDT: "VeChain",
    ICPUSDT: "Internet Computer",
    NEARUSDT: "NEAR Protocol",
    FTMUSDT: "Fantom",
    TRXUSDT: "TRON",
    EOSUSDT: "EOS",
    XMRUSDT: "Monero",
    XLMUSDT: "Stellar",
    HBARUSDT: "Hedera",
    FLOWUSDT: "Flow",
    EGLDUSDT: "MultiversX",
    SANDUSDT: "The Sandbox",
    GALAUSDT: "Gala",
    APUSDT: "ApeSwap",
    RNDRUSDT: "Render Token",
    PENDLEUSDT: "Pendle",
    ARBUSDT: "Arbitrum",
    OPUSDT: "Optimism",
    SUIUSDT: "Sui",
    APTUSDT: "Aptos",
    LDOUSDT: "Lido DAO",
    STXUSDT: "Stacks",
    IMXUSDT: "Immutable X",
    INJUSDT: "Injective",
    TIAUSDT: "Celestia",
    SEIUSDT: "Sei",
  };

  /**
   * Obtiene el nombre legible de una criptomoneda a partir de su símbolo
   * @param symbol - El símbolo de la criptomoneda (ej: "BTCUSDT")
   * @returns El nombre legible de la criptomoneda o el símbolo base si no se encuentra
   */
  static getCryptoName(symbol: string): string {
    // Primero intentar con el mapeo directo
    if (this.symbolToNameMap[symbol]) {
      return this.symbolToNameMap[symbol];
    }

    // Si no se encuentra, extraer el símbolo base eliminando USDT, BUSD, etc.
    const baseSymbol = symbol.replace(/USDT$|BUSD$|USDC$|BTC$|ETH$|BNB$/, "");

    // Formatear el símbolo base: primera letra mayúscula, resto minúscula
    return (
      baseSymbol.charAt(0).toUpperCase() + baseSymbol.slice(1).toLowerCase()
    );
  }

  /**
   * Obtiene el símbolo base (sin el par de trading) de una criptomoneda
   * @param symbol - El símbolo completo (ej: "BTCUSDT")
   * @returns El símbolo base (ej: "BTC")
   */
  static getBaseSymbol(symbol: string): string {
    return symbol.replace(/USDT$|BUSD$|USDC$|BTC$|ETH$|BNB$/, "");
  }

  /**
   * Verifica si un símbolo es un par USDT
   * @param symbol - El símbolo a verificar
   * @returns true si es un par USDT
   */
  static isUSDTPair(symbol: string): boolean {
    return symbol.endsWith("USDT");
  }

  /**
   * Añade un nuevo mapeo de símbolo a nombre
   * @param symbol - El símbolo de la criptomoneda
   * @param name - El nombre legible
   */
  static addMapping(symbol: string, name: string): void {
    this.symbolToNameMap[symbol] = name;
  }

  /**
   * Obtiene todos los mapeos disponibles
   * @returns Un objeto con todos los mapeos símbolo -> nombre
   */
  static getAllMappings(): Record<string, string> {
    return { ...this.symbolToNameMap };
  }
}
