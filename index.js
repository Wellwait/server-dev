const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

// Secret for JWT
const JWT_SECRET = 'Abcd1234!@!@';  // Store this in a secure place or use environment variables

// Use body-parser to parse request bodies
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where the file will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file
  }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
const fs = require('fs');
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send({ status: 'success', filename: req.file.filename });
});

// Register a user (for demonstration purposes)
app.post('/register', async (req, res) => {
  const { email, username, password, address, phone_number } = req.body;
  console.log("register", req.body);

  // Hash the password before saving to the database
  // let hashedPassword = await bcrypt.hash(password, 10);
  let hashedPassword = password;
  // bcrypt.hash(password, 10).then(function(hash) {
  //     hashedPassword = hash;
  // });

  const query = 'INSERT INTO User (email, username, password, address, phone_number) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [email, username, hashedPassword, address, phone_number], (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(201).send(`User created with ID: ${results.insertId}`);
  });
});
//create partner
app.post('/register_partner', async (req, res) => {
  const { email, password} = req.body;
  console.log("register", req.body);

  // Hash the password before saving to the database
  // let hashedPassword = await bcrypt.hash(password, 10);
  let hashedPassword = password;
  // bcrypt.hash(password, 10).then(function(hash) {
  //     hashedPassword = hash;
  // });

  const query = 'INSERT INTO Service_Provider (email, password) VALUES (?, ?)';
  db.query(query, [email, hashedPassword], (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(201).send(`User created with ID: ${results.insertId}`);
  });
});

// Login a user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists in the database
  const query = 'SELECT * FROM User WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    if (results.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = results[0];

    // Compare the hashed password stored in the database with the provided password
    // Replace the following line with bcrypt if you are using hashing
    const passwordMatch = password === user.password;
    if (!passwordMatch) {
      return res.status(400).send('Invalid email or password');
    }

    // Parse and format the birthday as yyyy-MM-dd
    const birthday = user.birthday ? new Date(user.birthday) : null;
    // if (birthday instanceof Date && !isNaN(birthday)) {
    //   // Ensure the birthday format is yyyy-MM-dd
    //   const year = birthday.getFullYear();
    //   const month = String(birthday.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    //   const day = String(birthday.getDate()).padStart(2, '0');
    //   const formattedBirthday = `${year}-${month}-${day}`;

      // Generate a JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h', // Token expiry time
      });

      // Return the token and user details to the client
      res.json({
        token,
        userId: user.id,
        userName: user.username,
        phone_number: user.phone_number,
        email: user.email,
        birthday: user.birthday, // Formatted as yyyy-MM-dd
        gender: user.gender,
      });
    // } else {
    //   return res.status(400).send('Invalid birthday format');
    // }
  });
});



app.post('/loginpartner', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM Service_Provider WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found', status: -1 });
    }
    const user = results[0];
    const passwordMatch = password == user.password;
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password', status: -1 });
    }
    res.json({ id: user.id, email: user.email, onboarding_complete: user.onboarding_complete, status : 1 });
  });
});


app.post('/services/servicespartner', (req, res) => {
  const { name, category, price, promo_image, rating, category_type, service_provider_id } = req.body;

  // Input validation
  if (!name || !category || !category_type || !service_provider_id) {
    return res.status(400).json({ message: 'Name, category, category_type, and service_provider_id are required.' });
  }

  // SQL query to insert the new service
  const query = `
    INSERT INTO Services
    (name, category, createdAt, updatedAt, price, promo_image, rating, category_type, service_provider_id)
    VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
  `;

  // Execute the query
  db.execute(query, [name, category, price, promo_image, rating, category_type, service_provider_id], (err, results) => {
    if (err) {
      console.error('Error inserting service:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(201).json({ message: 'Service added successfully', serviceId: results.insertId });
  });
});

app.put('/update_service_provider_bank_details/:id', (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    const { pan_card, gst_in, bank_account_number, bank_ifsc_code } = req.body; // Get data from the request body

    // Validate input
    if (!pan_card || !gst_in || !bank_account_number || !bank_ifsc_code) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // SQL query to update the service provider
    const sql = `
        UPDATE Service_Provider
        SET pan_card = ?, gst_in = ?, bank_account_number = ?, bank_ifsc_code = ?, onboarding_complete = 1
        WHERE id = ?
    `;
    const values = [pan_card, gst_in, bank_account_number, bank_ifsc_code, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Service provider not found' });
        }
        res.status(200).json({ message: 'Service provider updated successfully' });
    });
});



