const Apify = require('apify');
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
    console.time('process');
    let resultImages = [];
    let resultTexts = [];

    // when i work with array
    if (input.length) {
        resultImages = await processImages(input);
        log.info(`Going to process ${resultImages.length} images`);
    }

    if (resultImages.length !== 0) {
        resultTexts = await resolveImagesConcurrently(resultImages, 10);
    }
    log.info('Finished');
    console.timeEnd('process');

    await Apify.setValue('OUTPUT', resultTexts);
});
