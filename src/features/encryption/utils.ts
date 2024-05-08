export function getMessageEncoding(message: string) {
    const enc = new TextEncoder();
    return enc.encode(message);
}

export async function sha256ToArrayBufferAsync(message: string) {
    // encode as UTF-8
    const msgBuffer = getMessageEncoding(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    return hashBuffer;
}

export function arrayBufferToHexString(buffer: ArrayBuffer) {
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(buffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function hexStringToArrayBuffer(hexString: string) {
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
