//untuk editTokenya kita tappilkan dulu brwosernya kemudian dapatkan cookienya dari browser, nanti request header cookie kita ganti dengan cookie dari browser, kalau tidak bisa kita get data pakai puppeteer atau layaknya browser
// =====================================
// Import Module
// =====================================
import express from 'express';
import session from 'express-session';
import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import mime from 'mime-types';
import cookieParser from 'cookie-parser';

import replaceData from './utils/replaceData.js';
import fixStyle from './utils/fixStyle.js';
import fixContent from './utils/fixContent.js';
import getContentType from './utils/getContentType.js';
import saveCookies2 from './utils/saveCookies2.js';


// =====================================
// Konfigurasi Dasar
// =====================================
const app = express();
const port = 3000;
const dir = 'files';

// Pastikan folder penyimpanan ada
if (!fs.existsSync(dir)) {
    fs.mkdir(dir, (err) => { });
}

// =====================================
// Load Cookies
// =====================================
function buildCookieHeader() {
    const cookiesFile = fs.existsSync("cookies.json")
        ? JSON.parse(fs.readFileSync("./cookies.json", "utf8"))
        : [];
    return cookiesFile.length
        ? cookiesFile.map(c => `${c.name}=${c.value.replace(/;Version.*$/, '')}`).join("; ")
        : "nama_cookie=nilai_cookie;";
}

// =====================================
// Header Default untuk Axios
// =====================================
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

// =====================================
// Fungsi Utilitas
// =====================================
const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

const parseCookies = (cookieString) => {
    const cookies = {};
    cookieString.split(';').forEach(cookie => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        cookies[name] = value;
    });
    return cookies;
};

async function saveCookies(page) {
    const cookies = await page.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
}

async function loadCookies(page) {
    let cookies = [];
    if (fs.existsSync('cookies.json')) {
        cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf-8'))
            .filter(c => c.domain || c.url)
            .map(c => {
                if (!c.url && c.domain) {
                    c.url = `https://${c.domain.replace(/^\./, '')}`;
                }
                return c;
            });
    }

    if (cookies.length) {
        await page.setCookie(...cookies);
    }
}

const fetchData = async (url, cookies) => {
  return await fetch(url, {
    method: 'GET',
    headers: {
       "cookie": cookies,
    },
  })
  .then(response => response.status==200 ? response.text() : `Error: ${response.status} ${response.statusText} - cookies: ${cookies}`)
  .catch(error => {
    console.error('Error fetching data:', error);
    throw error;
  });
};

const getFile = async (url, t = true) => {
    if (md5(url) === '781e8490b27c71f3118aff829e2dff03') {
        return { data: {}, type: 'application/json' };
    }
    const file = `${dir}/${md5(url)}`;
    const type = mime.lookup(file);
    if (fs.existsSync(file)) {
        return t
            ? fs.readFileSync(file, 'utf8')
            : {
                data: fs.createReadStream(file), type: type || await getContentType(url) || 'text/html'
            };
    }
    return undefined;
};

const getAssets = (url, t = false) => {
    const file = url.replace(/^\//, '');
    const type = mime.lookup(file);
    if (fs.existsSync(file) && file.length > 0) {
        return t
            ? fs.readFileSync(file, 'utf8')
            : { data: fs.createReadStream(file), type: type || 'text/html' };
    }
    return undefined;
};

const saveFile = async (url, content, i = 0) => {
    fs.writeFile(`${dir}/${md5(url)}`, content, () => {
        console.log(md5(url), url, i);
    });
};

// =====================================
// Fungsi Konten
// =====================================

const getContent = async (url, Heads = {}) => {
    try {
        const tmp = await getFile(url);
        if (tmp) return tmp;

        const res = await axios.get(url, { headers: Heads, responseType: 'arraybuffer' });
        const setCookies = res.headers['set-cookie'];
        if (setCookies) saveCookies2(setCookies);
        return res.data;
    } catch (error) {
        console.error('getContent Error:', url, error.message);
        return null;
    }
};


// =====================================
// Fungsi Fix Konten
// =====================================
function stringToRegexLiteral(str) {
    return new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
}

// =====================================
// Middleware
// =====================================
app.use(session({
    secret: 'x.code',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 }
}));

