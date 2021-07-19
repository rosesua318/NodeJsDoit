// fs 모듈 사용
var fs = require("fs");
// readline은 데이터를 읽기위한 인터페이스를 제공해주는 모듈
var readline = require("readline");

// 한 줄씩 내용을 읽어들이는 함수
const readFile = (filename) => {
  const instream = fs.createReadStream(filename); // 지정한 파일을 읽을 스트림 객체 반환
  const reader = readline.createInterface(instream, process.stdout);

  let count = 0;

  // 한줄 읽을 때 마다 발생하는 이벤트
  reader.on("line", (line) => {
    count += 1;

    // 정보를 공백으로 구분
    const array = line.split(" ");

    if (array != undefined && array.length > 0) {
      console.log(count + "번째 : " + array[0]);
    }
  });

  // 파일의 내용을 모두 읽은 후에 발생하는 이벤트
  reader.on("close", (line) => {
    console.log("모두 읽어들임.");
  });
};

// 함수 실행 테스트
readFile("./people.txt");
