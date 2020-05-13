const compressing = require('compressing');

compressing.zip.compressDir('./dist', './dist.zip')
.then(() => {
    console.log('success');
})
.catch(err => {
    console.error(err);
});