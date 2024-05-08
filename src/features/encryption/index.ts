import { arrayBufferToHexString, getMessageEncoding, hexStringToArrayBuffer, sha256ToArrayBufferAsync } from "./utils";

/* References
https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
https://github.com/mdn/dom-examples/blob/main/web-crypto/encrypt-decrypt/aes-gcm.js
https://github.com/mdn/dom-examples/blob/main/web-crypto/import-key/raw.js
*/

async function importSecretKeyAsync(password: string) {

    const rawKey = await sha256ToArrayBufferAsync(password);

    return window.crypto.subtle.importKey(
        "raw",
        rawKey,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptMessageAsync(password: string, message: string) {

    const secretKey = await importSecretKeyAsync(password)
    const encodedMessage = getMessageEncoding(message);

    // constant iv
    // not recommended but this is so that can keep using the same passphrase
    const iv = new Uint8Array(12);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        secretKey,
        encodedMessage
    );

    const encryptedMessage = arrayBufferToHexString(ciphertextBuffer);
    return encryptedMessage;
}

export async function decryptMessageAsync(password: string, encryptedMessage: string) {

    const secretKey = await importSecretKeyAsync(password)
    const encryptedMessageBuffer = hexStringToArrayBuffer(encryptedMessage);

    // constant iv
    // not recommended but this is so that can keep using the same passphrase
    const iv = new Uint8Array(12);

    let decryptedBuffer = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        secretKey,
        encryptedMessageBuffer
    );

    let decoder = new TextDecoder();
    const message = decoder.decode(decryptedBuffer);

    return message;
}