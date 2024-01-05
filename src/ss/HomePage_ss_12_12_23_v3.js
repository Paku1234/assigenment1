
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
       setSalesData({
         labels: response.data.map(item => item.Date),
         datasets: [{
           label: 'Weekly Sales',
           data: response.data.map(item => item.Weekly_Sales),
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
   if (selectedStore  && selectedDepartment) {
     axios.post('http://localhost:5000/filter', {
       store: selectedStore,
       department: selectedDepartment
     })
     .then(response => {
       setIsHoliday(response.data.length === 0 ? false : response.data[0].IsHoliday);
       setWeeklySales(response.data.length === 0 ? 0 : response.data[0].Weekly_Sales);
     })
     .catch(err => console.log(err));
   }
 };

 return (
   <div className="home-page">
     <h1>Home Page</h1>

     <div className="filters">
       <label>
         Choose Store:
         <select
           value={selectedStore}
           onChange={(e) => setSelectedStore(e.target.value)}
         >
           <option value="All">All Stores</option>
           {data && data.total_Store && Array.isArray(data.total_Store) && data.total_Store.map((store, index) => (
             <option key={index} value={store}>{store}</option>
           ))}
         </select>
       </label>

       <label>
         Choose Department:
         <select
           value={selectedDepartment}
           onChange={(e) => setSelectedDepartment(e.target.value)}
         >
           <option value="All">All Departments</option>
           {data && data.total_Department && Array.isArray(data.total_Department) && data.total_Department.map((department, index) => (
             <option key={index} value={department}>{department}</option>
           ))}
         </select>
       </label>

       <label>
         Choose Date:
         <input
           type="date"
           value={selectedDate}
           min="2010-01-01"
           max="2012-12-31"
           onChange={(e) => setSelectedDate(e.target.value)}
         />
       </label>

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
 );
}

export default HomePage;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './HomePage.css';

// function HomePage() {
//   const [data, setData] = useState(null);
//   const [selectedStore, setSelectedStore] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [selectedDate, setSelectedDate] = useState('');
//   const [isHoliday, setIsHoliday] = useState(false);
//   const [weeklySales, setWeeklySales] = useState(0);

//   useEffect(() => {
//     axios.get('http://localhost:5000/count')
//       .then(response => {
//         setData(response.data);
//         setSelectedStore(response.data.total_Store[0]);
//       })
//       .catch(err => console.log(err));
//   }, []);

//   const handleFilterSubmit = () => {
//     if (selectedStore && selectedDate && selectedDepartment) {
//       axios.post('http://localhost:5000/filter', {
//         store: selectedStore,
//         date: selectedDate,
//         department: selectedDepartment
//       })
//       .then(response => {
//         setIsHoliday(response.data.length === 0 ? false : response.data[0].IsHoliday);
//         setWeeklySales(response.data.length === 0 ? 0 : response.data[0].Weekly_Sales);
//         console.log("response",response.data);
//       })
//       .catch(err => console.log(err));

//     }
//   };

//   return (
//     <div className="home-page">
//       <h1>Home Page</h1>

//       <div className="filters">
//         <label>
//           Choose Store:
//           <select
//             value={selectedStore}
//             onChange={(e) => setSelectedStore(e.target.value)}
//           >
//             <option value="All">All Stores</option>
//             {data && data.total_Store && Array.isArray(data.total_Store) && data.total_Store.map((store, index) => (
//               <option key={index} value={store}>{store}</option>
//             ))}
//           </select>
//         </label>

//         <label>
//           Choose Department:
//           <select
//             value={selectedDepartment}
//             onChange={(e) => setSelectedDepartment(e.target.value)}
//           >
//             <option value="All">All Departments</option>
//             {data && data.total_Department && Array.isArray(data.total_Department) && data.total_Department.map((department, index) => (
//               <option key={index} value={department}>{department}</option>
//             ))}
//           </select>
//         </label>

//         <label>
//           Choose Date:
//           <input
//             type="date"
//             value={selectedDate}
//             min="2010-01-01"
//             max="2012-12-31"
//             onChange={(e) => setSelectedDate(e.target.value)}
//           />
//         </label>

//         {/* <button onClick={handleFilterSubmit}>Submit</button> */}
//         <input type="submit" value="Search" onClick={handleFilterSubmit} /> { showResults ? <Results /> : null }
//       </div>

//       <div>
//         {isHoliday ? (
//           <p>The restaurant department is on holiday.</p>
//         ) : (
//           <p>The restaurant department is not on holiday.</p>
//         )}
//         <p>Weekly Sales: {weeklySales}</p>
//       </div>
//     </div>
//   );
// }

// export default HomePage;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './HomePage.css';

// function HomePage({ data }) {
//   const [selectedStore, setSelectedStore] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [selectedDate, setSelectedDate] = useState('');
//   const [isHoliday, setIsHoliday] = useState('');
//   const [showResults, setShowResults] = useState(false);
//   const [filterResults, setFilterResults] = useState([]);

//   useEffect(() => {
//     axios.get('http://localhost:5000/count')
//       .then(response => {
//         setSelectedStore(response.data.total_Store[0]);
//         console.log('Selected Store:', response.data.total_Store[0]);
//       })
//       .catch(err => console.log(err));
//   }, []);

//   const handleFilterSubmit = () => {
//     if (selectedStore && selectedDate && selectedDepartment) {
//       axios.post('http://localhost:5000/filter', {
//         store: selectedStore,
//         date: selectedDate,
//         department: selectedDepartment
//       })
//       .then(response => {
//         setIsHoliday(response.data.length === 0 ? false : response.data[0].IsHoliday);
//         setFilterResults(response.data);
//         setShowResults(true);
//         console.log('Filter Results:', response.data);
//       })
//       .catch(err => console.log(err));
//     }
//   };

//   return (
//     <div className="home-page">
//       <h1>Home Page</h1>

//       <div className="filters">
//         <label>
//           Choose Store:
//           <select
//             value={selectedStore}
//             onChange={(e) => setSelectedStore(e.target.value)}
//           >
//             <option value="All">All Stores</option>
//             {data && data.map((row, index) => (
//               <option key={index} value={row[0]}>{row[0]}</option>
//             ))}
//           </select>
//         </label>

//         <label>
//           Choose Department:
//           <select
//             value={selectedDepartment}
//             onChange={(e) => setSelectedDepartment(e.target.value)}
//           >
//             <option value="All">All Departments</option>
//             {data && data.map((row, index) => (
//               <option key={index} value={row[1]}>{row[1]}</option>
//             ))}
//           </select>
//         </label>

//         <label>
//           Choose Date:
//           <input
//             type="date"
//             value={selectedDate}
//             min="2010-01-01"
//             max="2012-12-31"
//             onChange={(e) => setSelectedDate(e.target.value)}
//           />
//         </label>

//         <input type="submit" value="Search" onClick={handleFilterSubmit} />
//         { showResults ? (
//           <div>
//             <h2>Filter Results:</h2>
//             {filterResults.length > 0 ? (
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Store</th>
//                     <th>Department</th>
//                     <th>IsHoliday</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filterResults.map((result, index) => (
//                     <tr key={index}>
//                       <td>{result.Date}</td>
//                       <td>{result.Store}</td>
//                       <td>{result.Department}</td>
//                       <td>{result.IsHoliday ? 'Yes' : 'No'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p>No results found.</p>
//             )}
//           </div>
//         ) : null }
//       </div>

//       <div>
//         {isHoliday ? (
//           <p>The Store department is on holiday.</p>
//         ) : (
//           <p>The Store department is not on holiday.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// export default HomePage;