app.put('/update_service_provider_info/:id', (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    const { name, salon_name, address, email, mobile_number } = req.body; // Get data from the request body

    // Validate input
    if (!name || !salon_name || !address || !email || !mobile_number) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // SQL query to update the service provider
    const sql = `
        UPDATE Service_Provider
        SET name = ?, salon_name = ?, address = ?, email = ?, mobile_number = ?
        WHERE id = ?
    `;
    const values = [name, salon_name, address, email, mobile_number, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Service provider not found' });
        }
        res.status(200).json({ message: 'Service provider updated successfully' });
    });
});


app.post('/addSalonTiming', (req, res) => {
    const { salon_id, day, start_time, end_time, lunch_start, lunch_end } = req.body;

    // Check if all required fields are provided
    if (salon_id == null || !day || !start_time || !end_time) {
        return res.status(400).json({ error: 'All fields are required except lunch_start and lunch_end' });
    }

    // SQL query to insert salon timings
    const query = 'INSERT INTO salon_timings (salon_id, `day`, start_time, end_time, lunch_start, lunch_end) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [salon_id, day, start_time, end_time, lunch_start, lunch_end], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Failed to add salon timing' });
        }

        res.status(201).json({ message: 'Salon timing added successfully', id: results.insertId });
    });
});

// Protected route example (to show how JWT is verified)
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).send('Token required');

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');

    // Access to protected resource
    res.send('Welcome to the protected route, user: ' + JSON.stringify(user));
  });
});
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Insert a user into the User table
app.post('/user', (req, res) => {
  const { email, username, password, address, phone_number } = req.body;

  const query = 'INSERT INTO User (email, username, password, address, phone_number) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [email, username, password, address, phone_number], (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(201).send(`User created with ID: ${results.insertId}`);
  });
});

// Retrieve all users from the User table
app.get('/users', (req, res) => {
  const query = 'SELECT * FROM User';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
});


app.get('/subcategories', (req, res) => {
  const query = 'SELECT id, name, category_id, icon FROM wellwait_db.SubCategory';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
});


// Insert a service into the Services table
app.post('/service', (req, res) => {
  const { name, type, location, open_time, phone_number, website_link, latitude, longitude, price, service_provider_id, start_lunch_time, end_lunch_time } = req.body;

  const query = `
    INSERT INTO Services (name, type, location, open_time, phone_number, website_link, latitude, longitude, price, service_provider_id, start_lunch_time, end_lunch_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [name, type, location, JSON.stringify(open_time), phone_number, website_link, latitude, longitude, price, service_provider_id, start_lunch_time, end_lunch_time], (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(201).send(`Service created with ID: ${results.insertId}`);
  });
});

// Retrieve all services from the Services table
app.get('/services', (req, res) => {
  const query = `
    SELECT s.*, sp.salon_name, sp.address, sp.view_count
    FROM Services s
    JOIN wellwait_db.Service_Provider sp ON s.service_provider_id = sp.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
});


