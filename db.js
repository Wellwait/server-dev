const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'ec2-3-84-93-161.compute-1.amazonaws.com',
  user: 'remote_user',   // Replace with your MySQL username
  password: 'remotePassword@1234',   // Replace with your MySQL password
  database: 'wellwait_db' // Replace with your database name
    // host: 'localhost',
    // user: 'root',   // Replace with your MySQL username
    // password: 'Reva@123',   // Replace with your MySQL password
    // database: 'wellwait_db' // Replace with your database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

module.exports = connection;
