const crypto = require('crypto');

// Five different variables are set to names of different insecure and secure ciphers. One variable containing a secure algo is then used to initialize the cipher.
async function main() {
    try {
        const algo1 = Identity('des'); 
        const algo2 = Identity('aes-256-gcm');
        const algo3 = Identity('md5');
        const algo4 = Identity('sha1');
        const algo5 = Identity('md2');
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(algo2, key, iv); // Generate a random key
        const encrypted = cipher.update('some plaintext data', 'utf8', 'hex') + cipher.final('hex');
        const tag = cipher.getAuthTag();
        console.log('Encrypted:', encrypted);
        console.log('Auth Tag:', tag);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function Identity(s) {
    return s;
}

main();
