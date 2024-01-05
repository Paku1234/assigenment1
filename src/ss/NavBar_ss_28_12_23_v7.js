import React, { useEffect, useState,useContext} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { debounce } from 'lodash';
import { DataContext } from './DataContext';

// OpenAI Key
const OPEN_AI_KEY = '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';

function NavBar() {
 const navigate = useNavigate();
 const { transcript, resetTranscript } = useSpeechRecognition();
 const { setSelectedStore, setSelectedDepartment } = useContext(DataContext);
 const [commands, setCommands] = useState([]);

 // State to store selected dropdown values
 const [selectedValue, setSelectedValue] = useState('');

 // Function to process voice command
 const processCommand = async () => {
   // Clean transcript and convert to lowercase
   const cleanedTranscript = transcript.toLowerCase().replace(/\s+/g, '');

   // Check for navigation commands
   if (cleanedTranscript.includes('homepage')) {
     navigate('/HomePage');
   } else if (cleanedTranscript.includes('salespage')) {
     navigate('/SalesPage');
   } else if (cleanedTranscript.startsWith('selectstore')) {
     const storeNumber = cleanedTranscript.split('selectstore')[1];
     setSelectedStore(`Store ${storeNumber}`);
   } else if (cleanedTranscript.startsWith('selectdepartment')) {
     const departmentNumber = cleanedTranscript.split('selectdepartment')[1];
     setSelectedDepartment(`Department ${departmentNumber}`);
   } else {
     // Use OpenAI to understand command
     try {
       const response = await axios.post('https://api.openai.com/v1/chat/completions', {
         model: 'gpt-3.5-turbo',
         messages: [
           { role: 'system', content: 'You are a helpful assistant.' },
           { role: 'user', content: transcript },
         ],
         max_tokens: 20,
       }, {
         headers: {
           Authorization: `Bearer ${OPEN_AI_KEY}`,
         },
       });

       const command = response.data.choices[0].message.content;
       setCommands(prevCommands => [...prevCommands, command]);
     } catch (error) {
       if (error.response && error.response.status === 429) {
         console.error('Too many requests, please try again later.');
       } else {
         console.error(error);
       }
     }
   }

   resetTranscript();
 };

 const debouncedProcessCommand = debounce(processCommand, 500);

 useEffect(() => {
   if (transcript !== '') {
     debouncedProcessCommand();
   }
 }, [transcript, debouncedProcessCommand]);

 return (
  <nav>
    <ul>
      <li><Link to="/HomePage">Home</Link></li>
      <li><Link to="/SalesPage">Sales</Link></li>
    </ul>
    <p style={{ background: '#f0f0f0', padding: '10px',marginBottom:'0px' }}>{transcript}</p>
    <button style={{ background: '#74c69d', color: 'white' }} onClick={SpeechRecognition.startListening}>Listen!</button>
    <button style={{ background: '#f4845f', color: 'white' }} onClick={SpeechRecognition.stopListening}>Stop!</button>
    <button style={{ background: '#48cae4', color: 'white' }} onClick={resetTranscript}>Reset</button>
    <br />
  </nav>
);
}

export default NavBar;
