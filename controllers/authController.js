const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res) => {
  try {
    const { fullname, username, password } = req.body;

    // Check if username already exists
    const [users] = await db.execute('SELECT username FROM users WHERE username = ?', [username]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (fullname, username, password) VALUES (?, ?, ?)',
      [fullname, username, hashedPassword]
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      userId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log(token);
    
    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

