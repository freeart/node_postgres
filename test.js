var postgres = require('./postgres'),
         sys = require('sys'),
        puts = sys.puts;

var p = function () {
    puts(sys.inspect.apply(this, arguments));
}

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

c.query("listen testnotice;", function () {
  var timeout = setTimeout(function () {
    puts("timeout waiting for notification");
    c.close();
  }, 2000);

  c.addListener("notify", function (relname, pid, extras) {
    if (relname === "testnotice") {
      puts("got notification from " + pid + ", extras:" + extras);
      clearTimeout(timeout);
      c.close();
    }
  });

  c.query("notify testnotice;");
});
