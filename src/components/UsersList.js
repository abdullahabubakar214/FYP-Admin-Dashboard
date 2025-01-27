import React, { useState, useEffect } from 'react';
import api from '../services/apiCalling'; // Ensure updateUser is included in the api object
import { FaSync } from 'react-icons/fa';

function UsersList({ updateUserCount }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLocation, setUserLocation] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userUpdates, setUserUpdates] = useState({});
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getAllUsers();
        setUsers(response.data);
        updateUserCount(response.data.length); // Update user count in AdminDashboard
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [updateUserCount]);

  const fetchLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      return 'Location not found';
    }
  };

  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    const { latitude, longitude } = user.location;
    const location = await fetchLocation(latitude, longitude);
    setUserLocation(location);
  };

  const refreshLocation = async () => {
    if (selectedUser) {
      setIsFetchingLocation(true);
      const { latitude, longitude } = selectedUser.location;
      const location = await fetchLocation(latitude, longitude);
      setUserLocation(location);
      setIsFetchingLocation(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setUserLocation('');
    setEditMode(false);
    setUserUpdates({});
  };

  const deleteUser = async (userId) => {
    try {
      await api.deleteUser(userId);
      const updatedUsers = users.filter((user) => user._id !== userId);
      setUsers(updatedUsers);
      updateUserCount(updatedUsers.length); // Update count after deletion
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setUserUpdates({ name: user.name, email: user.email, phoneNumber: user.phoneNumber });
    setEditMode(true);
  };

  const handleUpdateUser = async () => {
    try {
      await api.updateUser(selectedUser._id, userUpdates); // Use the imported updateUser function
      const updatedUsers = users.map(user => 
        user._id === selectedUser._id ? { ...user, ...userUpdates } : user
      );
      setUsers(updatedUsers);
      handleCloseDetails();
    } catch (err) {
      setError('Failed to update user');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: {
      display: "flex",
      padding: "20px",
      backgroundColor: "#f9f9f9",
      height: "100vh",
    },
    userList: {
      flex: 3,
      padding: "10px",
      maxHeight: "100%",
      overflowY: "auto",
    },
    userDetails: {
      flex: 1,
      padding: "20px",
      backgroundColor: "#fff",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      overflowY: "auto",
      maxHeight: "100%",
    },
    header: {
      textAlign: "center",
      color: "#333",
      marginBottom: "20px",
      fontSize: "1.5em",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    },
    tableHeader: {
      backgroundColor: "#ff8852", // Orange background for header
      fontWeight: "bold",
      color: "#333",
      padding: "10px",
      borderBottom: "2px solid #ddd",
      textAlign: "left",
    },
    tableRow: {
      borderBottom: "1px solid #ddd",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    tableCell: {
      padding: "10px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    actions: {
      display: "flex",
      gap: "10px",
    },
    button: {
      padding: "6px 12px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s",
    },
    viewButton: {
      backgroundColor: "#ff8852", // Orange background for view button
      color: "#333",
    },
    deleteButton: {
      backgroundColor: "#f44336", // Red background for delete button
      color: "white",
    },
    editButton: {
      backgroundColor: "#2196F3", // Blue background for edit button
      color: "white",
    },
    detailsPanel: {
      marginBottom: "10px",
      color: "#555",
    },
    refreshIcon: {
      cursor: "pointer",
      marginLeft: "8px",
      color: "#ff9800", // Orange color for refresh icon
    },
    searchContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    searchInput: {
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      width: "90%",
    },
    searchButton: {
      padding: "8px 16px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#4caf50",
      color: "white",
      cursor: "pointer",
    },
    noSelectionMessage: {
      textAlign: "center",
      color: "#888",
      fontStyle: "italic",
    },
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.userList}>
        <h2 style={styles.header}>User List</h2>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button onClick={() => setSearchTerm("")} style={styles.searchButton}>
            Clear
          </button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>#</th>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Phone Number</th>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user._id}
                style={styles.tableRow}
                onClick={() => handleViewDetails(user)}
              >
                <td style={styles.tableCell}>{index + 1}</td>
                <td style={styles.tableCell}>{user.name}</td>
                <td style={styles.tableCell}>{user.phoneNumber || "N/A"}</td>
                <td style={styles.tableCell}>{user.email}</td>
                <td style={styles.tableCell}>
                  <div style={styles.actions}>
                    <button
                      style={{ ...styles.button, ...styles.viewButton }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(user);
                      }}
                    >
                      View Details
                    </button>

                    <button
                      style={{ ...styles.button, ...styles.deleteButton }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUser(user._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.userDetails}>
        <h2 style={styles.header}>User Details</h2>

        {selectedUser ? (
          <div style={styles.detailsPanel}>
            <h2 style={styles.header}>User Details</h2>
            {editMode ? (
              <div>
                <input
                  type="text"
                  value={userUpdates.name}
                  onChange={(e) =>
                    setUserUpdates({ ...userUpdates, name: e.target.value })
                  }
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={userUpdates.email}
                  onChange={(e) =>
                    setUserUpdates({ ...userUpdates, email: e.target.value })
                  }
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={userUpdates.phoneNumber}
                  onChange={(e) =>
                    setUserUpdates({
                      ...userUpdates,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="Phone Number"
                />
                <button
                  onClick={handleUpdateUser}
                  style={{
                    ...styles.button,
                    marginTop: "10px",
                    backgroundColor: "#ff9800",
                    color: "white",
                  }}
                >
                  Update User
                </button>
                <button
                  onClick={handleCloseDetails}
                  style={{
                    ...styles.button,
                    marginTop: "10px",
                    backgroundColor: "#777",
                    color: "white",
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <p>
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.phoneNumber || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {selectedUser.status || "N/A"}
                </p>
                <p>
                  <strong>Battery Level:</strong>{" "}
                  {selectedUser.batteryLevel ?? "N/A"}%
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {userLocation || "Location not available"}
                  <FaSync
                    onClick={refreshLocation}
                    style={styles.refreshIcon}
                    title="Refresh Location"
                  />
                </p>
                <p>
                  <a
                    href={`https://www.google.com/maps?q=${selectedUser.location.latitude},${selectedUser.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Maps
                  </a>
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
                {selectedUser.profileImage && (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.name}
                    style={{ width: "100%", borderRadius: "4px" }}
                  />
                )}
                <button
                  onClick={handleCloseDetails}
                  style={{
                    ...styles.button,
                    marginTop: "10px",
                    backgroundColor: "#777",
                    color: "white",
                  }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        ) : (
          <p style={styles.noSelectionMessage}>Select a user to view details.</p>
        )}
      </div>
    </div>
  );
}

export default UsersList;
