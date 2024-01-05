import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import './HomePage.css';
import { DataContext } from './DataContext';
import { Line } from 'react-chartjs-2';
import EmployeeOverview from 'D:/multi-page-app_Copy/src/data/EmployeeOverview.csv';
import UserCuisine from 'D:/multi-page-app_Copy/src/data/usercuisine.csv';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const options = {
 responsive: true,
 plugins: {
   legend: {
     position: 'top',
   },
   title: {
     display: true,
     text: 'Revenue',
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
 const [cuisineData, setCuisineData] = useState(null);
 const [cuisineFrequency, setCuisineFrequency] = useState(null);
 const [sortedCuisines, setSortedCuisines] = useState(null);
 const { transcript } = useSpeechRecognition();
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState('');
 const [showChat, setShowChat] = useState(false);
 
 function parseQuestion(question) {
  return question.replace(/[^\w\s]/gi, '').toLowerCase();
 }

 useEffect(() => {
   axios.get('http://localhost:5000/count')
     .then(response => {
       setData(response.data);
       setSelectedStore(response.data.total_Store['Store']);
     })
     .catch(err => console.log(err));
 }, []);

 useEffect(() => {
  if (data) {
    for (let i = 1; i <= 5; i++) {
      if (transcript.includes(`select store ${i}`)) {
        setSelectedStore(`${i}`);
      }
    }

    for (let i = 1; i <= 98; i++) {
      if (transcript.includes(`select department ${i}`)) {
        setSelectedDepartment(`${i}`);
      }
    }
    if (transcript.includes("select date")) {
      const words = transcript.split(" ");
      const dateIndex = words.findIndex(word => word === "date");
      if (dateIndex !== -1 && dateIndex < words.length - 3) {
        const date = `${words[dateIndex + 1]} ${words[dateIndex + 2]} ${words[dateIndex + 3]}`;
        setSelectedDate(date);
      }
    }
  }
}, [transcript, data, selectedStore, selectedDepartment, selectedDate]);

useEffect(() => {
  if (transcript !== '') {
    // Parse the user's question
    const parsedQuestion = parseQuestion(transcript);

    // Fetch the most recent data from localStorage each time
    const storedOverallDataJSONString = localStorage.getItem('overallData');
    const storedOverallData = JSON.parse(storedOverallDataJSONString);

    // Check if the parsed question matches any of the keys in the JSON data
    const keys = Object.keys(storedOverallData).map(key => key.toLowerCase());
    for (let key of keys) {
      if (parsedQuestion.includes(key)) {
        // If the parsed question matches a key, respond with the data from the JSON file
        const botMessage = storedOverallData[key];
        setMessages(prevMessages => [...prevMessages, { role: 'user', text: transcript }, { role: 'bot', text: botMessage }]);
        setInput('');
        speak(botMessage); 
        return;
      }
    }

    // Additional questions
    if (parsedQuestion.includes("weekly sales") && 'weeklySales' in storedOverallData) {
      const botMessage = `The weekly sales are ${storedOverallData.weeklySales}.`;
      setMessages(prevMessages => [...prevMessages, { role: 'user', text: transcript }, { role: 'bot', text: botMessage }]);
      setInput('');
      speak(botMessage); // Speak out the bot message
      return;
    }

    // Your additional questions go here...
    if (parsedQuestion.includes("holiday") && 'isHoliday' in storedOverallData) {
      const botMessage = `${storedOverallData.isHoliday}`;
      setMessages(prevMessages => [...prevMessages, { role: 'user', text: transcript }, { role: 'bot', text: botMessage }]);
      setInput('');
      speak(botMessage); // Speak out the bot message
      return;
    }

    if (parsedQuestion.includes("average satisfaction level") && storedOverallData.employeeOverview) {
      const botMessage = `The average satisfaction level is ${storedOverallData.employeeOverview.averageSatisfactionLevel}%.`;
      setMessages(prevMessages => [...prevMessages, { role: 'user', text: transcript }, { role: 'bot', text: botMessage }]);
      setInput('');
      speak(botMessage); // Speak out the bot message
      return;
    }

    if (parsedQuestion.includes("average hours worked") && storedOverallData.employeeOverview) {
      const botMessage = `The average hours worked is ${storedOverallData.employeeOverview.averageHoursWorked}%.`;
      setMessages(prevMessages => [...prevMessages, { role: 'user', text: transcript }, { role: 'bot', text: botMessage }]);
      setInput('');
      speak(botMessage); // Speak out the bot message
      return;
    }

    if (parsedQuestion.includes("average performance") && storedOverallData.employeeOverview) {
      const botMessage = `The average performance is ${storedOverallData.employeeOverview.averagePerformance}%.`;
      setMessages(prevMessages => [...prevMessages, { role: 'user', text: transcript }, { role: 'bot', text: botMessage }]);
      setInput('');
      speak(botMessage); // Speak out the bot message
      return;
    }

    const rankMap = {
      'top':0,
      'second': 1,
      'third': 2,
      'fourth': 3,
      'fifth': 4
    };
    
    for (let rank in rankMap) {
      if (parsedQuestion.includes(`${rank} most popular cuisine`) && storedOverallData.mostOrderedCuisine && storedOverallData.mostOrderedCuisine.length > rankMap[rank]) {
        const botMessage = `The ${rank} most popular cuisine is ${storedOverallData.mostOrderedCuisine[rankMap[rank]].cuisine} with a percentage of ${storedOverallData.mostOrderedCuisine[rankMap[rank]].percentage}%.`;
        setMessages(prevMessages => [...prevMessages, { role: 'user', text: transcript }, { role: 'bot', text: botMessage }]);
        setInput('');
        speak(botMessage); // Speak out the bot message
        return;
      }
    }
  }
}, [transcript]);

// Function to speak out a message
function speak(message) {
  // Cancel any previous speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(message);
  window.speechSynthesis.speak(utterance);
}

 useEffect(() => {
   if (selectedStore && selectedDepartment) {
     axios.post('http://localhost:5000/modified_sales_data', {
       store: selectedStore,
       department: selectedDepartment
     })
     .then(response => {
       const formattedData = response.data.map(item => {
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
       const overallData = {
        isHoliday: isHoliday ? 'The restaurant department is on holiday.' : 'The restaurant department is not on holiday.',
        weeklySales,
      };
      const overallDataJSONString = JSON.stringify(overallData);
      localStorage.setItem('overallData', overallDataJSONString);
     })
     .catch(err => console.log(err));
   }
 };

 useEffect(() => {
  async function fetchData() {
    const response = await fetch(EmployeeOverview);
    const text = await response.text();
 
    console.log('EmployeeOverview CSV Data:', text);
    Papa.parse(text, {
      header: true, 
      complete: (result) => {
        console.log('Parsed EmployeeOverview Data:', result.data);
        setEmployeeData(result.data);
      },
    });
  }
  fetchData();
 }, []);
 
 useEffect(() => {
  async function fetchData() {
    const response = await fetch(UserCuisine);
    const text = await response.text();
 
    console.log('User Cuisine CSV Data:', text);
    Papa.parse(text, {
      header: true, 
      complete: (result) => {
        console.log('Parsed Cuisine Data:', result.data);
        setCuisineData(result.data);
      },
    });
  }
  fetchData();
 }, []);

 useEffect(() => {
   if (cuisineData) {
     const cuisineFrequency = cuisineData.reduce((acc, row) => {
       acc[row.Cuisine] = (acc[row.Cuisine] || 0) + 1;
       return acc;
     }, {});
     setCuisineFrequency(cuisineFrequency);
   }
 }, [cuisineData]);

 useEffect(() => {
   if (cuisineFrequency) {
     const sortedCuisines = Object.keys(cuisineFrequency).sort((a, b) => cuisineFrequency[b] - cuisineFrequency[a]);
     setSortedCuisines(sortedCuisines);
   }
 }, [cuisineFrequency]);

 const satisfactionLevels = employeeData && employeeData.map(row => row.satisfaction_level ? parseFloat(row.satisfaction_level) : 0);
 const averageSatisfactionLevel = satisfactionLevels && satisfactionLevels.length > 0 ? (satisfactionLevels.reduce((a, b) => a + b, 0) / satisfactionLevels.length) * 100 : 0;
 
 const hoursWorked = employeeData && employeeData.map(row => row.average_montly_hours ? parseFloat(row.average_montly_hours.replace('%', '')) / 100 : 0);
 const averageHoursWorked = hoursWorked && hoursWorked.length > 0 ? (hoursWorked.reduce((a, b) => a + b, 0) / hoursWorked.length) * 100 : 0;
 
 const performance = employeeData && employeeData.map(row => row.last_evaluation ? parseFloat(row.last_evaluation) : 0);
 const averagePerformance = performance && performance.length > 0 ? (performance.reduce((a, b) => a + b, 0) / performance.length) * 100 : 0;
 
 const topCuisine = sortedCuisines && sortedCuisines[0];
 const topCuisinePercentage = (cuisineFrequency && topCuisine && cuisineData && cuisineData.length > 0) ? cuisineFrequency[topCuisine] / cuisineData.length * 100 : 0;
 
 const secondCuisine = sortedCuisines && sortedCuisines[1];
 const secondCuisinePercentage = (cuisineFrequency && secondCuisine && cuisineData && cuisineData.length > 0) ? cuisineFrequency[secondCuisine] / cuisineData.length * 100 : 0;
 
 const thirdCuisine = sortedCuisines && sortedCuisines[2];
 const thirdCuisinePercentage = (cuisineFrequency && thirdCuisine && cuisineData && cuisineData.length > 0) ? cuisineFrequency[thirdCuisine] / cuisineData.length * 100 : 0;
 
 const fourthCuisine = sortedCuisines && sortedCuisines[3];
 const fourthCuisinePercentage = (cuisineFrequency && fourthCuisine && cuisineData && cuisineData.length > 0) ? cuisineFrequency[fourthCuisine] / cuisineData.length * 100 : 0;
 
 const fifthCuisine = sortedCuisines && sortedCuisines[4];
 const fifthCuisinePercentage = (cuisineFrequency && fifthCuisine && cuisineData && cuisineData.length > 0) ? cuisineFrequency[fifthCuisine] / cuisineData.length * 100 : 0;
 
 const overallData = {
  isHoliday: isHoliday ? 'The restaurant department is on holiday.' : 'The restaurant department is not on holiday.',
  weeklySales,
  mostOrderedCuisine: sortedCuisines && sortedCuisines.length > 0 && cuisineFrequency && cuisineData && cuisineData.length > 0 ? [
    {
      cuisine: sortedCuisines[0],
      percentage: (cuisineFrequency[sortedCuisines[0]] / cuisineData.length * 100).toFixed(2)
    },
    {
      cuisine: sortedCuisines[1],
      percentage: (cuisineFrequency[sortedCuisines[1]] / cuisineData.length * 100).toFixed(2)
    },
    {
      cuisine: sortedCuisines[2],
      percentage: (cuisineFrequency[sortedCuisines[2]] / cuisineData.length * 100).toFixed(2)
    },
    {
      cuisine: sortedCuisines[3],
      percentage: (cuisineFrequency[sortedCuisines[3]] / cuisineData.length * 100).toFixed(2)
    },
    {
      cuisine: sortedCuisines[4],
      percentage: (cuisineFrequency[sortedCuisines[4]] / cuisineData.length * 100).toFixed(2)
    }
  ] : [],
  employeeOverview: {
    averageSatisfactionLevel: Math.round(averageSatisfactionLevel),
    averageHoursWorked: Math.round(averageHoursWorked),
    averagePerformance: Math.round(averagePerformance),
  }
};
 
const overallDataJSONString = JSON.stringify(overallData);

localStorage.setItem('overallData', overallDataJSONString);

const storedOverallDataJSONString = localStorage.getItem('overallData');
const storedOverallData = JSON.parse(storedOverallDataJSONString);

console.log(storedOverallData.isHoliday);
console.log(storedOverallData.weeklySales);
console.log(storedOverallData.mostOrderedCuisine);
console.log(storedOverallData.employeeOverview);
 

 return (
  <div className="home-page" style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px'}}>
    <div style={{ gridRow: '1',gridColumn: 'span 2', padding: '10px' }}>
      <h2 style={{fontSize: '1.9em', marginBottom : '40px'}}>DashBoard</h2>
 
      <div className="filters" style={{display: 'flex', justifyContent: 'space-between', marginBottom : '35.7px', paddingBottom: '10px'}}>
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
 
        <button style={{background:'d8e2dc'}} onClick={handleFilterSubmit}>Submit</button>
        
      </div>
 
      <div style={{borderBottom: '1px solid grey',borderBottomleftRadius:'20px' ,paddingBottom: '10px'}}>
        {isHoliday ? (
          <p style={{color:'#666'}}>The restaurant department is on holiday.</p>
        ) : (
          <p style={{color:'#666'}}>The restaurant department is not on holiday.</p>
        )}
        <p style={{color:'#666'}}>Weekly Sales: {weeklySales}</p>
      </div>
      
 
 </div>

 <div style={{ gridColumn: 'span 2', textAlign: 'left', padding: '20px', borderRight: '1px solid grey' }}>
 {salesData !== null ? (
       <Line options={options} data={salesData} />
     ) : (
       <Line options={options} data={{
         labels: [],
         datasets: [{
           label: 'No Data',
           data: [],
           fill: false,
           backgroundColor: 'rgba(75,192,192,0.2)',
           borderColor: 'rgba(75,192,192,1)',
         }]
       }} />
     )}
 <div style={{ gridRow: 'span 2', textAlign: 'left', padding: '20px', borderBottom: '1px solid grey' }}></div>
 <div style={{ margin: 'auto', width: '50%', padding: '10px' }}>
     <h3 style={{ textAlign: 'left', color: '#333',fontSize: '1.2em' }}>Most Ordered Cuisine</h3>
     <h4 style={{ textAlign: 'left', color: 'grey',fontSize: '1em' }}>Top 5 Most Favorite Cuisine</h4>
     {sortedCuisines && sortedCuisines.length > 0 && cuisineFrequency && cuisineData && cuisineData.length > 0 ? (
       <>
         <p style={{ color: '#666', fontSize: '15px' }}>1. {sortedCuisines[0]}: {(cuisineFrequency[sortedCuisines[0]] / cuisineData.length * 100).toFixed(2)}%</p>
         <p style={{ color: '#666', fontSize: '15px' }}>2. {sortedCuisines[1]}: {(cuisineFrequency[sortedCuisines[1]] / cuisineData.length * 100).toFixed(2)}%</p>
         <p style={{ color: '#666', fontSize: '15px' }}>3. {sortedCuisines[2]}: {(cuisineFrequency[sortedCuisines[2]] / cuisineData.length * 100).toFixed(2)}%</p>
         <p style={{ color: '#666', fontSize: '15px' }}>4. {sortedCuisines[3]}: {(cuisineFrequency[sortedCuisines[3]] / cuisineData.length * 100).toFixed(2)}%</p>
         <p style={{ color: '#666', fontSize: '15px' }}>5. {sortedCuisines[4]}: {(cuisineFrequency[sortedCuisines[4]] / cuisineData.length * 100).toFixed(2)}%</p>
       </>
     ) : (
       <p>Loading...</p>
     )}
   </div>
   
 </div>
 
    <div style={{ gridColumn: 'span 2', textAlign: 'left', padding: '20px'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '1.2em' }}>Employee Overview</h3>
        <button style={{ fontSize: '0.8em',color:'black',background:'#adb5bd', padding: '10px' }}>View Report</button>
      </div>
      <h4 style={{ marginBottom: '20px', fontSize: '1em', color: 'grey' }}>Average values for all Stores</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '1', textAlign: 'center', margin: '10px' }}>
          <div style={{ backgroundColor: 'darkviolet', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', marginBottom: '10px' }}>
            <p style={{ fontSize: '0.8em', color: 'white' }}>{Math.round(averageSatisfactionLevel)}%</p>
          </div>
          <p style={{ textAlign: 'left',color: '#666', marginTop: '10px', fontSize: '0.8em' }}>Employee Satisfaction</p>
          
        </div>
 
        <div style={{ flex: '1', textAlign: 'center', margin: '10px' }}>
          <div style={{ backgroundColor: 'violet', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', marginBottom: '10px' }}>
          <p style={{ fontSize: '0.8em', color: 'white' }}>{Math.round(averageHoursWorked)}%</p>
         </div>
         <p style={{ textAlign: 'left',color: '#666', marginTop: '10px', fontSize: '0.8em' }}>Average Hours Worked</p>
       </div>
 
       <div style={{ flex: '1', textAlign: 'center', margin: '10px' }}>
         <div style={{ backgroundColor: 'blueviolet', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', marginBottom: '10px' }}>
           <p style={{ fontSize: '0.8em', color: 'white' }}>{Math.round(averagePerformance)}%</p>
         </div>
         <p style={{ textAlign: 'left',color: '#666', marginTop: '10px', fontSize: '0.8em' }}>Employee Performance</p>
         
       </div>
     </div>
     <div style={{staticborderBottom: '1px grey' }}></div>
   <div>
     
   </div>
   </div>
  </div>
 );
 }

export default HomePage;
