const Jimp = require('jimp');
const Apify = require('apify');
const { resolveInBatches } = require('../tools');

const convertUrlGifToPng = async (imageUrl) => {
    console.log('Image is GIF use browser to convert to png.');
    const browser = await Apify.browse(imageUrl);
    await browser.webDriver.manage().window().setSize(200, 200);
    const screen = await browser.webDriver.takeScreenshot();
    await Apify.setValue('debug_img', Buffer.from(screen, 'base64'), { contentType: 'image/png' });
    return Buffer.from(screen, 'base64');
};

const resizeImage = async (imagePng) => {
    return new Promise((resolve, reject) => {
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

const processImages = async (input) => {
    return resolveInBatches(input.map(async (item) => {
        if (item.match(/\.gif$/i)) {
            const image1 = await convertUrlGifToPng(item);
            return resizeImage(image1, input.length);
        }
        return request({ url: item, encoding: null });
    }), 20);
};

module.exports = {
    processImages,
};
