var fs = require('fs');

fs.open('./output.txt', 'w', (err, fd) => {
    if (err) {
        console.log('파일 오픈 시 에러 발생');
        console.dir(err);
        return;
    }

    var buf = new Buffer('안녕\n');
    fs.write(fd, buf, 0, buf.length, null, (err, written, buffer) => {
        if (err ) {
            console.log('파일 쓰기 시 에러 발생');
            console.dir(err);
            return;
        }

        console.log('파일 쓰기 완료함.');

        fs.close(fd, () => {
            console.log('파일 닫기 완료함.');
        })
    });
});