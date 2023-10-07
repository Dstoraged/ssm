import cryptoJS from "crypto-js"
import utils from "@/utils/utils"

const Crypto = {
    toHexString(s) {
        let str = "";
        for (let i = 0; i < s.length; i++) {
            let ch = s.charAt(i).charCodeAt();
            let s4 = (ch & 0xFF).toString(16);
            if (s4.length == 1) {
                s4 = '0' + s4;
            }
            str = str + s4;

        }
        return str;
    },
    hexToString(hex) {
        let reStr = "";
        for (let c = 0; c < hex.length; c += 2)
            reStr += String.fromCharCode(parseInt(hex.substr(c, 2), 16));

        return reStr;
    },
    // Convert a hex string to a byte array
    hexToBytes(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
            var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
            hex.push((current >>> 4).toString(16));
            hex.push((current & 0xF).toString(16));
        }
        return hex.join("");
    },

    rc4(str, key, isarr = false) {
        var s = [], j = 0, x, res = '';
        for (var i = 0; i < 256; i++) {
            s[i] = i;
        }
        for (i = 0; i < 256; i++) {
            let keyL = Array.isArray(key) ? key[i % key.length] : key.charCodeAt(i % key.length)
            j = (j + s[i] + keyL) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
        }
        i = 0;
        j = 0;
        let arr = []

        for (var y = 0; y < str.length; y++) {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
            if (isarr) {
                arr.push(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256])

            } else {
                res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);

            }
        }
        if (isarr) {
            return arr;
        }
        return res
    },

    md5(text) {
        let md5 = cryptoJS.MD5(text)
        md5 = md5.toString()

        return md5
    },
    HmacSHA256(text) {
        let ni = utils.random();
        let shad = cryptoJS.HmacSHA256(ni, text).toString();

        return {
            sin: shad.toString(),
            ni
        }
    },
    encrypt(key, name = "enc_ni", text) {
        text = text || utils.random();
        let red = this.rc4(text, key);
        let encrypted = this.md5(this.toHexString(red));
        return {
            [name]: encrypted,
            ni: text
        }
    },
}

export default Crypto;