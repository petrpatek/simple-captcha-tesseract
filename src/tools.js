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

module.exports = {
    resolveInBatches,
};
