const path = require('path');
const fs = require('fs');
const request = require('request-promise');

const main = async () => {
    console.log('Downloading test data');
    const testData = await request({
        url: 'https://raw.githubusercontent.com/tesseract-ocr/tessdata/master/eng.traineddata',
        encoding: null,
    });
    fs.writeFileSync(path.resolve(__dirname, 'eng.traineddata'), testData);
};
main()
    .then(() => console.log('Succesfully created test data'))
    .catch(err => console.error('Could not create test data', err));
