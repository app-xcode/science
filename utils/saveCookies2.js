import fs from 'fs';

/**
 * Simpan cookies ke cookies.json dengan merge (cookie lama + baru).
 * @param {string[]} setCookies - Array string cookie dari response header 'set-cookie'
 */
export default function saveCookies2(setCookies) {
  const filePath = './cookies.json';

  // load cookie lama
  let cookies = [];
  if (fs.existsSync(filePath)) {
    cookies = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // parse cookie baru
  const parsedCookies = setCookies.map(cookieStr => {
    const [nameValue, ...attrs] = cookieStr.split('; ');
    const [name, value] = nameValue.split('=');

    const cookieObj = { name, value };
    attrs.forEach(attr => {
      const [attrName, attrValue] = attr.split('=');
      cookieObj[attrName.toLowerCase()] = attrValue || true;
    });

    return cookieObj;
  });

  // merge: replace kalau ada nama sama, kalau belum ada → push
  parsedCookies.forEach(newCk => {
    const idx = cookies.findIndex(c => c.name === newCk.name);
    if (idx >= 0) {
      cookies[idx] = newCk;
    } else {
      cookies.push(newCk);
    }
  });

  // simpan ulang
  fs.writeFileSync(filePath, JSON.stringify(cookies, null, 2));
}
