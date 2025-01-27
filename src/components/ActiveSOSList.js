import React, { useState, useEffect } from 'react';
import api from '../services/apiCalling';

function ActiveSOSList({ updateActiveSOSCount }) { 
  const [activeSosRecords, setActiveSosRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  useEffect(() => {
    const fetchActiveSOSRecords = async () => {
      try {
        const response = await api.getActiveSOS();
        if (!response.length) {
          setError('No active SOS records found.');
          setActiveSosRecords([]);
        } else {
          setActiveSosRecords(response);
          if (updateActiveSOSCount) updateActiveSOSCount(response.length);
        }
      } catch (err) {
        setError('Failed to fetch active SOS records');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveSOSRecords();
  }, [updateActiveSOSCount]);

  const deleteSOS = async (sosId) => {
    try {
      await api.deleteSOS(sosId);
      const updatedRecords = activeSosRecords.filter((sos) => sos._id !== sosId);
      setActiveSosRecords(updatedRecords);
      if (updateActiveSOSCount) updateActiveSOSCount(updatedRecords.length);
      if (selectedSOS && selectedSOS._id === sosId) setSelectedSOS(null);
    } catch (err) {
      setError('Failed to delete SOS record');
    }
  };

  // Filter active SOS records based on the search term
  const filteredSosRecords = activeSosRecords.filter((sos) =>
    sos.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sos.userLocation?.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sos.circles.some(circle => circle.circleName.toLowerCase().includes(searchTerm.toLowerCase()))
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
    viewButton: { backgroundColor: '#ff8852', color: '#333' },
    deleteButton: { backgroundColor: '#f44336', color: 'white' },
    detailContainer: { flex: 1, padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', overflowY: 'auto', maxHeight: '100%' },
    header: { textAlign: 'center', color: '#333', marginBottom: '20px', fontSize: '1.5em' },
    sosDetails: { marginBottom: '10px' },
     noSelectionMessage: {
      textAlign: "center",
      color: "#888",
      fontStyle: "italic",
    },
    detail: { margin: '5px 0', color: '#555' },
    searchContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    searchInput: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '90%' },
    searchButton: { padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#4caf50', color: 'white', cursor: 'pointer' },
  };

  if (loading) return <p>Loading active SOS records...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        <h2 style={styles.header}>
          Active SOS Records ({filteredSosRecords.length})
        </h2>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search SOS records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button onClick={() => setSearchTerm("")} style={styles.searchButton}>
            Clear
          </button>
        </div>
        {filteredSosRecords.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Sender Name</th>
                <th style={styles.tableHeader}>Address</th>
                <th style={styles.tableHeader}>Circle Name</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSosRecords.map((sos) => (
                <tr
                  key={sos._id}
                  style={styles.tableRow}
                  onClick={() => setSelectedSOS(sos)}
                >
                  <td style={styles.tableCell}>{sos.sender.name}</td>
                  <td style={styles.tableCell}>{sos.userLocation?.address}</td>
                  <td style={styles.tableCell}>
                    {sos.circles.map((circle) => circle.circleName).join(", ")}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actions}>
                      <button
                        style={{ ...styles.button, ...styles.viewButton }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSOS(sos);
                        }}
                      >
                        View Details
                      </button>
                      <button
                        style={{ ...styles.button, ...styles.deleteButton }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSOS(sos._id);
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
        ) : (
          <p>No active SOS records found.</p>
        )}
      </div>
      <div style={styles.detailContainer}>
        <h2 style={styles.header}>Active SOS Details</h2>

        {selectedSOS ? (
          <>
            <h2 style={styles.header}>SOS Details</h2>
            <div style={styles.sosDetails}>
              <p style={styles.detail}>
                <strong>Message:</strong> {selectedSOS.message}
              </p>
              <p style={styles.detail}>
                <strong>Emergency Type:</strong> {selectedSOS.emergencyType}
              </p>
              <p style={styles.detail}>
                <strong>Address:</strong> {selectedSOS.userLocation?.address}
              </p>
              <p style={styles.detail}>
                <strong>Battery Status:</strong> {selectedSOS.batteryStatus}
              </p>
              {/* Add more details as needed */}
            </div>
          </>
        ) : (
          <p style={styles.noSelectionMessage}>Select an SOS record to view details.</p>
        )}
      </div>
    </div>
  );
}

export default ActiveSOSList;