app.get('/salon_service_providers', (req, res) => {
  const query = `
  SELECT
  sp.id,
  sp.name AS provider_name,
  sp.salon_name,
  sp.address,
  sp.mobile_number,
  sp.email,
  sp.view_count,  -- Added view_count from Service_Provider
  GROUP_CONCAT(s.name SEPARATOR ', ') AS service_names,  -- Changed from category to service name
  GROUP_CONCAT(s.promo_image SEPARATOR ', ') AS promo_images,
  IFNULL(r.average_rating, 0) AS average_rating,  -- Handle NULL values
  IFNULL(r.total_ratings, 0) AS total_ratings      -- Handle NULL values
FROM
  Service_Provider AS sp
LEFT JOIN
  Services AS s ON sp.id = s.service_provider_id
LEFT JOIN (
  SELECT
      service_provider_id,
      AVG(rating) AS average_rating,
      COUNT(*) AS total_ratings
  FROM
      wellwait_db.ratings
  GROUP BY
      service_provider_id
) AS r ON sp.id = r.service_provider_id
GROUP BY
  sp.id, sp.name, sp.salon_name, sp.address, sp.mobile_number, sp.email, sp.view_count,
  r.average_rating, r.total_ratings
  ORDER BY
    average_rating DESC,  -- Highest rating first
    total_ratings DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
});


app.put('/increase_view_count/:id', (req, res) => {
  const { id } = req.params; // Get the id from the request params

  // SQL query to increase view_count by 1
  const query = `
    UPDATE wellwait_db.Service_Provider
    SET view_count = view_count + 1
    WHERE id = ?
  `;

  // Execute the query with the given id
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }

    // Check if any rows were affected (i.e., if the id exists)
    if (results.affectedRows > 0) {
      res.status(200).json({ message: 'View count updated successfully' });
    } else {
      res.status(404).json({ message: 'Service provider not found' });
    }
  });
});

app.get('/panels/:serviceProviderId', (req, res) => {
  const serviceProviderId = req.params.serviceProviderId;

  const query = `
    SELECT id, name, description, price, service_provider_id, service_list
    FROM Panel
    WHERE service_provider_id = ?;
  `;

  db.query(query, [serviceProviderId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No services found for this provider' });
    }

    // Include the id in the results
    res.json(results);
  });
});

app.get('/bookings/count', (req, res) => {
  const { scheduled_date, panel_id } = req.query;

  if (!scheduled_date || !panel_id) {
    return res.status(400).json({ error: 'scheduled_date and panel_id are required' });
  }

  const query = `
    SELECT COUNT(*) AS count
    FROM Booking
    WHERE scheduled_date = ? AND panel_id = ?
  `;

  db.query(query, [scheduled_date, panel_id], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'An error occurred while fetching data.' });
    }

    res.json({ count: results[0].count });
  });
});

app.post('/bookings', (req, res) => {
  const {
    userId,
    scheduled_date,
    serviceId,
    panel_id,
    service_provider_id,
    price, // Changed from total_price to price
    status
  } = req.body;

  const query = `
    INSERT INTO Booking
    (userId, scheduled_date, serviceId, panel_id, service_provider_id, price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [userId, scheduled_date, serviceId, panel_id, service_provider_id, price, status]; // Updated to use price

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error inserting data: ', error.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Booking created', bookingId: results.insertId });
  });
});


app.get('/salon_timings/:salonId/:day', (req, res) => {
    const salonId = req.params.salonId;
    const day = req.params.day;

    const query = `
        SELECT id, salon_id, \`day\`, start_time, end_time, lunch_start, lunch_end
        FROM salon_timings
        WHERE salon_id = ? AND \`day\` = ?
    `;

    db.query(query, [salonId, day], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        res.json(results);
    });
});


app.post('/ratings/:user_id/:service_provider_id/:rating', (req, res) => {
  const { user_id, service_provider_id, rating } = req.params;

  // Insert the rating into the database
  const sql = `INSERT INTO ratings (id, rating, user_id, service_provider_id) VALUES (?, ?, ?, ?)`;

  // Here, '0' is used for id since you are using auto-increment
  db.query(sql, [0, rating, user_id, service_provider_id], (err, result) => {
    if (err) {
      console.error('Error inserting rating:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    res.status(200).json({ message: 'Rating added successfully', ratingId: result.insertId });
  });
});

app.get('/ratings/:service_provider_id', (req, res) => {
  const { service_provider_id } = req.params;

  const sql = `
    SELECT
      service_provider_id,
      AVG(rating) AS average_rating,
      COUNT(*) AS total_ratings
    FROM
      wellwait_db.ratings
    WHERE
      service_provider_id = ?
    GROUP BY
      service_provider_id
  `;

  db.query(sql, [service_provider_id], (err, results) => {
    if (err) {
      console.error('Error retrieving ratings:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No ratings found for this service provider' });
    }

    res.status(200).json(results[0]); // Return the first result
  });
});

app.get('/booking', (req, res) => {
    // Extract scheduled_date and service_provider_id from query parameters
    const { scheduled_date, service_provider_id } = req.query;

    // Check if both scheduled_date and service_provider_id are provided
    if (!scheduled_date || !service_provider_id) {
        return res.status(400).json({ error: 'scheduled_date and service_provider_id are required' });
    }

    // Construct the SQL query
    const sqlQuery = `
        SELECT
    b.id,
    u.username,
    b.scheduled_date,
    s.name AS service_name,      -- Retrieve service name
    b.createdAt,
    b.updatedAt,
    b.service_provider_id,
    b.status,
    b.price,
    b.panel_id,
    b.started,
    b.started_at,
    b.finished,
    b.finished_at,
    p.name AS panel_name         -- Retrieve panel name
    FROM
    Booking b
    JOIN
    User u ON b.userId = u.id
    JOIN
    Services s ON b.serviceId = s.id
    JOIN
    Panel p ON b.panel_id = p.id  -- Join with Panel table to get panel name
    WHERE
    b.scheduled_date = ?
    AND b.service_provider_id = ?
    AND b.status != 0
    ORDER BY
    b.id ASC;

    `;

    // Execute the query
    db.query(sqlQuery, [scheduled_date, service_provider_id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);  // Send the results as JSON
    });
});

