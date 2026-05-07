pragma circom 2.0.0;

include "comparators.circom";

template Solvency() {
    // Private input: Saldo asli user
    signal input balance;
    // Public input: Ambang batas minimum yang diminta
    signal input threshold;
    
    // Output: 1 jika solvent (balance >= threshold), 0 jika tidak
    signal output isSolvent;

    // Menggunakan GreaterEqThan dari circomlib untuk mengecek balance >= threshold
    component geq = GreaterEqThan(252); // Mendukung angka sampai 2^252
    geq.in[0] <== balance;
    geq.in[1] <== threshold;

    isSolvent <== geq.out;
}

component main = Solvency();
