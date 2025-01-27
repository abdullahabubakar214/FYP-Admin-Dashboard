import React, { useState, useEffect } from 'react';
import api from '../services/apiCalling';

function UserCardList({ setUserCardCount }) {
    const [userCards, setUserCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUserCards = async () => {
            try {
                const response = await api.getAllUserCards();
                if (response.success && Array.isArray(response.data)) {
                    setUserCards(response.data);
                    setUserCardCount(response.data.length);
                } else {
                    setError('Unexpected response format');
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch user cards');
            } finally {
                setLoading(false);
            }
        };
        fetchUserCards();
    }, [setUserCardCount]);

    const handleDelete = async (id) => {
        try {
            await api.deleteUserCard(id);
            setUserCards(userCards.filter(card => card._id.$oid !== id));
            setUserCardCount(userCards.length - 1);
            if (selectedCard && selectedCard._id.$oid === id) {
                setSelectedCard(null);
            }
        } catch (err) {
            setError(err.message || 'Failed to delete user card');
        }
    };

    const filteredUserCards = userCards.filter((card) =>
        card.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = {
        container: { display: 'flex', padding: '20px', backgroundColor: '#f9f9f9', height: '100vh' },
        listContainer: { flex: 3, padding: '10px', maxHeight: '100%', overflowY: 'auto' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' },
        tableHeader: { backgroundColor: '#ff8852', fontWeight: 'bold', color: '#333', padding: '10px', borderBottom: '2px solid #ddd', textAlign: 'left' },
        tableRow: { borderBottom: '1px solid #ddd', cursor: 'pointer', transition: 'background-color 0.3s' },
        tableCell: { padding: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        header: { textAlign: 'center', color: '#333', marginBottom: '20px', fontSize: '1.5em' },
        loading: { textAlign: 'center', marginTop: '20px' },
        detailContainer: { flex: 1, padding: '20px', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginLeft: '20px' },
        detail: { margin: '5px 0', color: '#555' },
        button: { padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.3s' },
        detailButton: { backgroundColor: '#ff8852', color: '#333', marginRight: '5px' },
        deleteButton: { backgroundColor: '#f44336', color: 'white' },
        noSelectionMessage: { textAlign: 'center', color: '#888', fontStyle: 'italic' },
        qrCode: { maxWidth: '100px', height: 'auto' },
        searchContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
        searchInput: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '90%' },
        searchButton: { padding: '8px 16px', borderRadius: '4px', border: 'none', backgroundColor: '#4caf50', color: 'white', cursor: 'pointer' },
    };

    if (loading) return <p style={styles.loading}>Loading user cards...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={styles.container}>
            <div style={styles.listContainer}>
                <h2 style={styles.header}>
                    User Cards ({filteredUserCards.length})
                </h2>
                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search user cards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    <button onClick={() => setSearchTerm('')} style={styles.searchButton}>Clear</button>
                </div>
                {filteredUserCards.length > 0 ? (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Full Name</th>
                                <th style={styles.tableHeader}>Age</th>
                                <th style={styles.tableHeader}>Address</th>
                                <th style={styles.tableHeader}>Blood Group</th>
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUserCards.map((card) => (
                                <tr
                                    key={card._id ? card._id.$oid || card._id : card.id}
                                    style={styles.tableRow}
                                    onClick={() => setSelectedCard(card)}
                                >
                                    <td style={styles.tableCell}>{card.fullName}</td>
                                    <td style={styles.tableCell}>{card.age}</td>
                                    <td style={styles.tableCell}>{card.address}</td>
                                    <td style={styles.tableCell}>{card.bloodGroup}</td>
                                    <td style={styles.tableCell}>
                                        <button
                                            style={{ ...styles.button, ...styles.detailButton }}
                                            onClick={() => setSelectedCard(card)}
                                        >
                                            Details
                                        </button>
                                        <button
                                            style={{ ...styles.button, ...styles.deleteButton }}
                                            onClick={() => handleDelete(card._id.$oid)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No user cards found.</p>
                )}
            </div>
            <div style={styles.detailContainer}>
                <h2 style={styles.header}>User Card Details</h2>
                {selectedCard ? (
                    <>
                        <p style={styles.detail}><strong>Full Name:</strong> {selectedCard.fullName}</p>
                        <p style={styles.detail}><strong>Age:</strong> {selectedCard.age}</p>
                        <p style={styles.detail}><strong>Address:</strong> {selectedCard.address}</p>
                        <p style={styles.detail}><strong>Blood Group:</strong> {selectedCard.bloodGroup}</p>
                        <p style={styles.detail}><strong>Medicines:</strong> {selectedCard.medicines.join(', ')}</p>
                        <p style={styles.detail}><strong>Disease:</strong> {selectedCard.disease.join(', ')}</p>
                        <p style={styles.detail}><strong>Allergies:</strong> {selectedCard.allergies.join(', ')}</p>
                        <p style={styles.detail}><strong>Emergency Instructions:</strong> {selectedCard.emergencyInstructions}</p>
                        <p style={styles.detail}><strong>Emergency Numbers:</strong> {selectedCard.emergencyNumbers.join(', ')}</p>
                        <p style={styles.detail}><strong>Insurance Details:</strong> {selectedCard.insuranceDetails || 'N/A'}</p>
                        <p style={styles.detail}><strong>Preferred Hospital:</strong> {selectedCard.preferredHospital || 'N/A'}</p>
                        <p style={styles.detail}><strong>QR Code:</strong></p>
                        <img src={selectedCard.qrCodeImage} alt="QR Code" style={styles.qrCode} />
                    </>
                ) : (
                    <p style={styles.noSelectionMessage}>Select a user card to see details.</p>
                )}
            </div>
        </div>
    );
}

export default UserCardList;
