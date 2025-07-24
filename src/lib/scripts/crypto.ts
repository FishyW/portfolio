// heavily inspired (i.e "heavily copied") from the below 
// https://bradyjoslin.com/posts/webcrypto-encryption


async function nullWrapper<T>(func: () => null | T) {
    try {
        return await func();
    } catch(e) {
        return null;
    }
}


const SALT_SIZE = 16;
const IV_SIZE = 12;
const ITERATIONS = 250000;

// given a password and the file contents encrypt the contents
// returns a UTF-8 string
export async function encrypt(password: string, data: string) {
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
    // doesn't exactly convert to a base64 string, it converts to a base64 "url"

    const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), 
        "PBKDF2", false, ["deriveKey"]);
    const aesKey = await window.crypto.subtle.deriveKey(
        {name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256"},
            key, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);

    const encryptedData = await window.crypto.subtle.encrypt({name: "AES-GCM", iv}, 
        aesKey, new TextEncoder().encode(data));
    
    const encryptedBuffer = new Uint8Array(encryptedData);

    const buf = new Uint8Array(salt.byteLength 
        + iv.byteLength + encryptedBuffer.byteLength);
    
    
    buf.set(salt, 0);
    buf.set(iv, salt.byteLength);
    buf.set(encryptedBuffer, salt.byteLength + iv.byteLength);
    
    // convert to base64
    // can't use textencoder since we're dealing with
    // binary data, the input/output isn't bidirectional
    return buf.buffer;    
}

async function decryptInternal(password: string, data: ArrayBuffer) {
    const buf = new Uint8Array(data);
    const salt = buf.slice(0, SALT_SIZE);
    const iv = buf.slice(16, SALT_SIZE + IV_SIZE);
    const encrypted = buf.slice(SALT_SIZE + IV_SIZE);
    

    const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), 
        "PBKDF2", false, ["deriveKey"]);
        
    const aesKey = await window.crypto.subtle.deriveKey(
        {name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256"},
            key, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);

        
    const decrypted = await window.crypto.subtle.decrypt({
            name: "AES-GCM", iv: iv,
        }, aesKey, encrypted
    );
    return new TextDecoder().decode(decrypted);
}

export async function decrypt(password: string, data: ArrayBuffer) {
    return nullWrapper(() => decryptInternal(password, data));
}