module.exports = {
  development: {
    client: "postgres",

    connection: {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "password",
      database: "pennygrub"
    }
  },
  test: {
    client: "postgres",

    connection: {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "password",
      database: "pennygrub_test"
    }
  }
};
