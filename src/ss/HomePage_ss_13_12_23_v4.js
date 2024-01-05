
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import './HomePage.css';
import { DataContext } from './DataContext';
import { Line } from 'react-chartjs-2';

const options = {
 responsive: true,
 plugins: {
 legend: {
   position: 'top',
 },
 title: {
   display: true,
   text: 'Sales Data',
 },
 },
};

function HomePage() {
 const {data, setData} = useContext(DataContext);
 const [selectedStore, setSelectedStore] = useState('');
 const [selectedDepartment, setSelectedDepartment] = useState('');
 const [selectedDate, setSelectedDate] = useState('');
 const [isHoliday, setIsHoliday] = useState(false);
 const [weeklySales, setWeeklySales] = useState(0);
 const [salesData, setSalesData] = useState(null);
 const [employeeData, setEmployeeData] = useState(null);

 useEffect(() => {
 axios.get('http://localhost:5000/count')
   .then(response => {
     setData(response.data);
     setSelectedStore(response.data.total_Store[0]);
   })
   .catch(err => console.log(err));
 }, []);

 useEffect(() => {
 if (selectedStore && selectedDepartment) {
   axios.post('http://localhost:5000/modified_sales_data', {
     store: selectedStore,
     department: selectedDepartment
   })
   .then(response => {
     const formattedData = response.data.map(item => {
       // Format the date to 'MMM D' format
       const date = new Date(item.Date);
       const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
       
       return {
         ...item,
         Date: formattedDate
       };
     });

     setSalesData({
       labels: formattedData.map(item => item.Date),
       datasets: [{
         label: 'Weekly Sales',
         data: formattedData.map(item => item.Weekly_Sales),
         fill: false,
         backgroundColor: 'rgb(75, 192, 192)',
         borderColor: 'rgba(75, 192, 192, 0.2)',
       }]
     });
   })
   .catch(err => console.log(err));
 }
 }, [selectedStore, selectedDepartment]);

 const handleFilterSubmit = () => {
 if (selectedStore && selectedDepartment) {
   axios.post('http://localhost:5000/filter', {
     store: selectedStore,
     date:selectedDate,
     department: selectedDepartment
   })
   .then(response => {
     setIsHoliday(response.data.length === 0 ? false : response.data[0].IsHoliday);
     setWeeklySales(response.data.length === 0 ? 0 : response.data[0].Weekly_Sales);
   })
   .catch(err => console.log(err));
 }
 };

 useEffect(() => {
 async function fetchData() {
   const response = await fetch('src/data/EmployeeOverview.csv'); // Replace with your CSV file path
   const text = await response.text();
   Papa.parse(text, {
     header: true, // Assumes the first row contains column headers
     complete: (result) => {
       setEmployeeData(result.data);
     },
   });
 }
 fetchData();
 }, []);

 const satisfactionLevels = employeeData && employeeData.map(row => row.satisfaction_level);
 const averageSatisfactionLevel = satisfactionLevels && satisfactionLevels.reduce((a, b) => a + b, 0) / satisfactionLevels.length;

 const hoursWorked = employeeData && employeeData.map(row => row.average_monthly_hours);
 const averageHoursWorked = hoursWorked && hoursWorked.reduce((a, b) => a + b, 0) / hoursWorked.length;

 const performance = employeeData && employeeData.map(row => row.performance);
 const averagePerformance = performance && performance.reduce((a, b) => a + b, 0) / performance.length;

 return (
 <div className="home-page" style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)'}}>
  <div style={{ gridRow: '1',gridColumn: 'span 2'}}>
    <h1>DashBoard</h1>

    <div className="filters" style={{display: 'flex', justifyContent: 'space-between'}}>
      <select
        value={selectedStore}
        onChange={(e) => setSelectedStore(e.target.value)}
      >
        <option value="">Store</option>
        {data && data.total_Store && Array.isArray(data.total_Store) && data.total_Store.map((store, index) => (
          <option key={index} value={store}>{store}</option>
        ))}
      </select>

      <select
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value)}
      >
        <option value="">Department</option>
        {data && data.total_Department && Array.isArray(data.total_Department) && data.total_Department.map((department, index) => (
          <option key={index} value={department}>{department}</option>
        ))}
      </select>

      <input
        type="date"
        value={selectedDate}
        min="2010-01-01"
        max="2012-12-31"
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <button onClick={handleFilterSubmit}>Submit</button>

      </div>
      
      <div>
        
        {isHoliday ? (
          <p>The restaurant department is on holiday.</p>
        ) : (
          <p>The restaurant department is not on holiday.</p>
        )}
        <p>Weekly Sales: {weeklySales}</p>
      </div>

      <div>
        {salesData && (
          <Line options={options} data={salesData} />
        )}
      </div>

      </div>

    <div style={{ gridColumn: 'span 4', textAlign: 'right' }}>
      <h2>EmployeeOverview</h2>
      <h4>Average values for all the stores</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'violet', borderRadius: '50%', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>{Math.round(averageSatisfactionLevel)}%</p>
          </div>
          <p style={{ textAlign: 'center' }}>Employee Satisfaction</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'blue', borderRadius: '50%', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>{Math.round(averageHoursWorked)}%</p>
          </div>
          <p style={{ textAlign: 'center' }}>Hours Worked</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'grey', borderRadius: '50%', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>{Math.round(averagePerformance)}%</p>
          </div>
          <p style={{ textAlign: 'center' }}>Performance</p>
        </div>
      </div>
    </div>
  </div>
);

          

}

export default HomePage;