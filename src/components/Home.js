import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { Bar, Pie } from 'react-chartjs-2';
import {
    ChartJS, 
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import api from '../services/apiCalling';
import './home.css';
import UsersList from '../components/UsersList';
import SOSList from '../components/SOSList';
import ActiveSOSList from '../components/ActiveSOSList';
import UserCardList from '../components/UserCard';
import CirclesList from '../components/CircleList';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);


const AdminDashboard = () => {
    const [selectedPage, setSelectedPage] = useState("home");
    const [userCount, setUserCount] = useState(0);
    const [sosCount, setSosCount] = useState(0);
    const [activeSosCount, setActiveSosCount] = useState(0);
    const [userCardCount, setUserCardCount] = useState(0);
    const [circleCount, setCircleCount] = useState(0);
    const [trendsData, setTrendsData] = useState([]);
    const [loadingTrends, setLoadingTrends] = useState(false);
    const [timePeriod, setTimePeriod] = useState("lastMonth");

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [recordType, setRecordType] = useState(''); // Add this line
    const [expandedCard, setExpandedCard] = useState(false);


    useEffect(() => {
        setUserCount(100);
        setSosCount(50);
        setActiveSosCount(0);
        setUserCardCount(0);
        setCircleCount(0);
    }, []);

    const fetchTrendsData = async (period) => {
        setLoadingTrends(true);
        try {
            const data = await api.getEmergencyTrends(period);
            setTrendsData(data);
        } catch (error) {
            console.error('Failed to fetch trends data:', error);
        } finally {
            setLoadingTrends(false);
        }
    };

    useEffect(() => {
        fetchTrendsData(timePeriod);
    }, [timePeriod]);

    const handleTimePeriodChange = (event) => {
        setTimePeriod(event.target.value);
    };

    // Generate distinct colors
    const generateColors = (numColors) => {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            const hue = (i * 360) / numColors;
            colors.push(`hsl(${hue}, 70%, 50%)`);
        }
        return colors;
    };

    const chartColors = generateColors(trendsData.length);

      // Calculations for statistical analysis
      const totalIncidents = trendsData.reduce((sum, trend) => sum + trend.count, 0);
      const avgIncidents = totalIncidents / (trendsData.length || 1);
  
      const maxIncidentTrend = trendsData.reduce((max, trend) => (trend.count > max.count ? trend : max), trendsData[0] || {});
      const minIncidentTrend = trendsData.reduce((min, trend) => (trend.count < min.count ? trend : min), trendsData[0] || {});
  
      const percentageContributions = trendsData.map(trend => ({
          emergencyType: trend.emergencyType,
          percentage: ((trend.count / totalIncidents) * 100).toFixed(2)
      }));
    // Function to handle clicking on a user card name
    const handleUserCardClick = async (userCardId, cardTitle) => {
      setExpandedCard(expandedCard === cardTitle ? null : cardTitle); // Toggle the card expansion
      console.log("Fetching user card details for ID:", userCardId); // Debug line
      try {
        const response = await api.getAllUserCards(userCardId);
        console.log("API Response:", response); // Debug line
        if (response && response.success) {
          setSelectedRecord(response.data);
          setRecordType("userCard");
          setShowModal(true);
        } else {
          console.error("Failed to fetch user card details");
        }
      } catch (error) {
        console.error("Error fetching user card details:", error);
      }
    };


    // Update handleSearch function
    const handleSearch = async (type) => {
        if (!searchQuery.trim()) {
            alert("Please enter a user name or user ID.");
            return;
        }

        try {
            let response;
            setRecordType(type); // Ensure recordType is set here
            if (type === 'user') {
                response = await api.getAllUsers();
            } else if (type === 'sos') {
                response = await api.getAllSOS();
            }
            if (response && response.success) {
                let filteredResults = response.data;
                // Updated filtering logic for each type
                if (type === 'user') {
                    filteredResults = filteredResults.filter(user =>
                        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (user.uid && user.uid.includes(searchQuery))
                    );
                } else if (type === 'sos') {
                    filteredResults = filteredResults.filter(sos =>
                        (sos.sender && sos.sender.name && sos.sender.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (sos.sender && sos.sender.userId && sos.sender.userId.includes(searchQuery))
                    );
                }
                setSearchResults(filteredResults);
            } else {
                console.error("No data found");
            }
        } catch (error) {
            console.error(`Failed to fetch ${type} data:`, error); 
        }
    };

    const handleRowClick = (record) => {
        console.log("Clicked record: ", record); // Log the clicked record
        if (record.sender) {
            setRecordType('sos');
        } else {
            setRecordType('user');
        }
        setSelectedRecord(record);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const renderContent = () => {
        switch (selectedPage) {
            case "users":
                return <UsersList updateUserCount={setUserCount} />;
            case "sosList":
                return <SOSList updateSOSCount={setSosCount} updateActiveSOSCount={setActiveSosCount} />;
            case "activeSos":
                return <ActiveSOSList updateActiveSOSCount={setActiveSosCount} />;
            case "userCards":
                return <UserCardList setUserCardCount={setUserCardCount} />;
            case "circles":
                return <CirclesList updateCircleCount={setCircleCount} />;
            default:
                return (
                    <div className="dashboard-content">
                       <div className="cards-grid">
                            {[{ title: "Active Users", count: userCount, chartData: userCount }, 
                            { title: "Total SOS's", count: sosCount, chartData: sosCount },
                            { title: "Active SOS's", count: activeSosCount, chartData: activeSosCount },
                            { title: "User Cards", count: userCardCount, chartData: userCardCount },
                            { title: "Circles", count: circleCount, chartData: circleCount }
                                ].map((item, index) => (
                                    <div className="card" key={index} onClick={() => handleUserCardClick(item.title)}>
                                        <h3>{item.title}</h3>
                                        <CountUp start={0} end={item.count} duration={2.5} />
                                        {expandedCard === item.title && (
                                            <div className="chart" style={{ width: '100%', height: '300px' }}>
                                                <Bar
                                                    data={{labels: item.chartData.map((data) => data.emergencyType),                                                       
                                                         datasets: [{
                                                            label: `${item.title} Data`,
                                                            data: item.chartData.map(data => data.count),
                                                            backgroundColor: chartColors,
                                                            borderColor: chartColors,
                                                            borderWidth: 1,
                                                        }],
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: { legend: { position: 'top' } },
                                                        scales: { y: { beginAtZero: true } },
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                           </div>


                        {/* Tracking Buttons */}
                        <div className="tracking-buttons">
                            <input
                                type="text"
                                placeholder="Enter ID or Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button onClick={() => handleSearch('user')}>Track User</button>
                            <button onClick={() => handleSearch('sos')}>Track SOS</button>
                        </div>

                        {/* Display search results */}
                        {searchResults.length > 0 && (
                            <table className="search-results-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Phone/Message</th>
                                        <th>Status/Type</th>
                                    </tr>
                                </thead>


                                <tbody>
                                    {searchResults.map((result, index) => (
                                        <tr key={index} onClick={() => {
                                            if (recordType === 'userCard') {
                                                const userCardId = result._id?.$oid || result._id; // Adjust this line if necessary
                                                handleUserCardClick(userCardId); // Fetch and show user card details on click
                                            } else {
                                                handleRowClick(result);
                                            }
                                        }}>
                                            <td>{recordType === 'userCard' ? result.fullName : result._id?.$oid}</td>
                                            <td>{recordType === 'userCard' ? null : result.fullName || result.name || result.sender?.name}</td>
                                            <td>{recordType === 'userCard' ? null : result.phoneNumber || result.message}</td>
                                            <td>{recordType === 'userCard' ? null : result.status || result.emergencyType}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {showModal && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h2>Details</h2>
                                    {selectedRecord && (
                                        <>
                                            {recordType === 'user' && (
                                                <>
                                                    <img src={selectedRecord.profileImage} alt="Profile" className="profile-image" />
                                                    <table>
                                                        <tbody>
                                                            <tr>
                                                                <th>Full Name</th>
                                                                <td>{selectedRecord.name || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Email</th>
                                                                <td>{selectedRecord.email || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Phone Number</th>
                                                                <td>{selectedRecord.phoneNumber || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Battery Level</th>
                                                                <td>{selectedRecord.batteryLevel || 'N/A'}%</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Location</th>
                                                                <td>{`Lat: ${selectedRecord.location?.latitude || 'N/A'}, Long: ${selectedRecord.location?.longitude || 'N/A'}`}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Status</th>
                                                                <td>{selectedRecord.status || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Created At</th>
                                                                <td>{selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString() : 'N/A'}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </>
                                            )}

                                            {recordType === 'sos' && (
                                                <>
                                                    <table>
                                                        <tbody>
                                                            <tr>
                                                                <th>Message</th>
                                                                <td>{selectedRecord.message || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Emergency Type</th>
                                                                <td>{selectedRecord.emergencyType || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Location</th>
                                                                <td>{selectedRecord.userLocation?.address || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Sender</th>
                                                                <td>{selectedRecord.sender?.name || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Battery Status</th>
                                                                <td>{selectedRecord.sender?.batteryStatus || 'N/A'}%</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Created At</th>
                                                                <td>{selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString() : 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Contacts Notified</th>
                                                                <td>
                                                                    {selectedRecord.contacts?.map(contact => (
                                                                        <div key={contact.contactId}>
                                                                            {contact.name} (Notified via: {contact.notifiedVia}, Acknowledged: {contact.acknowledged ? 'Yes' : 'No'})
                                                                        </div>
                                                                    )) || 'N/A'} 
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </>
                                            )}
                                        </>
                                    )}
                                    <button onClick={closeModal} className="close-button">Close</button>
                                </div>
                            </div>
                        )}

                        {/* Trends Section */}
                        <div className="trends-container">
                            <h2>Emergency Trends</h2>
                            <label htmlFor="time-period">Select Time Period:</label>
                            <select id="time-period" value={timePeriod} onChange={handleTimePeriodChange}>
                                <option value="lastWeek">Last Week</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="lastTwoMonths">Last 2 Months</option>
                                <option value="lastYear">Last Year</option>
                                <option value="lastThreeMonths">Last 3 Months</option>
                                <option value="lastSixMonths">Last 6 Months</option>
                                <option value="lastYear">Last Year</option>
                               
                            </select>

                            {loadingTrends ? (
                                <p>Loading trends data...</p>
                            ) : (
                                <div className="charts-grid">
                                    <div className="chart">
                                        <Bar
                                            data={{
                                                labels: trendsData.map(item => item.emergencyType),
                                                datasets: [{
                                                    label: 'Number of Incidents',
                                                    data: trendsData.map(item => item.count),
                                                    backgroundColor: chartColors,
                                                    borderColor: chartColors,
                                                    borderWidth: 1,
                                                }],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { position: 'top' } },
                                                scales: { y: { beginAtZero: true } },
                                            }}
                                        />
                                    </div>
                                    <div className="chart">
                                        <Pie
                                            data={{
                                                labels: trendsData.map(item => item.emergencyType),
                                                datasets: [{
                                                    data: trendsData.map(item => item.count),
                                                    backgroundColor: chartColors,
                                                }],
                                            }}
                                            options={{ responsive: true, maintainAspectRatio: false }}
                                        />
                                    </div>
                                </div>
                            )}
                                {/* <button onClick={() => fetchTrendsData(timePeriod)} className="refresh-button">Refresh Trends</button> */}

                            {/* Statistical Analysis Section */}
                {/* <div className="trends-stats">
                    <h3>Statistical Analysis</h3>
                    <p>Total Incidents: <CountUp start={0} end={totalIncidents} duration={1.5} /></p>
                    <p>Average Incidents per Type: <CountUp start={0} end={avgIncidents} duration={1.5} decimals={2} /></p>
                    <p>Highest Incidents (Trend): {maxIncidentTrend.emergencyType || 'N/A'} - {maxIncidentTrend.count || 0}</p>
                    <p>Lowest Incidents (Trend): {minIncidentTrend.emergencyType || 'N/A'} - {minIncidentTrend.count || 0}</p>
                    
                    <h4>Percentage Contribution of Each Trend</h4>
                    <ul>
                        {percentageContributions.map((trend, index) => (
                            <li key={index}>
                                {trend.emergencyType}: {trend.percentage}%
                            </li>
                        ))}
                    </ul>
                </div> */}
                        
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard">
            <div className="sidebar">
                <h2>Admin Dashboard</h2>
                <button onClick={() => setSelectedPage("home")}>Home</button>
                <button onClick={() => setSelectedPage("sosList")}>SOS's</button>
                <button onClick={() => setSelectedPage("users")}>Users</button>
                <button onClick={() => setSelectedPage("activeSos")}>Active SOS</button>
                <button onClick={() => setSelectedPage("userCards")}>User Cards</button>
                <button onClick={() => setSelectedPage("circles")}>Circles</button>
            </div>
            <div className="main">
                <div className="header">
                    <h1>Welcome to the Admin Dashboard</h1>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;
