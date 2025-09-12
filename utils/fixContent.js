import { JSDOM } from "jsdom";
function stringToRegexLiteral(str) {
    return new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
}

export default  async function fixContent(content) {
    const fix = [
        
        [/Improving the Quality of Basic Education in ASEAN: Emerging Challenges and Reforms|Improving the quality of basic education in ASEAN–Emerging challenges and reforms/gi,
            `An Online Learning Approach For Individuals In Eastern Indonesia's Underdeveloped, Frontier, And Outermost Regions (3T) For Open And Distance Education`],

        [stringToRegexLiteral(`Southeast Asia has made remarkable progress...`),
            `This study examines the variables that affect adult learners' performance in online learning (OL) ...`],

        [/AuthorGroups|author-group/gi, ``],
        [/M. Niaz|Niaz/gi, `Jimmi`],
        [/Asadullah/gi, `Asmara`],
        [/Amir Hamza/gi, `Rusijono`],
        [/Jilani/gi, ``],
        [/Siwage Dharma/gi, `Andi`],
        [/Negara/gi, `Kristanto`],
        [/"Daniel Suryadarma"/gi, `"Zet Yulius Baitanu","Anastasia Moertodjo", "Ragil Sugeng Dewantoro"`],
        [/Daniel/gi, `Zet Yulius`],
        [/<sup>d<\/sup>/gi, `<sup></sup>`],
        [/<span class="text surname">Suryadarma/gi,
            `<span class="text surname">Baitanu</span></span>...`],
        [/Suryadarma/gi, `Baitanu, Anastasia Moertodjo, Ragil Sugeng Dewantoro`],
        [/<li><span class="ag-name-affiliation"><span class="ag-name">Zet Yulius Baitanu...<\/span><\/span><\/li>/gi,
            `<li><span class="ag-name-affiliation"><span class="ag-name">Zet Yulius Baitanu</span></span></li>...`],
        [/article-identifier-links/gi, `article-identifier-linksx`],
        [/href\=\"https\:\/\/doi\.org\/10\.1016\/j\.ijedudev\.2025\.103292\"/gi, `/science/article/pii/S0738059325000902`],
        [/https\:\/\/doi\.org\/10\.1016\/j\.ijedudev\.2025\.103292/gi, `https://doi.org/10.1116/j.ijedudev.2025.111292`],
        [/10\.1016\/j\.ijedudev\.2025\.103292/gi, `10.1116/j.ijedudev.2025.111292`],
    ];
    if (typeof content === 'string') {
        fix.forEach(([x, y]) => {
            content = content.replace(x, y);
        });
        var match = content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
        if (match) {
            const dom = new JSDOM(content);
            const text = dom.window.document.body.textContent;
            return text;
        }
    }
    return await content;
}
