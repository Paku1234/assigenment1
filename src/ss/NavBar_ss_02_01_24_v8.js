import React, { useEffect, useState,useContext} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { debounce } from 'lodash';
import { DataContext } from './DataContext';
import { franc } from 'franc-min';




const OPEN_AI_KEY = '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';

const commandMapping = {
  'विभाग चुनें': 'select department',
  'स्टोर चुनें': 'select store',
  'सबसे लोकप्रिय व्यंजन': 'most popular cuisine',
  'एक नंबर स्टोर चुनें': 'select store 1',
  '2 नंबर स्टोर चुनें': 'select store 2',
  '3 नंबर स्टोर चुनें': 'select store 3',
  
};

function NavBar() {
 const navigate = useNavigate();
 const { transcript, resetTranscript } = useSpeechRecognition();
 const { setSelectedStore, setSelectedDepartment } = useContext(DataContext);
 const [commands, setCommands] = useState([]);
 const [selectedValue, setSelectedValue] = useState('');

 // Function to process voice command
 const processCommand = async () => {
   // Clean transcript and convert to lowercase
   let cleanedTranscript = transcript.toLowerCase().replace(/\s+/g, '');

   const language = detectLanguage(cleanedTranscript);
   SpeechRecognition.startListening({ continuous: true, language });

   if (isHindi(cleanedTranscript)) {
    cleanedTranscript = translateToEnglish(cleanedTranscript);
  }  

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

 useEffect(() => {
  const timer = setTimeout(() => {
    if (SpeechRecognition.isListening) {
      SpeechRecognition.stopListening();
      SpeechRecognition.startListening({ continuous: true });
    }
  }, 10000); 

  return () => clearTimeout(timer);
}, [transcript]);

 return (
  <nav>
    <ul>
      <li><Link to="/HomePage">Home</Link></li>
      <li><Link to="/SalesPage">Sales</Link></li>
    </ul>
    <p style={{ background: '#f0f0f0', padding: '10px',marginBottom:'0px' }}>{transcript}</p>
    <button style={{ background: '#74c69d', color: 'white' }} onClick={() => SpeechRecognition.startListening({ continuous: true,language:'en-us' })}>Listen!</button>
    <button style={{ background: '#74c69d', color: 'white' }} onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'hi-IN' })}>Listen in Hindi!</button>
    <button style={{ background: '#f4845f', color: 'white' }} onClick={SpeechRecognition.stopListening}>Stop!</button>
    <br />
  </nav>
);
}

function isHindi(text) {
  return /[\u0900-\u097F]/.test(text);
}


function translateToEnglish(text) {
  if (commandMapping[text]) {
    return commandMapping[text];
  }
  return text;
}
function detectLanguage(text) {
  const detectedLanguage = franc(text);
  switch (detectedLanguage) {
   case 'eng':
     return 'en-US';
   case 'hin':
     return 'hi-IN';
   default:
     return 'en-US';
  }
 }

export default NavBar;