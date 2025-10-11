import React, { useState, useEffect } from 'react';
import { User, UserRole, createUser, updateUser, deleteUser, getAllUsers, checkUsernameExists, getRoleDisplayName } from '../auth';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    roles: [] as UserRole[]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load users on component mount
  useEffect(() => {
    console.log('UserManagement component mounted, refreshing users...');
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    const allUsers = getAllUsers();
    console.log('Refreshing users, found:', allUsers);
    setUsers(allUsers);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      fullName: '',
      roles: []
    });
    setError('');
    setSuccess('');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.roles.length === 0) {
      setError('At least one role must be selected');
      return;
    }
    if (checkUsernameExists(formData.username)) {
      setError('Username already exists');
      return;
    }

    try {
      createUser({
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim() || undefined,
        fullName: formData.fullName.trim() || undefined,
        roles: formData.roles
      });

      setSuccess(`User "${formData.username}" created successfully!`);
      resetForm();
      setShowAddForm(false);
      refreshUsers();
    } catch (error) {
      setError('Failed to create user');
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError('');
    setSuccess('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.roles.length === 0) {
      setError('At least one role must be selected');
      return;
    }
    if (checkUsernameExists(formData.username, editingUser.id)) {
      setError('Username already exists');
      return;
    }

    try {
      const updates: Partial<Omit<User, 'id' | 'createdAt'>> = {
        username: formData.username.trim(),
        email: formData.email.trim() || undefined,
        fullName: formData.fullName.trim() || undefined,
        roles: formData.roles
      };

      // Only update password if provided
      if (formData.password.trim()) {
        updates.password = formData.password;
      }

      updateUser(editingUser.id, updates);
      setSuccess(`User "${formData.username}" updated successfully!`);
      resetForm();
      setEditingUser(null);
      refreshUsers();
    } catch (error) {
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?\n\nThis action cannot be undone.`)) {
      try {
        deleteUser(user.id);
        setSuccess(`User "${user.username}" deleted successfully!`);
        refreshUsers();
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password for security
      email: user.email || '',
      fullName: user.fullName || '',
      roles: [...user.roles]
    });
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingUser(null);
    resetForm();
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="user-management">
      {(success || error) && (
        <div className={`alert ${success ? 'alert-success' : 'alert-error'}`}>
          {success || error}
        </div>
      )}

      {!showAddForm && !editingUser && (
        <div style={{ marginBottom: '1rem' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            ➕ Add New User
          </button>
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="user-form-container">
          <form onSubmit={handleAddUser} className="user-form">
            <h4>➕ Add New User</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Roles * (Select at least one)</label>
              <div className="role-checkboxes">
                {(['superadmin', 'admin', 'user'] as UserRole[]).map(role => (
                  <label key={role} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                    />
                    <span>{getRoleDisplayName(role)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                ✅ Create User
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => { setShowAddForm(false); resetForm(); }}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form - Now rendered inline below selected user */}

      {/* Users List */}
      <div className="users-list">
        <h4>All Users</h4>
        
        {users.length === 0 ? (
          <div className="no-data">No users found</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <React.Fragment key={user.id}>
                    <tr className={editingUser?.id === user.id ? 'editing' : ''}>
                      <td>
                        <strong>{user.username}</strong>
                      </td>
                      <td>{user.fullName || '-'}</td>
                      <td>{user.email || '-'}</td>
                      <td>
                        <div className="user-roles">
                          {user.roles.map(role => (
                            <span key={role} className={`role-tag role-${role}`}>
                              {getRoleDisplayName(role)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                      <td>
                        <div className="user-actions">
                          <button
                            className="btn btn-small btn-secondary"
                            onClick={() => startEdit(user)}
                            disabled={showAddForm || (!!editingUser && editingUser.id !== user.id)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteUser(user)}
                            disabled={showAddForm || !!editingUser}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Inline Edit Form */}
                    {editingUser?.id === user.id && (
                      <tr className="edit-form-row">
                        <td colSpan={7}>
                          <div className="inline-edit-form">
                            <form onSubmit={handleUpdateUser} className="user-edit-form">
                              <h4>✏️ Edit User: {editingUser.username}</h4>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label>Username *</label>
                                  <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                                    placeholder="Enter username"
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>New Password (leave blank to keep current)</label>
                                  <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                                    placeholder="Enter new password (min 6 characters)"
                                    minLength={6}
                                  />
                                </div>
                              </div>

                              <div className="form-row">
                                <div className="form-group">
                                  <label>Full Name</label>
                                  <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                                    placeholder="Enter full name"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Email</label>
                                  <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                                    placeholder="Enter email address"
                                  />
                                </div>
                              </div>

                              <div className="form-group">
                                <label>Roles * (Select at least one)</label>
                                <div className="role-checkboxes">
                                  {(['superadmin', 'admin', 'reviewer', 'user'] as UserRole[]).map(role => (
                                    <label key={role} className="checkbox-label">
                                      <input
                                        type="checkbox"
                                        checked={formData.roles.includes(role)}
                                        onChange={() => handleRoleToggle(role)}
                                      />
                                      <span>{getRoleDisplayName(role)}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                  💾 Update User
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-secondary"
                                  onClick={cancelEdit}
                                >
                                  ❌ Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;