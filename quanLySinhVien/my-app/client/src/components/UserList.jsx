import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import UserForm from './UserForm';
import './UserList.css';
 
function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm lấy dữ liệu từ API
  const fetchUsers = async (search = '') => {
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/users${search ? `?search=${search}` : ''}`);
      setUsers(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      setError('Không thể tải dữ liệu sinh viên. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchUsers('');
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Lỗi khi xóa sinh viên:', error);
        alert('Không thể xóa sinh viên. Vui lòng thử lại sau.');
      }
    }
  };

  const handleSaveUser = async (formData) => {
    try {
      if (currentUser) {
        // Cập nhật sinh viên
        const res = await axios.put(`http://localhost:5000/api/users/${currentUser.id}`, formData);
        setUsers(users.map(user => user.id === currentUser.id ? res.data : user));
      } else {
        // Thêm sinh viên mới
        const res = await axios.post('http://localhost:5000/api/users', formData);
        setUsers([...users, res.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu sinh viên:', error);
      alert('Không thể lưu thông tin sinh viên. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="user-list-container">
      <h2>Danh sách sinh viên</h2>

      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-button"
              onClick={handleClearSearch}
              title="Xóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit">Tìm kiếm</button>
        <button type="button" className="add-button" onClick={handleAddUser}>
          Thêm sinh viên
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searchTerm && (
        <div className="search-results-info">
          <p>
            Kết quả tìm kiếm cho: <span className="search-term">"{searchTerm}"</span>
            {users.length > 0 ? ` (${users.length} kết quả)` : ''}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="loading">
          <p>Đang tải dữ liệu sinh viên...</p>
        </div>
      ) : (
        <>
          {users.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.address || '-'}</td>
                    <td className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEditUser(user)}
                      >
                        Sửa
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>Không tìm thấy sinh viên nào. Hãy thêm sinh viên mới hoặc thử tìm kiếm khác.</p>
              {searchTerm && (
                <button
                  className="return-button"
                  onClick={() => {
                    setSearchTerm('');
                    fetchUsers();
                  }}
                >
                  Quay về danh sách sinh viên
                </button>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentUser ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên mới'}
      >
        <UserForm
          user={currentUser}
          onSave={handleSaveUser}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default UserList;
