import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './SalesPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

const SalesPage = () => {
  const [data, setData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const { transcript } = useSpeechRecognition();

  useEffect(() => {
    axios.get('http://localhost:5000/count')
      .then(response => {
        setData(response.data);
        setSelectedStore(response.data.total_Store[0]);
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
          setSelectedDepartments([`${i}`]);
        }
      }

      ["2010", "2011", "2012"].forEach(year => {
        if (transcript.includes(`select year ${year}`)) {
          setSelectedYear(year);
        }
      });

      for (let i = 1; i <= 4; i++) {
        if (transcript.includes(`select quarter ${i}`)) {
          setSelectedQuarter(i);
        }
      }
    }
  }, [transcript, data, selectedStore, selectedDepartments, selectedYear, selectedQuarter]);


  useEffect(() => {
    if (selectedStore && selectedYear && selectedQuarter) {
      axios.post('http://localhost:5000/sales_data', {
        store: selectedStore,
        departments: selectedDepartments,
        year: selectedYear,
        quarter: selectedQuarter
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
  }, [selectedStore, selectedDepartments, selectedYear, selectedQuarter]);

  const handleSubmit = () => {
    if (selectedStore && selectedYear && selectedQuarter) {
      axios.post('http://localhost:5000/sales_data', {
        store: selectedStore,
        departments: selectedDepartments,
        year: selectedYear,
        quarter: selectedQuarter
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
  };

  return (
    <div className="sales-page">
      <h1>Sales Page</h1>

      <div className="filters">
        <label>
          Choose Store:
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            <option value="All">All Stores</option>
            {data && data.total_Store && data.total_Store.map((store, index) => (
              <option key={index} value={store}>{store}</option>
            ))}
          </select>
        </label>

        <label>
          Choose Departments:
          <select
            multiple
            value={selectedDepartments}
            onChange={(e) => setSelectedDepartments(Array.from(e.target.selectedOptions, option => option.value))}
          >
            {data && data.total_Department && data.total_Department.map((department, index) => (
              <option key={index} value={department}>{department}</option>
            ))}
          </select>
        </label>

        <label>
          Choose Year:
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2010">2010</option>
            <option value="2011">2011</option>
            <option value="2012">2012</option>
          </select>
        </label>

        <label>
          Choose Quarter:
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
          >
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
          </select>
        </label>

        <button onClick={handleSubmit}>Submit</button>
      </div>

      <div>
        {salesData && (
          <Line options={options} data={salesData} />
        )}
      </div>
    </div>
  );
}

export default SalesPage;