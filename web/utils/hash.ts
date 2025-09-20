export function fnv1aHash(str: string): number { // chatgpt
    let hash = 0x811c9dc5; // FNV offset basis (32-bit)
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193); // FNV prime
    }
    return (hash >>> 0) % 360; // 32-bit
}