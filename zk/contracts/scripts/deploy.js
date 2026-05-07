import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("🚀 Deploying ZK Verifier Contract...");

  // Ambil deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Verifier contract
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();

  await verifier.waitForDeployment();

  const address = await verifier.getAddress();
  console.log("✅ Verifier deployed to:", address);
  
  // Simpan address ke file untuk digunakan oleh backend API
  const fs = await import('fs');
  fs.writeFileSync('deployed_address.txt', address);
  console.log("📝 Address saved to deployed_address.txt");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
