#!/bin/bash

# ZK Setup Ceremony Automation Script for Black IntelliSense
# This script handles the full pipeline for multiple circuits

set -e # Exit on error

PROJECT_DIR="/home/pc/.openclaw/workspace/black-Intellisense-Live/zk"
CIRCUIT_DIR="$PROJECT_DIR/circuits"
SETUP_DIR="$PROJECT_DIR/setup"
CIRCOM_BIN="/home/pc/.openclaw/workspace/black-Intellisense-Live/zk/circom"

# List of circuits to process
CIRCUITS=("solvency" "identity")

echo "🚀 Starting ZK Setup Ceremonies..."

for CIRCUIT_NAME in "${CIRCUITS[@]}"; do
    echo "---------------------------------------------------"
    echo "Processing Circuit: $CIRCUIT_NAME"
    echo "---------------------------------------------------"

    # 1. Compile Circuit
    echo "📦 Compiling $CIRCUIT_NAME..."
    cd $CIRCUIT_DIR
    $CIRCOM_BIN $CIRCUIT_NAME.circom -l /home/pc/.npm-global/lib/node_modules/circomlib/circuits --r1cs --wasm

    # 2. Trusted Setup (Groth16)
    echo "🔑 Performing Trusted Setup for $CIRCUIT_NAME..."
    cd $SETUP_DIR

    # Phase 1: Powers of Tau (Simplified for demo)
    echo "my-secret-entropy-123" | snarkjs powersoftau new bn128 12 ${CIRCUIT_NAME}_pot12_0000.ptau -v
    echo "my-secret-entropy-456" | snarkjs powersoftau contribute ${CIRCUIT_NAME}_pot12_0000.ptau ${CIRCUIT_NAME}_pot12_0001.ptau --name="Contribution" -v
    snarkjs powersoftau prepare phase2 ${CIRCUIT_NAME}_pot12_0001.ptau ${CIRCUIT_NAME}_pot12_final.ptau -v

    # Phase 2: Circuit Setup
    snarkjs groth16 setup $CIRCUIT_DIR/$CIRCUIT_NAME.r1cs ${CIRCUIT_NAME}_pot12_final.ptau ${CIRCUIT_NAME}_0000.zkey
    echo "my-secret-entropy-789" | snarkjs zkey contribute ${CIRCUIT_NAME}_0000.zkey ${CIRCUIT_NAME}_final.zkey --name="Contributor" -v

    # 3. Export Keys and Verifier
    echo "📝 Generating verification key..."
    snarkjs zkey export verificationkey ${CIRCUIT_NAME}_final.zkey ${CIRCUIT_NAME}_verification.key

    echo "📜 Exporting verifier to Solidity..."
    snarkjs zkey export solidityverifier ${CIRCUIT_NAME}_final.zkey ${CIRCUIT_NAME}_Verifier.sol
    
    echo "✅ $CIRCUIT_NAME Setup Complete!"
done

echo "---------------------------------------------------"
echo "🎉 All ZK Setup Ceremonies Completed!"
