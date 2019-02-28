const Apify = require('apify');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const request = require('request-promise');
const path = require('path');
const Jimp = require('jimp');

async function resolveInBatches(promiseArray, batchLength = 3) {
    const promises = [];
    for (const promise of promiseArray) {
        if (typeof promise === 'function') {
            promises.push(promise());
        } else {
            promises.push(promise);
        }
        if (promises.length % batchLength === 0) await Promise.all(promises);
    }
    return Promise.all(promises);
}

class Anticaptcha {
    constructor(clientKey) {
        this.clientKey = clientKey;
        // this.uri = 'http://api.anti-captcha.com';
    }

    async createTask(task) {
        const opt = {
            method: 'POST',
            uri: 'http://api.anti-captcha.com/createTask',
            body: {
                task,
                clientKey: this.clientKey,
            },
            json: true,
        };
        const response = await request(opt);
        return response.taskId;
    }

    async getTaskResult(taskId) {
        const opt = {
            method: 'POST',
            uri: 'http://api.anti-captcha.com/createTask',
            body: {
                taskId,
                clientKey: this.clientKey,
            },
            json: true,
        };
        return await request(opt);
    }

    async waitForTaskResult(taskId, timeout) {
        return new Promise((resolve, reject) => {
            const startedAt = new Date();
            const waitLoop = () => {
                if ((new Date() - startedAt) > timeout) {
                    reject(new Error('Timeout before condition pass'));
                }
                this.getTaskResult(taskId)
                    .then((response) => {
                        if (response.errorId !== 0) {
                            reject(new Error(response.errorCode, response.errorDescription));
                        } else {
                            console.log(response);
                            if (response.status === 'ready') {
                                resolve(response);
                            } else {
                                setTimeout(waitLoop, 1000);
                            }
                        }
                    })
                    .catch(e => reject(e));
            };
            waitLoop();
        });
    }
}
const convertUrlGifToPng = async (imageUrl) => {
    console.log('Image is GIF use browser to convert to png.');
    const browser = await Apify.browse(imageUrl);
    await browser.webDriver.manage().window().setSize(200, 200);
    const screen = await browser.webDriver.takeScreenshot();
    await Apify.setValue('debug_img', Buffer.from(screen, 'base64'), { contentType: 'image/png' });
    return Buffer.from(screen, 'base64');
};

const resizeImage = async (imagePng, i) => {
    return await new Promise((resolve, reject) => {
        Jimp.read(imagePng, (err, image) => {
            image
                .autocrop([2, true])
                .greyscale()
                .scale(4)
                .getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                    // buffer is PNG as a buffer
                    if (err) { reject(err); }
                    // remove comment for the debug image which is outputted by JIMP
                    // Apify.setValue('debug_img'+i, Buffer.from(buffer, 'base64'), { contentType: 'image/png' });
                    resolve(Buffer.from(buffer, 'base64'));
                });
        });
    });
};

Apify.main(async () => {
    // Get input of your act
    let input = await Apify.getValue('INPUT');
    const store = await Apify.openKeyValueStore('TESSERACT');
    // to solve the start from webhook and the console run debug
    if (input.data) {
        input = JSON.parse(input.data);
    } else {
        input = input;
    }

    console.log('Start');
    let resultImages = [];
    const resultTexts = [];

    // when i work with array
    if (input.length) {
        resultImages = await resolveInBatches(input.map(async (item) => {
            if (item.match(/\.gif$/i)) {
                const image1 = await convertUrlGifToPng(item);
                return () => resizeImage(image1, input.length);
            }
            return () => request({ url: item, encoding: null });
        }), 5);
        console.log(resultImages, 'IMAGES');
    }


    // Save test data to local machine because Tesseract has stupid issue https://github.com/naptha/tesseract.js/issues/130
    // https://github.com/arturaugusto/display_ocr/blob/master/letsgodigital/letsgodigital.traineddata
    // const numbers = await request({ url: 'https://github.com/arturaugusto/display_ocr/blob/master/letsgodigital/letsgodigital.traineddata', encoding: null });
    let testData = await store.getValue('TEST_DATA_TESSERACT');
    if (!testData) {
        testData = await request({
            url: 'https://raw.githubusercontent.com/tesseract-ocr/tessdata/master/eng.traineddata',
            encoding: null,
        });
        await store.setValue('TEST_DATA_TESSERACT', testData);
    }
    fs.writeFileSync(require('path').resolve(__dirname, 'eng.traineddata'), testData);
    if (resultImages.length !== 0) {
        while (resultImages.length) {
            const imageNumber = resultImages.length;
            console.log(`Solving image with Tesseract....length:${imageNumber}`);
            const recognizeImage = resultImages.pop();
            console.log(recognizeImage);
            const result = await Tesseract.recognize(recognizeImage, { lang: 'eng', classify_bln_numeric_mode: 1, tessedit_char_whitelist: '0123456789' }).progress(message => console.log(message));
            console.log('Result text:', result.text);
            if (result.text) {
                resultTexts.push(result.text);
            }
            /* else {
                console.log("Solving image with Anticaptcha....length:" + imageNumber)
                const anticaptcha = new Anticaptcha(process.env.ANTI_CAPTCHA_KEY);
                let task = {
                    "type": "ImageToTextTask",
                    "body": recognizeImage.toString('base64'),
                }
                const taskId = await anticaptcha.createTask(task);
                result = await anticaptcha.waitForTaskResult(taskId, 600000);
                console.log('Result text:', result.solution.text);
                resultTexts.push(result.solution.text);
            }
            */
        }
    }
    console.log('resultTexts:', resultTexts);
    await Apify.setValue('OUTPUT', resultTexts);
});
