import axios from 'axios';
import saveCookies2 from './saveCookies2.js';
import fs from 'fs';
import fetch from "node-fetch";
import fetchCookie from "fetch-cookie";

const headersAXIO = function () {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36' + (new Date()).getTime(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.sciencedirect.com/',
        'Cache-Control': 'no-cache',
    }
};

function buildCookieHeader() {
    const cookiesFile = fs.existsSync('cookies.json')
        ? JSON.parse(fs.readFileSync('./cookies.json', 'utf8'))
        : [];
    return cookiesFile?.length
        ? cookiesFile.map(c => `${c.name}=${c.value.replace(/;Version.*$/, '')}`).join('; ')
        : '';
}

async function fetchContentType(url, Headers = {}) {

    try {
        const fetchWithCookies = fetchCookie(fetch);
        const res = await fetchWithCookies(url, {
            headers: Headers
        });
        const contentType = res.headers.get("content-type") || "application/octet-stream";
        const buffer = await res.arrayBuffer();

        return { type: contentType, data: Buffer.from(buffer).toString() };
    } catch (err) {
        console.error("getContentType Error:", err.message, url);
        return null;
    }
}

export default async function getContentType(url, Heads = {}, retry = 1) {
    const lowerUrl = url.toLowerCase();
    const quickMap = {
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.css': 'text/css',
        '.js': 'application/javascript'
    };

    for (const ext in quickMap) {
        if (lowerUrl.includes(ext)) {
            console.error('getContentType:', ext, url);
            return quickMap[ext];
        }
    }

    if (/\.(pdf)$/i.test(url)) return 'application/pdf';
    if (/user\//i.test(url)) return 'login';

    try {
        const res = await axios.get(url, {
            headers: {
                ...Heads,
                Cookie: buildCookieHeader()  // selalu refresh cookie terbaru
            },
            responseType: 'arraybuffer'
        });

        const setCookies = res.headers['set-cookie'];
        if (setCookies) {
            saveCookies2(setCookies); // update cookies.json
            console.log('Cookies: ' + buildCookieHeader());
        }

        return { type: res.headers['content-type'], data: res.data } || null;

    } catch (err) {
        const res = err.response; // ambil dari response error
        console.error('getContentType Error:', err.message, url, retry);

        if (res && res.status === 403 && retry <= 10) {
            // refresh Cookie lalu retry sekali lagi
            // return await fetchContentType(url, headersAXIO());
            return null;
        } else if (res && res.status === 404) {
            return { type: 'text/html', data: '<h1>404 Not Found</h1>' };
        }
        return null;
    }
}
