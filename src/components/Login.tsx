import React, { useState } from 'react';
import { User, UserRole, authenticateUser, canUserAccessRole, getRoleDisplayName } from '../auth';
import './Login.css';

interface LoginProps {
  onLogin: (user: User, role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for better UX
    setTimeout(() => {
      const user = authenticateUser(username, password);
      
      if (user) {
        setAuthenticatedUser(user);
        setSelectedRole(''); // Reset role selection
        setError('');
      } else {
        setError('Invalid username or password');
        setAuthenticatedUser(null);
        setSelectedRole('');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleRoleSelection = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticatedUser && selectedRole) {
      if (canUserAccessRole(authenticatedUser, selectedRole as UserRole)) {
        onLogin(authenticatedUser, selectedRole as UserRole);
      } else {
        setError('You do not have permission to access this role');
      }
    }
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setSelectedRole('');
    setUsername('');
    setPassword('');
    setError('');
  };

  const getAvailableRoles = (user: User): UserRole[] => {
    return user.roles.sort((a, b) => {
      const order = { 'superadmin': 0, 'admin': 1, 'reviewer': 2, 'user': 3 };
      return (order[a] || 999) - (order[b] || 999);
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>📊 Building Readings System</h1>
          <p>Please log in to access the system</p>
        </div>

        {!authenticatedUser ? (
          // Step 1: Username/Password Authentication
          <form onSubmit={handleAuthenticate} className="login-form">
            <h2>🔐 Authentication</h2>
            
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? '🔄 Authenticating...' : '🔑 Authenticate'}
            </button>

            {/* Demo credentials helper */}
            <div className="demo-credentials">
              <h4>🔑 Available Test Credentials</h4>
              <p className="demo-note">Click any credential to auto-fill the form</p>
              <div className="credentials-grid">
                <div 
                  className="credential-item superadmin"
                  onClick={() => {setUsername('superadmin'); setPassword('super123');}}
                >
                  <div className="role-badge">🔧 Super Admin</div>
                  <div className="credential-text">superadmin / super123</div>
                  <div className="role-desc">System configuration & management</div>
                </div>
                <div 
                  className="credential-item admin"
                  onClick={() => {setUsername('admin'); setPassword('admin123');}}
                >
                  <div className="role-badge">⚙️ Administrator</div>
                  <div className="credential-text">admin / admin123</div>
                  <div className="role-desc">Data management & direct entry</div>
                </div>
                <div 
                  className="credential-item reviewer"
                  onClick={() => {setUsername('reviewer'); setPassword('reviewer123');}}
                >
                  <div className="role-badge">🔍 Reviewer</div>
                  <div className="credential-text">reviewer / reviewer123</div>
                  <div className="role-desc">Quality control & data approval</div>
                </div>
                <div 
                  className="credential-item supervisor"
                  onClick={() => {setUsername('supervisor'); setPassword('supervisor123');}}
                >
                  <div className="role-badge">👨‍💼 Supervisor</div>
                  <div className="credential-text">supervisor / supervisor123</div>
                  <div className="role-desc">Admin + Reviewer capabilities</div>
                </div>
                <div 
                  className="credential-item manager"
                  onClick={() => {setUsername('manager'); setPassword('manager123');}}
                >
                  <div className="role-badge">🏢 Manager</div>
                  <div className="credential-text">manager / manager123</div>
                  <div className="role-desc">Building management & admin</div>
                </div>
                <div 
                  className="credential-item user"
                  onClick={() => {setUsername('user'); setPassword('user123');}}
                >
                  <div className="role-badge">👤 User</div>
                  <div className="credential-text">user / user123</div>
                  <div className="role-desc">Data entry & submissions</div>
                </div>
                <div 
                  className="credential-item technician"
                  onClick={() => {setUsername('technician'); setPassword('tech123');}}
                >
                  <div className="role-badge">🔧 Technician</div>
                  <div className="credential-text">technician / tech123</div>
                  <div className="role-desc">Field data collection</div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          // Step 2: Role Selection
          <div className="role-selection">
            <div className="user-info">
              <h2>👋 Welcome, {authenticatedUser.fullName || authenticatedUser.username}!</h2>
              <p className="user-email">{authenticatedUser.email}</p>
            </div>

            <form onSubmit={handleRoleSelection} className="role-form">
              <h3>🎯 Select Your Role</h3>
              <p>Choose the role you want to use for this session:</p>

              <div className="role-options">
                {getAvailableRoles(authenticatedUser).map(role => (
                  <label key={role} className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    />
                    <div className="role-card">
                      <div className="role-title">{getRoleDisplayName(role)}</div>
                      <div className="role-description">
                        {role === 'superadmin' && 'Full system configuration and user management'}
                        {role === 'admin' && 'Data management and reading point configuration'}
                        {role === 'user' && 'Data collection and basic viewing'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!selectedRole}
                >
                  🚀 Continue as {selectedRole ? getRoleDisplayName(selectedRole as UserRole) : '...'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleLogout}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;