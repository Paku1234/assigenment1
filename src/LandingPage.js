import React, { useState, useEffect } from 'react';
import Navbar from './NavBar';
import PieChart from './PieChart';
import axios from 'axios';
import "./LandingPage.css";

function LandingPage() {
 const [pieChartData, setPieChartData] = useState({
  labels: [], // labels for your data
  datasets: [
    {
      data: [], // sales data
      backgroundColor: [], // colors for each data point
    },
  ],
 });

 useEffect(() => {
  axios.get('http://localhost:5000/sales_data')
    .then(response => {
      // prepare the data for the Pie chart
      setPieChartData({
        labels: response.data.map(item => item.store), // assuming each item has a 'store' property
        datasets: [
          {
            data: response.data.map(item => item.sales), // assuming each item has a 'sales' property
            backgroundColor: response.data.map(() => 'rgba(75, 192, 192, 0.2)'), // same color for all data points
          },
        ],
      });
    })
    .catch(err => console.log(err));
 }, []);

 return (
  <div className="landing-page">
    <Navbar />
    <h1>Welcome to the Landing Page!</h1>
    <p>Explore our interactive voice-controlled dashboard.</p>
    <PieChart chartData={pieChartData} />
    <div className="buttons">
      <button className="btn">Homepage</button>
      <button className="btn">Salespage</button>
    </div>
  </div>
 );
}

export default LandingPage;