app.get('/past_booking', (req, res) => {
    // Extract scheduled_date and service_provider_id from query parameters

    // Construct the SQL query
    const sqlQuery = `
    SELECT
    b.id,
    u.username,
    b.scheduled_date,
    s.name AS service_name,      -- Retrieve service name
    b.createdAt,
    b.updatedAt,
    b.service_provider_id,
    b.status,
    b.price,
    b.panel_id,
    b.started,
    b.started_at,
    b.finished,
    b.finished_at,
    p.name AS panel_name,        -- Retrieve panel name
    sp.salon_name,
    sp.address
FROM
    Booking b
JOIN
    User u ON b.userId = u.id
JOIN
    Services s ON b.serviceId = s.id
JOIN
    Panel p ON b.panel_id = p.id  -- Join with Panel table to get panel name
JOIN
    wellwait_db.Service_Provider sp ON b.service_provider_id = sp.id -- Join with Service_Provider table
WHERE
    b.status = 3
ORDER BY
    b.id ASC;


    `;

    // Execute the query
    db.query(sqlQuery, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);  // Send the results as JSON
    });
});

app.get('/booking_pending', (req, res) => {
    // Extract scheduled_date and userId from query parameters
    const { scheduled_date, userId } = req.query;

    // Check if both scheduled_date and userId are provided
    if (!scheduled_date || !userId) {
        return res.status(400).json({ error: 'scheduled_date and userId are required' });
    }

    // Construct the SQL query
    const sqlQuery = `
        SELECT
    b.id,
    u.username,
    b.scheduled_date,
    s.name AS service_name,         -- Retrieve service name
    b.createdAt,
    b.updatedAt,
    b.service_provider_id,
    b.status,
    b.price,
    b.panel_id,
    b.started,
    b.started_at,
    b.finished,
    b.finished_at,
    p.name AS panel_name,           -- Retrieve panel name
    sp.salon_name,          -- Retrieve salon name
    sp.address                     -- Retrieve salon address
    FROM
    Booking b
    JOIN
    User u ON b.userId = u.id
    JOIN
    Services s ON b.serviceId = s.id
    JOIN
    Panel p ON b.panel_id = p.id   -- Join with Panel table to get panel name
    JOIN
    wellwait_db.Service_Provider sp ON b.service_provider_id = sp.id  -- Join with Service_Provider table
    WHERE
    b.scheduled_date = ?
    AND b.userId = ?
    AND b.status != 0
    ORDER BY
    b.id ASC;

    `;

    // Execute the query with scheduled_date and userId as parameters
    db.query(sqlQuery, [scheduled_date, userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);  // Send the results as JSON
    });
});

app.put('/cancel_booking/:id/status', (req, res) => {
    // Extract booking ID from the URL parameters
    const bookingId = req.params.id;

    // Construct the SQL update query
    const sqlQuery = `
        UPDATE wellwait_db.Booking
        SET status = 0
        WHERE id = ?;
    `;

    // Execute the update query
    db.query(sqlQuery, [bookingId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Check if any rows were affected (updated)
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Send a success response
        res.json({ message: 'Booking status updated successfully' });
    });
});

