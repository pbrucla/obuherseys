
const crypto = require('crypto');

// 'Blowfish' is an insecure algorithm
async function main() {
    try {
        const algorithm = 'Blowfish'; 
        const cipher = crypto.createCipheriv(algorithm, crypto.randomBytes(8), null); // Generate a random key
        const encrypted = cipher.update('some plaintext data', 'utf8', 'hex') + cipher.final('hex');

        console.log('Encrypted:', encrypted);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
