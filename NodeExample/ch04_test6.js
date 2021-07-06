var fs = require('fs');

fs.readFile('./package.json', 'utf8', (err, data) => {
    console.log(data);
})