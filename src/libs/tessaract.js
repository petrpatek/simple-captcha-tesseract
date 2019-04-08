const Tesseract = require('tesseract.js');
const Apify = require('apify');

const { utils: { log } } = Apify;


function createJobPromise(image, index) {
    log.info(`Creating job info for image number ${index}`);
    return new Promise((resolve, reject) => {
        Tesseract
            .recognize(image, { lang: 'eng', classify_bln_numeric_mode: 1, tessedit_char_whitelist: '0123456789' })
            .then(result => resolve(result.text))
            .catch(reject);
    });
}
async function resolveImagesConcurrently(imageArray, maxConcurrency = 10) {
    const promises = [];
    let imgIndex = 0;
    for (const image of imageArray) {
        promises.push(createJobPromise(image, imgIndex));
        if (promises.length % maxConcurrency === 0) await Promise.all(promises);
        imgIndex += 1;
    }
    return Promise.all(promises);
}

module.exports = {
    resolveImagesConcurrently,
};
