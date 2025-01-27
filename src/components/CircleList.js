import React, { useState, useEffect } from 'react';
import api from '../services/apiCalling';

function CirclesList({ updateCircleCount }) {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const response = await api.getAllCircles();
        if (!response.length) {
          setError('No circles found.');
          setCircles([]);
        } else {
          setCircles(response);
          if (updateCircleCount) updateCircleCount(response.length);
        }
      } catch (err) {
        setError('Failed to fetch circles');
      } finally {
        setLoading(false);
      }
    };
    fetchCircles();
  }, [updateCircleCount]);

  const deleteCircle = async (circleId) => {
    try {
      await api.deleteCircle(circleId);
      const updatedCircles = circles.filter((circle) => circle._id !== circleId);
      setCircles(updatedCircles);
      if (updateCircleCount) updateCircleCount(updatedCircles.length);
      if (selectedCircle && selectedCircle._id === circleId) setSelectedCircle(null);
    } catch (err) {
      setError('Failed to delete circle');
    }
  };

  // Filter circles based on search term
  const filteredCircles = circles.filter((circle) =>
    circle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: { display: 'flex', padding: '20px', backgroundColor: '#f9f9f9', height: '100vh' },
    listContainer: { flex: 3, padding: '10px', maxHeight: '100%', overflowY: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' },
    tableHeader: { backgroundColor: '#ff8852', fontWeight: 'bold', color: '#333', padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' },
    tableRow: { borderBottom: '1px solid #ddd', cursor: 'pointer', transition: 'background-color 0.3s' },
    tableCell: { padding: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    actions: { display: 'flex', gap: '10px' },
    button: { padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.3s' },
    viewButton: { backgroundColor: '#FF8852', color: '#333' },
    deleteButton: { backgroundColor: '#f44336', color: 'white' },
    detailContainer: { flex: 1, padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', overflowY: 'auto', maxHeight: '100%' },
    header: { textAlign: 'center', color: '#333', marginBottom: '20px', fontSize: '1.5em' },
    circleDetails: { marginBottom: '20px' },
    detail: { margin: '5px 0', color: '#555' },
    dropdown: { margin: '5px 0', cursor: 'pointer', color: '#007bff' },
    noSelectionMessage: { textAlign: 'center', color: '#888', fontStyle: 'italic' },
    searchContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '10px', // Adjusts the space between input and button
    },
    
    searchInput: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '90%' },
    searchButton: { padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#4caf50', color: 'white', cursor: 'pointer',},
  };

  if (loading) return <p style={styles.loading}>Loading circles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        <h2 style={styles.header}>Circles ({filteredCircles.length})</h2>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search circles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button onClick={() => setSearchTerm('')} style={styles.searchButton}>Clear</button>
        </div>
        {filteredCircles.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Circle Name</th>
                <th style={styles.tableHeader}>Circle Code</th>
                <th style={styles.tableHeader}>Admin ID</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCircles.map((circle) => (
                <tr
                  key={circle._id}
                  style={styles.tableRow}
                  onClick={() => setSelectedCircle(circle)}
                >
                  <td style={styles.tableCell}>{circle.name}</td>
                  <td style={styles.tableCell}>{circle.circleCode}</td>
                  <td style={styles.tableCell}>{circle.adminId}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.actions}>
                      <button
                        style={{ ...styles.button, ...styles.viewButton }}
                        onClick={(e) => { e.stopPropagation(); setSelectedCircle(circle); }}
                      >
                        View Details
                      </button>
                      <button
                        style={{ ...styles.button, ...styles.deleteButton }}
                        onClick={(e) => { e.stopPropagation(); deleteCircle(circle._id); }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No circles found.</p>
        )}
      </div>
      <div style={styles.detailContainer}>
        <h2 style={styles.header}>Circle Details</h2>
        {selectedCircle ? (
          <>
            <div style={styles.circleDetails}>
              <p style={styles.detail}><strong>Circle Name:</strong> {selectedCircle.name}</p>
              <p style={styles.detail}><strong>Circle Code:</strong> {selectedCircle.circleCode}</p>
              <p style={styles.detail}><strong>Admin ID:</strong> {selectedCircle.adminId}</p>
              <p
                style={styles.dropdown}
                onClick={() => setShowContacts(!showContacts)}
              >
                <strong>Contacts:</strong> {showContacts ? '▲' : '▼'}
              </p>
              {showContacts && selectedCircle.contacts && (
                <ul>
                  {selectedCircle.contacts.map((contact) => (
                    <li key={contact._id} style={styles.detail}>
                      <strong>User ID:</strong> {contact.userId} - <strong>Role:</strong> {contact.role}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <p style={styles.noSelectionMessage}>Select a circle to see details.</p>
        )}
      </div>
    </div>
  );
}

export default CirclesList;
