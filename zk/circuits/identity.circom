pragma circom 2.0.0;

include "poseidon.circom";

template IdentityVerification() {
    // Private inputs: User's secret and ID
    signal input userId;
    signal input secret;
    
    // Public input: The commitment (Hash of ID and Secret)
    signal input commitment;
    
    // Poseidon Hash is the standard for ZK-SNARKs due to efficiency
    component hasher = Poseidon(2);
    hasher.inputs[0] <== userId;
    hasher.inputs[1] <== secret;
    
    // Constrain that the computed hash must equal the public commitment
    hasher.out === commitment;
}

component main = IdentityVerification();
