import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home'; // Admin Dashboard component
import UsersList from './components/UsersList'; // Users List component
import SOSList from './components/SOSList'; // SOS List component

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/users" element={<UsersList />} /> 
          <Route path="/sosList" element={<SOSList />} /> 
        </Routes>
      </div>
    </Router>
  );
};

export default App;
