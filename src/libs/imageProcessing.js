const sharp = require('sharp');
const request = require('request-promise');
const Apify = require('apify');
const { resolveInBatches } = require('../tools');

const { utils: { log } } = Apify;

const convertUrlGifToPng = async (imageUrl) => {
    log.info(`Downloading and converting: ${imageUrl} to gif`);
    const image = await request({ url: imageUrl, encoding: null });
    return sharp(image)
        .resize(200)
        .png()
        .toBuffer()
        .catch(err => log.error(`Could not process image: ${imageUrl}`, err));
};

const processImages = async (input) => {
    return resolveInBatches(input.map(async (item) => {
        if (item.match(/\.gif$/i)) {
            return convertUrlGifToPng(item);
        }
        return request({ url: item, encoding: null });
    }), 20);
};

module.exports = {
    processImages,
};
