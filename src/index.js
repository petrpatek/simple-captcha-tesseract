const Apify = require('apify');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const request = require('request-promise');
const { processImages } = require('./libs/imageProcessing');
const { resolveImagesConcurrently } = require('./libs/tessaract');

const { utils: { log } } = Apify;

Apify.main(async () => {
    // Get input of your act
    let input = await Apify.getValue('INPUT');
    // to solve the start from webhook and the console run debug
    if (input.data) {
        input = JSON.parse(input.data);
    }

    log.info('Starting');
    let resultImages = [];
    let resultTexts = [];

    // when i work with array
    if (input.length) {
        resultImages = await processImages(input);
        log.info(`Going to process ${resultImages.length} images`);
    }

    if (resultImages.length !== 0) {
        const results = await resolveImagesConcurrently(resultImages, 10);
        resultTexts = results.map((result) => {
            console.log(result);
            return result.text;
        });
        console.log(resultTexts, 'RES');
    }
    console.log('resultTexts:', resultTexts);
    await Apify.setValue('OUTPUT', resultTexts);
});
