import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

async function sha256Async(message: string) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// TODO 
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
// https://github.com/mdn/dom-examples/blob/main/web-crypto/encrypt-decrypt/rsa-oaep.js

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

            const passwordHash = await sha256Async(inputPassword);

            // TODO : Async encrypt
            const encryptedText = inputText + passwordHash;

            return { output: encryptedText };
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
