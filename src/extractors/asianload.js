import CryptoJS from 'crypto-js';

const keys = {
    key: CryptoJS.enc.Utf8.parse('93422192433952489752342908585752'),
    iv: CryptoJS.enc.Utf8.parse('9262859232435825'),
};

/**
 * Parses the embedded video URL to encrypt-ajax.php parameters
 * @param {cheerio} $ Cheerio object of the embedded video page
 * @param {string} id Id of the embedded video URL
 */
export async function generateEncryptAjaxParameters($, id) {
    // encrypt the key
    const encrypted_key = CryptoJS.AES['encrypt'](id, keys.key, {
        iv: keys.iv,
    }).toString();

    const script = $("script[data-name='crypto']").data().value;
    const token = CryptoJS.AES['decrypt'](script, keys.key, {
        iv: keys.iv,
    }).toString(CryptoJS.enc.Utf8);

    return 'id=' + encrypted_key + '&alias=' + id + '&' + token;
}
/**
 * Decrypts the encrypted-ajax.php response
 * @param {object} obj Response from the server
 */
export function decryptEncryptAjaxResponse(obj) {
    const decrypted = CryptoJS.enc.Utf8.stringify(
        CryptoJS.AES.decrypt(obj.data, keys.key, {
            iv: keys.iv,
        })
    );
    return JSON.parse(decrypted);
}
