import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage.js';
import SalesPage from './SalesPage.js';
import LandingPage from './LandingPage.js';
import NavBar from './NavBar';
import Chatbot from './Chatbot';
import { DataProvider, DataContext } from './DataContext';
function App() {
 return (
 <Router>
   <NavBar />
   <DataProvider> 
     <Routes>
       <Route path="/LandingPage" element={<LandingPage/>}/>
       <Route path="/HomePage" element={<HomePage />} />
       <Route path="/SalesPage" element={<SalesPage />} />
     </Routes>
     <Chatbot /> 
   </DataProvider>
 </Router>
 );
}

export default App;
