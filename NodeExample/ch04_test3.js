process.on('tick', (count) => {
    console.log('tick 이벤트 발생함 : ' + count);
});

setTimeout(() => {
    console.log('2초 후에 실행되었음.');

    process.emit('tick', '2');
}, 2000);