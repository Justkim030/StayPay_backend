const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Property } = require('../models');
const { Op } = require('sequelize'); // **CRITICAL FIX: Import the Op operator**

exports.register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check for existing user by email OR phone
    const existingUser = await User.findOne({ where: { [Op.or]: [{ email: email }, { phone: phone }] } });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      if (existingUser.phone === phone) {
        return res.status(409).json({ message: 'An account with this phone number already exists.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      phone,
      password_hash: hashedPassword,
      role,
    });

    if (user.role === 'Landlord') {
      await Property.create({
        landlord_id: user.id,
        name: 'Default Property',
        address: 'N/A',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
};
