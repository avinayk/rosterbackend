var module = require("module");
const express = require("express");
var router = express.Router();
const cors = require("cors");
var http = require("http");
var fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
var request = require("request");
const app = (module.exports = express());
const https = require("https");
const md5 = require("md5");
httpServer = http.createServer((req, res) => {
  res.send();
});

port = 8000;
app.listen(port, () => {
  console.log(`Server listening on the port no.:${port}`);
});

//app.listen();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8000"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.static(__dirname + "/public"));

const db = mysql.createPool({
  connectionLimit: 10000, //important
  host: "localhost",
  user: "root",
  password: "",
  database: "roster",
  debug: false,
});

db.getConnection(function (err, connection) {
  connection.release();
});
app.use(cors());
//app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.get("/test", (req, res) => {
  // Create a new Date object
  // Create a new Date object
  var date = new Date();

  // Set the time zone offset to the AEST time zone (UTC+10:00)
  date.setUTCMinutes(date.getUTCMinutes() + 10 * 60);

  // Get the date components
  var day = date.getUTCDate().toString().padStart(2, "0");
  var month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  var year = date.getUTCFullYear().toString();

  // Get the time components
  var hours = date.getUTCHours();
  var minutes = date.getUTCMinutes();
  var seconds = date.getUTCSeconds();

  // Determine AM or PM
  var period = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)

  // Format the time as hours, minutes, and seconds in 12-hour format
  hours = hours.toString().padStart(2, "0");
  minutes = minutes.toString().padStart(2, "0");
  seconds = seconds.toString().padStart(2, "0");

  // Construct the date and time string
  var currentDateAndTime =
    day +
    "/" +
    month +
    "/" +
    year +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    period;

  console.log(currentDateAndTime);
});
app.post("/register", function (req, res) {
  //console.log(req.body);
  var data = req.body;

  let users = {
    first_name: data.first_name,
    middle_name: data.middle_name,
    last_name: data.last_name,
    email: data.email,
    password: md5(data.password),
    contact: data.contact,
    address: data.address,
    skills: data.skills,
    years: data.years,
    created_at: new Date(),
  };
  db.query(
    "SELECT * FROM users WHERE email=?",
    [data.email],
    function (err, row, fields) {
      if (err) throw err;
      // console.log(row);
      if (row == "") {
        db.query(
          "INSERT INTO users SET ?",
          users,
          function (error, results, fields) {
            if (error) throw error;
            var idd = results.insertId;
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/login", function (req, res) {
  //console.log(req.body);
  var data = req.body;

  var pass = md5(data.password);
  db.query(
    "SELECT * FROM users WHERE email=?",
    [data.email, pass],
    function (err, row, fields) {
      if (err) throw err;
      //console.log(row);
      if (row != "") {
        var status = row;
        //console.log(row);
        res.json({ status });
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

//Admin Panel
app.post("/admin/login", function (req, res) {
  //console.log(req.body);
  var data = req.body;

  var pass = md5(data.password);
  db.query(
    "SELECT * FROM admin WHERE email=? And password",
    [data.email, pass],
    function (err, row, fields) {
      if (err) throw err;
      //console.log(row);
      if (row != "") {
        var status = row;
        //console.log(row);
        res.json({ status });
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/admin/addclient", function (req, res) {
  //console.log(req.body);
  var data = req.body;

  var data = req.body;

  let formdata = {
    email: data.email,
    name: data.name,
    location: data.location,
    position: data.position,
    department: data.department,
    phone_number: data.phone_number,
    mobile_number: data.mobile_number,
    home_phone_number: data.home_phone_number,
    fax_number: data.fax_number,
    created_at: new Date(),
  };
  db.query(
    "SELECT * FROM clients WHERE email=?",
    [data.email],
    function (err, row, fields) {
      if (err) throw err;
      //console.log(row);
      if (row == "") {
        db.query(
          "INSERT INTO clients SET ?",
          formdata,
          function (error, results, fields) {
            if (error) throw error;
            var idd = results.insertId;
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});
app.get("/admin/getclient", (req, res) => {
  db.query(
    "SELECT * FROM clients  order by id desc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.get("/admin/getemployee", (req, res) => {
  db.query(
    "SELECT * FROM users  order by id desc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.get("/admin/getlocation", (req, res) => {
  db.query(
    "SELECT * FROM locations  order by id desc",
    function (err, results, fields) {
      if (err) throw err;

      res.json({ results });
    }
  );
});
app.post("/admin/getclient", function (req, res) {
  //console.log(req.body);
  var data = req.body;
  var id = data.clientId;
  db.query(
    "SELECT * FROM clients WHERE id=?",
    [id],
    function (err, row, fields) {
      if (err) throw err;
      // console.log(row);
      res.json({ row });
    }
  );
});
app.post("/admin/getidlocation", function (req, res) {
  //console.log(req.body);

  var data = req.body;
  var id = data.locationId;
  db.query(
    "SELECT * FROM locations WHERE id=?",
    [id],
    function (err, row, fields) {
      if (err) throw err;
      var location = row;
      //console.log(location[0].id);
      if (location != "") {
        db.query(
          "SELECT * FROM clients WHERE id=?",
          [location[0].client_id],
          function (err, row, fields) {
            if (err) throw err;
            var r = row;
            if (r != "") {
              // console.log(r);
              const currentDate = location[0].duration_start;
              const formattedDate = currentDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const currentDatee = location[0].duration_end;
              const formattedDatee = currentDatee.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              let locations = {
                id: location[0].id,
                client_id: location[0].client_id,
                location_name: location[0].location_name,
                nearest_town: location[0].nearest_town,
                commodity: location[0].commodity,
                contract_type: location[0].contract_type,
                duration_start: formattedDate,
                duration_end: formattedDatee,
                scope: location[0].scope,
                client_name: r[0].name,
              };
              //console.log(locations);
              res.json({ locations });
            }
          }
        );
      }
    }
  );
});
app.post("/admin/getuser", function (req, res) {
  //console.log(req.body);
  var data = req.body;
  var id = data.userId;
  db.query("SELECT * FROM users WHERE id=?", [id], function (err, row, fields) {
    if (err) throw err;
    // console.log(row);
    res.json({ row });
  });
});
app.post("/admin/userregister", function (req, res) {
  //console.log(req.body);
  var data = req.body;

  let users = {
    first_name: data.first_name,
    middle_name: data.middle_name,
    last_name: data.last_name,
    email: data.email,
    password: md5(data.password),
    contact: data.contact,
    address: data.address,
    skills: data.skills,
    years: data.years,
    created_at: new Date(),
  };
  db.query(
    "SELECT * FROM users WHERE email=?",
    [data.email],
    function (err, row, fields) {
      if (err) throw err;
      // console.log(row);
      if (row == "") {
        db.query(
          "INSERT INTO users SET ?",
          users,
          function (error, results, fields) {
            if (error) throw error;
            var idd = results.insertId;
            var status = "1";
            res.json({ status });
          }
        );
      } else {
        var status = "2";
        res.json({ status });
      }
    }
  );
});

app.post("/admin/addlocation", function (req, res) {
  //console.log(req.body);
  var data = req.body;

  let locations = {
    client_id: data.client_id,
    location_name: data.location_name,
    nearest_town: data.nearest_town,
    commodity: data.commodity,
    contract_type: data.contract_type,
    duration_start: data.duration_start,
    duration_end: data.duration_end,
    scope: data.scope,
    created_at: new Date(),
  };
  db.query(
    "INSERT INTO locations SET ?",
    locations,
    function (error, results, fields) {
      if (error) throw error;
      var idd = results.insertId;
      var status = "1";
      res.json({ status });
    }
  );
});

app.post("/admin/getminesites", function (req, res) {
  //console.log(req.body);
  var data = req.body;

  var id = data.clientId;
  db.query(
    "SELECT * FROM locations WHERE client_id=? order by id desc",
    [id],
    function (err, results, fields) {
      if (err) throw err;
      //  console.log(results);
      res.json({ results });
    }
  );
});

app.post("/admin/setRoster", function (req, res) {
  //console.log(req.body);
  var data = req.body;
  var ndate = new Date();
  const formattedDate = ndate.toISOString().split("T")[0];

  db.query(
    "SELECT * FROM locations WHERE id=? And duration_end > ? order by id desc",
    [data.locationId, formattedDate],
    function (err, row, fields) {
      if (err) throw err;
      if (row != "") {
        db.query(
          "SELECT * FROM rosters WHERE type=? And user_id=? order by id desc",
          [data.type, data.user_id],
          function (err, row, fields) {
            if (err) throw err;
            console.log("tt");
            console.log(row);
            if (row != "") {
              var status = "1";
              res.json({ status });
            } else {
              let rosters = {
                location_id: data.locationId,
                user_id: data.user_id,
                type: data.type,
                created_at: new Date(),
              };
              db.query(
                "INSERT INTO rosters SET ?",
                rosters,
                function (error, results, fields) {
                  if (error) throw error;
                }
              );
              var status = "2";
              res.json({ status });
            }
          }
        );
      } else {
        var status = "3";
        res.json({ status });
      }
    }
  );
});
app.post("/admin/getroster", function (req, res) {
  //console.log(req.body);
  var data = req.body;

  db.query(
    "SELECT * FROM rosters WHERE user_id=? order by id desc",
    [data.user_id],
    function (err, results, fields) {
      if (err) throw err;
      console.log(results);
      res.json({ results });
    }
  );
});