app.use(cookieParser());

// =====================================
// Routing
// =====================================
app.get('*', async (req, res) => {
    req.session.doccookie = Object.entries(req.cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    // console.log('Cookies:', req.session.doccookie);

    req.originalUrl = req.originalUrl.replace('/?url=/', '/');

    if (req.originalUrl.includes('logout-x.code')) {
        const cc = req.session.doccookie;
        req.session.destroy();
        return res.send(cc);
    }

    try {
        const requestedUrl = `https://www.sciencedirect.com`;

        // 1. Cek file replace
        const replace = replaceData(req.originalUrl);
        if (replace) {
            res.setHeader('Content-Type', replace.type);
            if (replace.type.includes('pdf')) {
                res.setHeader('Content-Disposition', 'inline; filename="file.pdf"');
                return replace.data.pipe(res);
            }
            return res.send(replace.data);
        }

        // 2. Cek assets
        const assets = getAssets(req.originalUrl);
        if (assets) {
            res.setHeader('Content-Type', assets.type);
            return assets.data.pipe(res);
        }

        const url = requestedUrl + req.originalUrl;
        // 2.1 Bypass body json
        if ((url.includes('body') && url.includes('entitledToken')) || (url.includes('references') && url.includes('entitledToken'))) {
            const out = await fetchData(url,buildCookieHeader());
            res.setHeader('Content-Type', 'application/json');
            return res.send(out);
        }
        // 3. Cek cache file
        const tmp = await getFile(url, 0);
        if (tmp) {
            res.setHeader('Content-Type', tmp.type);
            return tmp.data.pipe(res);
        }
        // 4. Ambil content-type
        const type = url.includes('pdfft') && url.includes('.pdf') ? 'pdf' : await getContentType(url, headersAXIO());
        if (type === 'login') return res.redirect(302, 'https://id.elsevier.com');
        if (type === 'pdf') return res.redirect(302, url);
        // 6. Jika bukan HTML navigasi
        if (type) {
            var konten = type.data ? type.data : await getContent(url, { ...headersAXIO(), Cookie: req.session.doccookie || buildCookieHeader() });
            if (Buffer.isBuffer(konten)) {
                konten = konten.toString('utf8');
                konten = await fixStyle(konten);
                konten = await fixContent(konten);
            } else {
                console.log('Unknown:', typeof konten, url);
            }
            if (konten && !konten.includes('entitledToken')) {
                await saveFile(url, konten, 1);
            }
            res.setHeader('Content-Type', type.type ? type.type : 'text/html');
            res.setHeader('Set-Cookie', buildCookieHeader().split('; ').map(c => c.trim()));
            return res.send(konten);
        }
        const fetchMode = req.get('Sec-Fetch-Mode');
        const patt = /javascript|css|file|image/g;

        // 5. Puppeteer
        if (fetchMode === 'navigate' || !patt.test(type)) {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent(headersAXIO()['User-Agent']);

            const urlGo = url;
            await page.goto(urlGo, { waitUntil: 'domcontentloaded' });
            await saveCookies(page);

            let pageContent = await page.content();
            await browser.close();

            pageContent = await fixStyle(pageContent);
            pageContent = await fixContent(pageContent);
            if (!pageContent.includes('entitledToken')) await saveFile(url, pageContent, 2);
            res.setHeader('Set-Cookie', buildCookieHeader().split('; ').map(c => c.trim()));
            return res.send(pageContent);
        }

        return res.status(404).send('Halaman tidak ditemukan.');
    } catch (error) {
        console.error(error);
        const fer = 'assets/error.html';
        if (fs.existsSync(fer)) {
            // return res.status(500).send(fs.readFileSync(fer, 'utf8'));
            return res.status(500).send('500 - Terjadi kesalahan pada server.');
        }
        return res.status(500).send('Terjadi kesalahan saat mengambil data.');
    }
});

// =====================================
// Start Server
// =====================================
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
