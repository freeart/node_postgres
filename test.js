var postgres = require('./postgres'),
         sys = require('sys'),
           p = sys.p,
        puts = sys.puts;

var c = postgres.createConnection("host='' dbname=test");

puts(c.escapeString("e's'c'a'p'e me"));

puts('map tuple items: ' + sys.inspect(c.mapTupleItems))
c.mapTupleItems = false
puts('map tuple items is turned off and now: ' + sys.inspect(c.mapTupleItems))

try {
  c.mapTupleItems = "x";
  puts('broken behaviour: mapTupleItems accepted a string, but should reject it')
}
catch (e) {
  puts('map tuple items rejects non-boolean values')
}

c.addListener("connect", function () {
  puts("connected");
  puts(c.readyState);
  
  puts(c.escapeString("e's'c'a'p'e UTF8 too: ±—°."));
});

c.addListener("close", function (err) {
  puts("connection closed.");
  if (err) puts("error: " + err.message);
});

c.query("select * from test;", function (err, rows) {
  if (err) throw err;
  puts("result1:");
  p(rows);
});

c.mapTupleItems = true;
c.query("select * from test;", function (err, rows) {
  if (err) throw err;
  puts("result1.1:");
  p(rows);
});

c.query("select * from test limit 1;", function (err, rows) {
  if (err) throw err;
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