app.put('/update_booking_started/:id', (req, res) => {
    const { id } = req.params; // Get the ID from the URL

    // Get the current time in HH:mm format
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const startedAt = `${hours}:${minutes}`;

    // SQL query to update the booking
    const sql = `
        UPDATE Booking
        SET started = 1, started_at = ?, status = 2
        WHERE id = ?
    `;
    const values = [startedAt, id];

    // Execute the query
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking updated successfully' });
    });
});

app.put('/update_booking_finished/:id', (req, res) => {
    const { id } = req.params; // Get the ID from the URL

    // Get the current time in HH:mm format
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const finishedAt = `${hours}:${minutes}`;

    // SQL query to update the booking
    const sql = `
        UPDATE Booking
        SET finished = 1, finished_at = ?, status = 3
        WHERE id = ?
    `;
    const values = [finishedAt, id];

    // Execute the query
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.status(200).json({ message: 'Booking updated successfully' });
    });
});

app.get('/getmyfavorite', (req, res) => {
  const { user_id } = req.query;
  if ( !user_id) {
        return res.status(400).json({ error: 'userId are required' });
    }
    const sqlQuery = `
    SELECT
    sp.id AS service_provider_id,
    sp.salon_name,
    sp.address,
    sp.photo,
    AVG(s.rating) AS average_rating
FROM
    wellwait_db.user_favorite uf
INNER JOIN
    wellwait_db.Service_Provider sp
ON
    uf.service_provider_id = sp.id
INNER JOIN
    wellwait_db.Services s
ON
    sp.id = s.service_provider_id
WHERE
    uf.user_id = ?
GROUP BY
    sp.id, sp.salon_name, sp.address, sp.photo;

    `;
    db.query(sqlQuery, [user_id], (error, results) => {
        if (error) { return res.status(500).json({ error: error.message });}
        res.json(results);  // Send the results as JSON
    });
});

app.post('/addmyfavorite', async (req, res) => {
  const { user_id, service_provider_id } = req.body;

  const query = 'INSERT INTO wellwait_db.user_favorite(user_id, service_provider_id) VALUES (?, ?)';
  db.query(query, [user_id, service_provider_id], (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.status(200).json({ message: `Service provider added to favorite` });
  });
});

app.put('/update_user/:id', (req, res) => {
    const { id } = req.params;
    const { email, username, phone_number, birthday, gender} = req.body; // Get data from the request body

    // Validate input
    if (!email || !username || !phone_number || !birthday || !gender) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // SQL query to update the service provider
    const sql = `
        UPDATE wellwait_db.User
        SET email = ?, username = ?, phone_number = ?, birthday = ?, gender = ?
        WHERE id = ?
    `;
    const values = [email, username, phone_number, birthday, gender, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Service provider not found' });
        }
        res.status(200).json({ message: 'Service provider updated successfully' });
    });
});

app.get('/get_service_provider_by_id/:service_provider_id', (req, res) => {
  const { service_provider_id } = req.params;
  const query = `
  SELECT
  sp.id,
  sp.name AS provider_name,
  sp.salon_name,
  sp.address,
  sp.mobile_number,
  sp.email,
  sp.view_count
FROM
  Service_Provider AS sp
  WHERE
    sp.id = ?
  `;

  db.query(query, [service_provider_id] ,(err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
});

/*app.get('/salon_service_providers', async (req, res) => {
  try {
    // Ensure you're using async/await with promise-based MySQL2
    const [providers] = await db.query("SELECT * FROM Service_Provider");

    res.status(200).json(providers);
  } catch (error) {
    console.error('Error fetching service providers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});*/

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


/*SELECT
  sp.id,
  sp.name AS provider_name,
  sp.salon_name,
  sp.address,
  sp.mobile_number,
  sp.email,
  GROUP_CONCAT(s.category SEPARATOR ', ') AS categories,
  GROUP_CONCAT(s.promo_image SEPARATOR ', ') AS promo_images
FROM
  Service_Provider AS sp
LEFT JOIN
  Services AS s ON sp.id = s.service_provider_id
GROUP BY
  sp.id, sp.name, sp.salon_name, sp.address, sp.mobile_number, sp.email
*/
