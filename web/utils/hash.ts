// fn par chatgpt

// on calcule un hash (nombre entre 0 et 359) depuis une chaine de caractère quelconque
// les chaines proches non pas un hash proche.
export function fnv1aHash(str: string): number { 
    let hash = 0x811c9dc5; // FNV offset basis (32-bit)
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193); // FNV prime
    }
    return (hash >>> 0) % 360; // 32-bit
}