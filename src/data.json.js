import axios from 'axios';
import fs from 'fs';
import Papa from 'papaparse';

const fetchData = async () => {
 try {
 // Fetch data from your API
 const response = await axios.get('http://localhost:5000/count');

 // Extract the necessary data
 const weeklySales = response.data.total_Store['Weekly_Sales'];
 const isHoliday = response.data.total_Store['IsHoliday'];
 // Add other data as needed

 // Fetch CSV files
 const employeeOverviewCSV = fs.readFileSync('./data/EmployeeOverview.csv', 'utf8');
 const userCuisineCSV = fs.readFileSync('./data/usercuisine.csv', 'utf8');

 // Parse CSV files
 let employeeOverviewData = [];
 let userCuisineData = [];

 Papa.parse(employeeOverviewCSV, {
   header: true,
   complete: (result) => {
     employeeOverviewData = result.data;
   },
 });

 Papa.parse(userCuisineCSV, {
   header: true,
   complete: (result) => {
     userCuisineData = result.data;
   },
 });

 // Calculate values
 const satisfactionLevels = employeeOverviewData.map(row => row.satisfaction_level ? parseFloat(row.satisfaction_level) : 0);
 const averageSatisfactionLevel = satisfactionLevels.length > 0 ? (satisfactionLevels.reduce((a, b) => a + b, 0) / satisfactionLevels.length) * 100 : 0;

 const hoursWorked = employeeOverviewData.map(row => row.average_montly_hours ? parseFloat(row.average_montly_hours.replace('%', '')) / 100 : 0);
 const averageHoursWorked = hoursWorked.length > 0 ? (hoursWorked.reduce((a, b) => a + b, 0) / hoursWorked.length) * 100 : 0;

 const performance = employeeOverviewData.map(row => row.last_evaluation ? parseFloat(row.last_evaluation) : 0);
 const averagePerformance = performance.length > 0 ? (performance.reduce((a, b) => a + b, 0) / performance.length) * 100 : 0;

 const cuisineFrequency = userCuisineData.reduce((acc, row) => {
   acc[row.Cuisine] = (acc[row.Cuisine] || 0) + 1;
   return acc;
 }, {});

 const sortedCuisines = Object.keys(cuisineFrequency).sort((a, b) => cuisineFrequency[b] - cuisineFrequency[a]);

 const topCuisine = sortedCuisines[0];
 const topCuisinePercentage = (cuisineFrequency && topCuisine && userCuisineData && userCuisineData.length > 0) ? cuisineFrequency[topCuisine] / userCuisineData.length * 100 : 0;

 // Create a JSON object
 const data = {
   weeklySales: weeklySales,
   isHoliday: isHoliday,
   averageSatisfactionLevel: averageSatisfactionLevel,
   averageHoursWorked: averageHoursWorked,
   averagePerformance: averagePerformance,
   topCuisine: topCuisine,
   topCuisinePercentage: topCuisinePercentage,
   
 };

 // Write the JSON object to a file
 fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
 } catch (err) {
 console.error(err);
 }
};

fetchData();
