import { Horizon } from '@stellar/stellar-sdk';

const STELLAR_HORIZON_TESTNET = 'https://horizon-testnet.stellar.org';
export const horizonServer = new Horizon.Server(STELLAR_HORIZON_TESTNET);

export async function getStellarAccountInfo(publicKey: string) {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    return {
      success: true,
      id: account.id,
      sequence: account.sequence,
      balances: account.balances.map(b => ({
        asset_type: b.asset_type,
        asset_code: 'asset_code' in b ? b.asset_code : 'XLM',
        balance: b.balance
      }))
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Account not found or network error'
    };
  }
}

export async function checkStellarNetworkHealth() {
  try {
    const root = await horizonServer.root();
    return {
      connected: true,
      network: 'Stellar Testnet',
      horizonVersion: root.horizon_version,
      coreVersion: root.core_version,
      currentProtocolVersion: root.current_protocol_version
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Failed to ping Stellar Horizon testnet'
    };
  }
}
