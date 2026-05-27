import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import adminService from '../services/admin.service';
import { AdminSidebar } from '../components/common/AdminSidebar/AdminSidebar';
import { useAuth } from '../context/AuthContext';

export const AdminManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      });
      setUsers(response.data || []);
      setPagination(response.pagination || { currentPage: page, totalPages: 1, totalItems: 0, limit: 10 });
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error('Unable to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?._id && newRole !== 'admin') {
      const otherAdminExists = users.some(
        (u) => u.role === 'admin' && u.isActive !== false && u._id !== currentUser?._id
      );
      if (!otherAdminExists) {
        return toast.error('Action denied. You are the only active Admin. You must assign another Admin first.');
      }
    }

    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully.');
      setUsers((curr) =>
        curr.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to change role', err);
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = !currentStatus;
    if (userId === currentUser?._id && !nextStatus) {
      const otherAdminExists = users.some(
        (u) => u.role === 'admin' && u.isActive !== false && u._id !== currentUser?._id
      );
      if (!otherAdminExists) {
        return toast.error('Action denied. You are the only active Admin. You must assign another Admin first.');
      }
    }

    try {
      await adminService.toggleUserStatus(userId, nextStatus);
      toast.success(nextStatus ? 'User account activated.' : 'User account deactivated.');
      setUsers((curr) =>
        curr.map((u) => (u._id === userId ? { ...u, isActive: nextStatus } : u))
      );
    } catch (err) {
      console.error('Failed to toggle user status', err);
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Helmet>
        <title>Manage Users – Admin</title>
        <meta name="description" content="View users, assign roles, and activate/deactivate accounts." />
      </Helmet>

      <section className="container page-section">
        <div className="section-heading" style={{ textAlign: 'left', marginBottom: '30px' }}>
          <h2>Manage Users</h2>
          <p>Control user accounts, assign roles (Admin, Seller, User), and activate or block access.</p>
        </div>

        <div className="admin-layout">
          <AdminSidebar />

          <main className="admin-main-content">
            {/* Filters panel */}
            <form className="admin-filters-panel" onSubmit={handleSearchSubmit}>
              <div className="filters-search-wrapper">
                <svg className="filters-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="filters-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="filters-actions">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="role-select"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                  Search
                </button>
              </div>
            </form>

            {/* Users list table */}
            {loading ? (
              <div className="loading-state" style={{ padding: '60px 0' }}>Fetching accounts...</div>
            ) : users.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}>
                No user accounts found matching requirements.
              </div>
            ) : (
              <>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="user-info-cell">
                              <div className="user-initials-avatar">{getInitials(user.name)}</div>
                              <div className="user-meta-details">
                                <span className="user-meta-name">{user.name}</span>
                                <span className="user-meta-email">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="role-select"
                              style={{ fontSize: '0.85rem' }}
                            >
                              <option value="user">User</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${user.isActive !== false ? 'success' : 'error'}`}>
                              {user.isActive !== false ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user._id, user.isActive !== false)}
                              className={`status-toggle-btn ${user.isActive !== false ? 'btn-inactive' : 'btn-active'}`}
                            >
                              {user.isActive !== false ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="admin-pagination">
                    <span className="pagination-text">
                      Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} users)
                    </span>
                    <div className="pagination-controls">
                      <button
                        type="button"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setPage((p) => p - 1)}
                        className="pagination-btn"
                      >
                        Prev
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`pagination-btn ${pagination.currentPage === p ? 'active' : ''}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={!pagination.hasNextPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>
    </>
  );
};

export default AdminManageUsers;
