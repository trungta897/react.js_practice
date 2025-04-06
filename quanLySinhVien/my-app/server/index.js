// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // Import kết nối

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// API: Lấy danh sách người dùng
app.get('/api/users', (req, res) => {
  const searchTerm = req.query.search || '';

  let query = 'SELECT * FROM students';
  let params = [];

  if (searchTerm) {
    query = 'SELECT * FROM students WHERE name LIKE ? OR email LIKE ?';
    params = [`%${searchTerm}%`, `%${searchTerm}%`];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// API: Thêm sinh viên mới
app.post('/api/users', (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Tên và email là bắt buộc' });
  }

  const query = 'INSERT INTO students (name, email, phone, address) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, phone || null, address || null], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    }

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      phone,
      address
    });
  });
});

// API: Cập nhật thông tin sinh viên
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Tên và email là bắt buộc' });
  }

  const query = 'UPDATE students SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';
  db.query(query, [name, email, phone || null, address || null, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    res.json({
      id: parseInt(id),
      name,
      email,
      phone,
      address
    });
  });
});

// API: Xóa sinh viên
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM students WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    res.json({ message: 'Xóa sinh viên thành công' });
  });
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
