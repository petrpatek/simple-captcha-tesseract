const sharp = require('sharp');
const request = require('request-promise');
const { resolveInBatches } = require('../tools');

const convertUrlGifToPng = async (imageUrl) => {
    console.log('Image is GIF use browser to convert to png.');
    const image = await request({ url: imageUrl, encoding: null });
    // console.log(image, 'IMAGE');
    return sharp(image)
        .resize(200)
        .png()
        .toBuffer()
        .catch(err => console.error(`Could not process image: ${imageUrl}`, err));
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
