import React, { useState, useEffect } from 'react';
import api from '../services/apiCalling';

function SOSList({ updateSOSCount }) {
  const [sosRecords, setSosRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  useEffect(() => {
    const fetchSOSRecords = async () => {
      try {
        const response = await api.getAllSOS();
        setSosRecords(response.data);
        if (updateSOSCount) updateSOSCount(response.data.length);
      } catch (err) {
        setError('Failed to fetch SOS records');
      } finally {
        setLoading(false);
      }
    };
    fetchSOSRecords();
  }, [updateSOSCount]);

  const deleteSOS = async (sosId) => {
    try {
      await api.deleteSOS(sosId);
      const updatedRecords = sosRecords.filter((sos) => sos._id !== sosId);
      setSosRecords(updatedRecords);
      if (updateSOSCount) updateSOSCount(updatedRecords.length);
      if (selectedSOS && selectedSOS._id === sosId) setSelectedSOS(null);
    } catch (err) {
      setError('Failed to delete SOS record');
    }
  };

  // Filter sosRecords based on search term
  const filteredSOSRecords = sosRecords.filter((sos) =>
    sos.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sos.userLocation?.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sos.circles.some(circle => circle.circleName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const styles = {
    container: {
      display: 'flex',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      height: '100vh',
    },
    listContainer: {
      flex: 3,
      padding: '10px',
      maxHeight: '100%',
      overflowY: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    tableHeader: {
      backgroundColor: '#ff8852',
      fontWeight: 'bold',
      color: '#333',
      padding: '10px',
      borderBottom: '2px solid #ddd',
      textAlign: 'left',
    },
    tableRow: {
      borderBottom: '1px solid #ddd',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    tableCell: {
      padding: '10px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    actions: {
      display: 'flex',
      gap: '10px',
    },
    button: {
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    viewButton: {
      backgroundColor: '#ff8852',
      color: '#333',
    },
    deleteButton: {
      backgroundColor: '#f44336',
      color: 'white',
    },
    detailContainer: {
      flex: 1,
      padding: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
      overflowY: 'auto',
      maxHeight: '100%',
    },
    header: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '20px',
      fontSize: '1.5em',
    },
    sosDetails: {
      marginBottom: '10px',
    },
    detail: {
      margin: '5px 0',
      color: '#555',
    },
    contactsToggle: {
      cursor: 'pointer',
      color: '#ff9800',
      textDecoration: 'underline',
      marginTop: '10px',
    },
    contactDetails: {
      marginLeft: '10px',
      color: '#333',
    },
    cname: {
      color: '#007bff',
    },
    searchContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    searchInput: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      width: '90%',
    },
    searchButton: {
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: '#4caf50',
      color: 'white',
      cursor: 'pointer',
    },
  };

  if (loading) return <p>Loading SOS records...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        <h2 style={styles.header}>SOS Records ({filteredSOSRecords.length})</h2>
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
            {filteredSOSRecords.map((sos) => (
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
      </div>
      <div style={styles.detailContainer}>
        <h2 style={styles.header}>User SOS Details</h2>

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
                <strong>Battery Status:</strong>{" "}
                {selectedSOS.sender.batteryStatus}%
              </p>
              <p style={styles.detail}>
                <strong>Sender:</strong> {selectedSOS.sender.name}
              </p>
              <p style={styles.detail}>
                <strong>Created At:</strong>{" "}
                {new Date(selectedSOS.createdAt).toLocaleString()}
              </p>
              <p style={styles.detail}>
                <strong>Circles:</strong>{" "}
                {selectedSOS.circles
                  .map((circle) => circle.circleName)
                  .join(", ")}
              </p>
              <p
                style={styles.contactsToggle}
                onClick={() => setShowContacts(!showContacts)}
              >
                Contacts {showContacts ? "▲" : "▼"}
              </p>
              {showContacts && (
                <div>
                  {selectedSOS.contacts.map((contact) => (
                    <div key={contact.contactId} style={styles.contactDetails}>
                      <p style={styles.cname}>
                        <strong>Name:</strong> {contact.name}
                      </p>
                      <p>
                        <strong>Notified Via:</strong> {contact.notifiedVia}
                      </p>
                      <p>
                        <strong>Acknowledged:</strong>{" "}
                        {contact.acknowledged ? "Yes" : "No"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p
            style={{ textAlign: "center", color: "#888", fontStyle: "italic" }}
          >
            Select an SOS record to see details.
          </p>
        )}
      </div>
    </div>
  );
}

export default SOSList;
