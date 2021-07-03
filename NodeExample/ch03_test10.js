var users = [{name: '소녀시대', age:20}, {name:'걸스데이', age:22}];
console.log('배열 원소의 개수 : ' + users.length);

users.unshift({name:'티아라', age:21});
console.log('배열 원소의 개수 : ' + users.length);

console.dir(users);

var elem = users.shift();
console.log('배열 원소의 개수 : ' + users.length);

console.log('pop으로 꺼낸 세번째 원소');
console.dir(elem);