export default async function fixStyle(content) {
    const fix = [
        [/https\:\/\/.*\/(ElsevierSansWeb-Regular\.woff2)/, '/assets/ElsevierSansWeb-Regular.woff2'],
        [/https\:\/\/.*\/(client\.css)/, '/assets/client.css'],
        [/https\:\/\/.*\/(style\.css)/, '/assets/style.css'],
        [/href='[^']*\/(arp\.css)'/, 'href=\'/assets/arp.css\''],
        [/href="[^"]*\/(arp\.css)"/, 'href="/assets/arp.css"'],
        // [/src="[^"]*\/(arp\.js)"/, 'src="/assets/arp.js"'],
        // [/src="[^"]*\/(arp\.js)"/, 'src="/assets/arp.js"'],
        // [/href="[^"]*\/(arp\.js)"/, 'href="/assets/arp.js"'],
        // [/src="[^"]*\/(react\-dom\.production\.min\.js)"/, 'src="/assets/react-dom.production.min.js"'],
        // [/src="[^"]*\/(react\.production\.min\.js)"/, 'src="/assets/react.production.min.js"'],
        // [/href="[^"]*\/(react\-dom\.production\.min\.js)"/, 'href="/assets/react-dom.production.min.js"'],
        // [/href="[^"]*\/(react\.production\.min\.js)"/, 'href="/assets/react.production.min.js"'],
        // [/href="[^"]*\/(ai\-components\?componentVersion\=V14)"/, 'href="/assets/ai-components.js"'],

        [/src="[^"]*\/(elsevier\-non\-solus\-new\-grey\.svg)"/, 'src="/assets/elsevier-non-solus-new-grey.svg"'],
        [/src="[^"]*\/(elsevier\-non\-solus\.svg)"/, 'src="/assets/elsevier-non-solus.svg"'],
        [/src="[^"]*\/(elsevier\-non\-solus\-new\-with\-wordmark\.svg)"/, 'src="/assets/elsevier-non-solus-new-with-wordmark.svg"'],
        [/src="[^"]*\/(logo\-relx\-tm\.svg)"/, 'src="/assets/logo-relx-tm.svg"'],
        // [/\/feature\/assets\/ai\-components\?componentVersion\=V14/, '/assets/ai-components.js'],
        [/\/feature\/assets\/ai\-components\?componentVersion\=V14/, 'https://sdfestaticassets-eu-west-1.sciencedirectassets.com/prod/14.15.23/ai-components.js'],
        // [/https:\/\/www\.sciencedirect\.com\/feature\/assets\/ai\-components\?componentVersion\=V14/, '/assets/ai-components.js'],
        [/\/feature\/assets\/ai\-navigation\?componentVersion\=V1/, '/assets/ai-navigation.js'],
        // ['<head>', `<head><link rel="stylesheet" type="text/css" href="/assets/client.css"><link rel="stylesheet" type="text/css" href="/assets/style.css">`],
    ];

    if (typeof content === 'string') {
        fix.forEach(([x, y]) => {
            content = content.replace(x, y);
        });
    }

    return await content;
}
