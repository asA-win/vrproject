const express = require('express');
const path = require('path');
const mysql = require('mysql');
const { promisify } = require('util');

const app = express();

app.use(express.json()); // Add this line to parse JSON data in the request body

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: 'library_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Promisify the database query function
const query = promisify(connection.query).bind(connection);

// Test the database connection
connection.getConnection((err, conn) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL as id ' + conn.threadId);
    conn.release(); // Release the connection back to the pool
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'library.html'));
});

// Route to fetch books from the database
app.get('/api/books', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM books');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/api/books', async (req, res) => {
  try {
      const { search } = req.query;
      let query = 'SELECT * FROM books';
      let queryParams = [];

      if (search) {
          query += ' WHERE title LIKE ? OR author LIKE ?';
          queryParams = [`%${search}%`, `%${search}%`];
      }

      const rows = await query(query, queryParams);
      res.json(rows);
  } catch (err) {
      console.error('Error fetching books:', err);
      res.status(500).send('Internal Server Error');
  }
});

// Route to add a book to the database
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, genre, year } = req.body;
    
    // Insert the book into the database
    const result = await query('INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)', [title, author, genre, year]);

    // Check if the insertion was successful
    if (result.affectedRows === 1) {
      res.status(200).send('Book added successfully');
    } else {
      throw new Error('Failed to add book');
    }
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to delete selected books from the database
app.delete('/api/books', async (req, res) => {
  try {
    const { ids } = req.body;

    // Ensure that ids is an array
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Invalid or empty book IDs');
    }

    // Construct the SQL query to delete books with the specified IDs
    const sql = 'DELETE FROM books WHERE id IN (?)';

    // Execute the SQL query with the list of book IDs to delete
    const result = await query(sql, [ids]);

    // Check if any rows were affected (books deleted)
    if (result.affectedRows > 0) {
      res.status(200).send('Books deleted successfully');
    } else {
      throw new Error('Failed to delete books');
    }
  } catch (error) {
    console.error('Error deleting books:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to authenticate user
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (user.length === 1 && user[0].password === password) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to register new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const existingUser = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (existingUser.length > 0) {
      res.status(400).send('Username already exists');
    } else {
      const result = await query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email]);
      
      if (result.affectedRows === 1) {
        res.status(200).send('Registration successful');
      } else {
        throw new Error('Failed to register user');
      }
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
