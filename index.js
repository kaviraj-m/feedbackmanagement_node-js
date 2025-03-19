const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const db = require('./models');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/departments', require('./routes/department.routes'));

// Simple route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Feedback Management System API.' });
});

// Set port and start server
const PORT = process.env.PORT || 8080;

// Import seeders
const runSeeders = require('./seeders');

// Sync database, run seeders, and start server
db.sequelize.sync()
  .then(async () => {
    console.log('Database synchronized successfully.');
    
    // Run database seeders
    await runSeeders();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err.message);
  });