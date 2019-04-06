const Apify = require('apify');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const request = require('request-promise');
const { processImages } = require('./libs/imageProcessing');

const { utils: { log } } = Apify;

Apify.main(async () => {
    // Get input of your act
    let input = await Apify.getValue('INPUT');
    const store = await Apify.openKeyValueStore('TESSERACT');
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


    // Save test data to local machine because Tesseract has stupid issue https://github.com/naptha/tesseract.js/issues/130
    // https://github.com/arturaugusto/display_ocr/blob/master/letsgodigital/letsgodigital.traineddata
    // const numbers = await request({ url:
    // 'https://github.com/arturaugusto/display_ocr/blob/master/letsgodigital/letsgodigital.traineddata', encoding: null });
    let testData = await store.getValue('TEST_DATA_TESSERACT');
    if (!testData) {
        log.info('Downloading training data');
        testData = await request({
            url: 'https://raw.githubusercontent.com/tesseract-ocr/tessdata/master/eng.traineddata',
            encoding: null,
        });
        await store.setValue('TEST_DATA_TESSERACT', testData, { contentType: 'application/octet-stream' });
    }

    fs.writeFileSync(require('path').resolve(__dirname, 'eng.traineddata'), testData);

    if (resultImages.length !== 0) {
        const results = await resolveInBatches(resultImages.map((image, index) => {
            console.log(`Solving image with Tesseract....length:${index}`);
            console.log(image);
            return () => Tesseract.recognize(image, { lang: 'eng', classify_bln_numeric_mode: 1, tessedit_char_whitelist: '0123456789' });
        }), 7);
        resultTexts = results.map((result) => {
            console.log(result);
            return result.text;
        });
        console.log(resultTexts, 'RES');
    }
    console.log('resultTexts:', resultTexts);
    await Apify.setValue('OUTPUT', resultTexts);
});
