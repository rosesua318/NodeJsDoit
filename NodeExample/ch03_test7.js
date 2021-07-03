var users = [{name:'소녀시대', age:20}, {name:'걸스데이', age:22}];

var oper = function(a, b) {
    return a + b;
}

users.push(oper);

console.dir(users);
console.log('세번째 배열 요소를 함수로 실행 : ' + users[2](10, 10));