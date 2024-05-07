import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

/* References
https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
https://github.com/mdn/dom-examples/blob/main/web-crypto/encrypt-decrypt/aes-gcm.js
https://github.com/mdn/dom-examples/blob/main/web-crypto/import-key/raw.js
*/

function arrayBufferToHexString(buffer: ArrayBuffer) {
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(buffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function hexStringToArrayBuffer(hexString: string) {
    // Reference: https://gist.github.com/don/871170d88cf6b9007f7663fdbc23fe09

    // remove the leading 0x
    hexString = hexString.replace(/^0x/, '');

    // ensure even number of characters
    if (hexString.length % 2 != 0) {
        console.error('WARNING: expecting an even number of characters in the hexString');
    }

    // check for some non-hex characters
    var bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
        console.error('WARNING: found non-hex characters', bad);
    }

    // split the string into pairs of octets
    var pairs = hexString.match(/[\dA-F]{2}/gi);
    if (!pairs) {
        console.error('WARNING: unable to split into pairs');
    }

    // convert the octets to integers
    var integers = pairs!.map(function (s) {
        return parseInt(s, 16);
    });

    var array = new Uint8Array(integers);
    // console.log(array);

    return array.buffer;
}

async function sha256ToArrayBufferAsync(message: string) {
    // encode as UTF-8
    const msgBuffer = getMessageEncoding(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    return hashBuffer;
}

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

function getMessageEncoding(message: string) {
    const enc = new TextEncoder();
    return enc.encode(message);
}

async function encryptMessageAsync(password: string, message: string) {

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

async function decryptMessageAsync(password: string, encryptedMessage: string) {

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

export function InnerApp() {

    const inputPasswordRef = useRef<HTMLInputElement>(null);
    const inputTextRef = useRef<HTMLTextAreaElement>(null);

    const outputQuery = useQuery({
        queryKey: ["outputQuery"],
        queryFn: async () => {

            if (!inputPasswordRef.current || !inputTextRef.current)
                throw new Error("Unable to find DOM elements!");

            // Get from DOM directly cuz useState is queued
            const inputPassword = inputPasswordRef.current.value;
            const inputText = inputTextRef.current.value;

            const encryptedMessage = await encryptMessageAsync(inputPassword, inputText);

            // TODO : testing decryption
            const decryptedText = await decryptMessageAsync(inputPassword, encryptedMessage);
            // const decryptedText = await decryptMessageAsync("123", ciphertext); // TODO : Wrong password handling. Cuz... it freezes lol
            console.log("decrypted:", decryptedText);

            return { output: encryptedMessage };
        },
    })

    function onInputChanged() {
        outputQuery.refetch();
    }

    function getOutputText() {
        if (outputQuery.isPending || outputQuery.isFetching)
            return "Loading...";

        if (outputQuery.error)
            return outputQuery.error.message;

        return outputQuery.data.output;
    }

    return (
        <div className="h-dvh flex flex-col justify-center items-center gap-4 p-4 w-full max-w-screen-sm">
            <h1 className="font-bold text-2xl sm:text-3xl text-white">Mini Text Encryptor</h1>

            <div className="flex gap-2">
                <p className="text-white">Password:</p>
                <input ref={inputPasswordRef} type="password" className="rounded-md px-2" onChange={() => onInputChanged()} />
            </div>

            <div className="w-full flex-grow flex flex-col gap-2">
                <h2 className="text-white font-bold">Raw Text:</h2>
                <textarea
                    ref={inputTextRef}
                    className="rounded-md w-full flex-grow p-2 resize-none"
                    onChange={() => onInputChanged()}
                />
            </div>

            <div className="w-full flex-grow flex flex-col gap-2">
                <h2 className="text-white font-bold">Encrypted Text:</h2>
                <textarea
                    className="rounded-md w-full flex-grow p-2 resize-none"
                    value={getOutputText()}
                    readOnly
                />
            </div>
        </div>
    );
}
