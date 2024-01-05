import React, { createContext, useState } from 'react';

export const DataContext = createContext({
  data: null,
  setData: () => {},
  selectedStore: '',
  setSelectedStore: () => {},
  selectedDepartment: '',
  setSelectedDepartment: () => {},
});


export const DataProvider = ({ children }) => {
 const [data, setData] = useState(null);
 const [selectedStore, setSelectedStore] = useState('');
 const [selectedDepartment, setSelectedDepartment] = useState('');

 return (
 <DataContext.Provider value={{ data, setData, selectedStore, setSelectedStore, selectedDepartment, setSelectedDepartment }}>
   {children}
 </DataContext.Provider>
 );
};
