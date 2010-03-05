var postgres = require('./postgres'),
         sys = require('sys'),
           p = sys.p,
        puts = sys.puts;

var c = postgres.createConnection("host=localhost dbname=ryan");

c.addListener("connect", function () {
  puts("connected");
  puts(c.readyState);
});

c.addListener("close", function (err) {
  puts("connection closed.");
  if (err) puts("error: " + err.message);
});

c.query("select * from test;", function (err, rows) {
  puts("result1:");
  p(rows);
});

c.query("select * from test limit 1;", function (err, rows) {
  puts("result2:");
  p(rows);
});

c.query("select ____ from test limit 1;", function (err, rows) {
  if (err)  {
    puts("error! "+ err.message);
    puts("full: "+ err.full);
    puts("severity: "+ err.severity);
    c.close();
    return;
  }
  puts("result3:");
  p(rows);
});

c.query("select * from test;", function (err, rows) {
  c.query("select * from test;", function (err, rows) {
    puts("result4:");
    p(rows);
  });
});
