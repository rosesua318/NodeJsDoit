module.exports = {
  server_port: 3000,
  db_url: "mongodb://localhost:27017/local",
  db_schemas: [
    {
      file: "./user_schema",
      collection: "users5",
      schemaName: "UserSchema",
      modelName: "UserModel",
    },
    {
      file: "./coffeeshop_schema",
      collection: "coffeeshop",
      schemaName: "CoffeeshopSchema",
      modelName: "CoffeeshopModel",
    },
  ],
  route_info: [
    { file: "./user", path: "/process/login", method: "login", type: "post" },
    {
      file: "./user",
      path: "/process/addUser",
      method: "adduUer",
      type: "post",
    },
    {
      file: "./user",
      path: "/process/listuser",
      method: "listuser",
      type: "post",
    },
    { file: "./test", path: "/process/test1", method: "test1", type: "get" },
    {
      file: "./coffeeshop",
      path: "/process/addcoffeeshop",
      method: "add",
      type: "post",
    },
    {
      file: "./coffeeshop",
      path: "/process/listcoffeeshop",
      method: "list",
      type: "post",
    },
    {
      file: "./coffeeshop",
      path: "/process/nearcoffeeshop",
      method: "findNear",
      type: "post",
    },
  ],
};
