import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

async function sha256ToHexStringAsync(message: string) {
    const hashBuffer = await sha256ToArrayBufferAsync(message);
    const hashHex = arrayBufferToHexString(hashBuffer)
    return hashHex;
}

function arrayBufferToHexString(buffer: ArrayBuffer) {
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(buffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function sha256ToArrayBufferAsync(message: string) {
    // encode as UTF-8
    const msgBuffer = getMessageEncoding(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    return hashBuffer;
}

// TODO 
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
// https://github.com/mdn/dom-examples/blob/main/web-crypto/encrypt-decrypt/aes-gcm.js
// https://github.com/mdn/dom-examples/blob/main/web-crypto/import-key/raw.js

function importSecretKeyAsync(rawKey: ArrayBuffer) {
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

    const keyBuffer = await sha256ToArrayBufferAsync(password);
    const secretKey = await importSecretKeyAsync(keyBuffer)
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

    const ciphertext = arrayBufferToHexString(ciphertextBuffer);
    return { ciphertextBuffer, ciphertext };
}

// TODO : find a way to convert string to ArrayBuffer
// TODO : I think in one of the code examples above, hv one that does that
// TODO : .buffer doesnt work, need to find the longer way to do so https://stackoverflow.com/questions/37228285/uint8array-to-arraybuffer
async function decryptMessageAsync(password: string, ciphertextBuffer: ArrayBuffer) {

    const keyBuffer = await sha256ToArrayBufferAsync(password);
    const secretKey = await importSecretKeyAsync(keyBuffer)
    // const encodedCiphertext = getMessageEncoding(ciphertext);

    // constant iv
    // not recommended but this is so that can keep using the same passphrase
    const iv = new Uint8Array(12);

    let decryptedBuffer = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        secretKey,
        ciphertextBuffer
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

            const { ciphertextBuffer, ciphertext } = await encryptMessageAsync(inputPassword, inputText);

            // TODO : testing decryption
            const decryptedText = await decryptMessageAsync(inputPassword, ciphertextBuffer);
            // const decryptedText = await decryptMessageAsync("123", ciphertextBuffer); // TODO : Wrong password handling. Cuz... it freezes lol
            console.log("decrypted:", decryptedText);

            return { output: ciphertext };
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
