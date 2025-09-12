import fs from 'fs';
import mime from 'mime-types';

const getAssets = (url, t = false) => {
    const file = url.replace(/^\//, '');
    const type = mime.lookup(file);
    if (fs.existsSync(file) && file.length > 0) {
        return t
            ? fs.readFileSync(file, 'utf8')
            : { data: fs.createReadStream(file), type };
    }
    return undefined;
};

export default function replaceData(url) {
    const replace = [
         ['/elsevier-non-solus-new-grey.svg', 'elsevier-non-solus-new-grey.svg', 'image/svg+xml'],
         ['/elsevier-non-solus.svg', 'elsevier-non-solus.svg', 'image/svg+xml'],
         ['/elsevier-non-solus-new-with-wordmark.svg', 'elsevier-non-solus-new-with-wordmark.svg', 'image/svg+xml'],
         ['/logo-relx-tm.svg', 'logo-relx-tm.svg', 'image/svg+xml'],
         ['/body?entitledToken', '/replace/data-body.json', 'application/json'],
        ['/journal/07380593/abstract?pii=S0738059325000902', '/replace/abstrak.json', 'application/json'],
        ['/science/article/pii/S0738059325000902/pdfft?md5=aa2473d6be38f6e920afc104c8946263&pid=1-s2.0-S0738059325000902-main.pdf', 'replace/1-s2.0-S0738059325000902-main.pdf', 'application/pdf']
    ];

    let result = '';
    let type = 'text/html';

    replace.forEach(([x, y, z]) => {
        if (url === x) {
            result = y;
            type = z;
        }
    });
    if((url.includes('/sdfe/arp/pii/S0738059325000902/body') && url.includes('entitledToken'))){
        result = '/replace/data-body.json';
        type = 'application/json';
    }
    if((url.includes('/sdfe/arp/pii/S0738059325000902/references') && url.includes('entitledToken'))){
        result = '/replace/references.json';
        type = 'application/json';
    }
    if(url==='/science/article/pii/S0738059325000902' || (url.includes('/science/article/pii/S0738059325000902/') && !url.includes('pdfft'))) {
        result = 'replace/c912863f8d416daac46a4b853a44d228';
        type = 'text/html';
    }
    if(url==='/sdfe/arp/pii/S0738059325000902/toc') {
        result = 'replace/474d95385ea4491432273961a18d9812';
        type = 'application/json';
    }
    // if((url.includes('references') && url.includes('entitledToken'))){
    //     result = '/replace/references.json';
    //     type = 'application/json';
    // }

    return getAssets(result, true)
        ? {
            data: type.includes('pdf') ? fs.createReadStream(result) : getAssets(result, true),
            type
        }
        : undefined;
}
