import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const ColumnChart = (props) => {
 const [chartData, setChartData] = useState([]);
 const [chartOptions, setChartOptions] = useState({});

 useEffect(() => {
  setChartData(props.data);
  setChartOptions(props.options);
 }, [props.data, props.options]);

 return (
  <Chart
    options={chartOptions}
    series={chartData}
    type='bar'
    width='100%'
    height='100%'
  />
 );
}

export default ColumnChart;
