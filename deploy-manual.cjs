const http = require('http');

// Simple ERC20 contract deployment using raw JSON-RPC calls
async function deploySimpleContract() {
  try {
    console.log('Attempting to deploy a simple contract to local Hardhat network...');
    
    // First, let's get the accounts
    const accounts = await makeRpcCall('eth_accounts', []);
    console.log('Available accounts:', accounts);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available');
    }
    
    const deployerAccount = accounts[0];
    console.log('Using deployer account:', deployerAccount);
    
    // Very simple contract bytecode - just stores a value and has a getter
     // This is the most minimal contract possible
     const contractBytecode = '0x6080604052348015600f57600080fd5b50600160008190555060358060266000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80632e64cec114602d575b600080fd5b60005460405190815260200160405180910390f3fea264697066735822122000000000000000000000000000000000000000000000000000000000000000000064736f6c63430008070033';
    
    // Deploy the contract
    const txHash = await makeRpcCall('eth_sendTransaction', [{
      from: deployerAccount,
      data: contractBytecode,
      gas: '0x1e8480', // 2000000 gas (very high limit)
      gasPrice: '0x9184e72a000' // 10000000000000 wei
    }]);
    
    console.log('Transaction hash:', txHash);
    
    // Wait for the transaction to be mined
    let receipt = null;
    let attempts = 0;
    while (!receipt && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      receipt = await makeRpcCall('eth_getTransactionReceipt', [txHash]);
      attempts++;
      console.log(`Waiting for transaction to be mined... (attempt ${attempts})`);
    }
    
    if (!receipt) {
      throw new Error('Transaction not mined after 30 seconds');
    }
    
    console.log('Contract deployed successfully!');
    console.log('Contract address:', receipt.contractAddress);
    
    return receipt.contractAddress;
    
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

// Helper function to make JSON-RPC calls
function makeRpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1
    });
    
    const options = {
      hostname: '127.0.0.1',
      port: 8545,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Run deployment
if (require.main === module) {
  deploySimpleContract()
    .then((address) => {
      console.log('\n=== DEPLOYMENT SUCCESSFUL ===');
      console.log('Contract Address:', address);
      console.log('\nUpdate CONTRACT_ADDRESS in src/lib/viem.ts with this address:');
      console.log(`export const CONTRACT_ADDRESS = '${address}' as const`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deploySimpleContract };