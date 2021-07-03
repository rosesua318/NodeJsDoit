var users = [{name:'소녀시대', age:20}, {name:'걸스데이', age:22}, {name:'티아라', age:21}];

for (var i = 0; i < users.length; i++) {
    console.log('배열 원소 #' + i + ' : ' + users[i].name);
}

users.forEach((elem, index) => {
    console.log('배열 원소 #' + index + ' : ' + elem.name);
});