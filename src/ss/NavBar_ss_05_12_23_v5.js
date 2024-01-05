import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { debounce } from 'lodash';

// Directly add your OpenAI key here
const OPEN_AI_KEY = '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';

function NavBar() {
 const navigate = useNavigate();
 const { transcript, resetTranscript } = useSpeechRecognition();
 const [commands, setCommands] = useState([]);

 const processCommand = async () => {
   // Remove spaces from the transcript and convert it to lowercase
   const cleanedTranscript = transcript.toLowerCase().replace(/\s+/g, '');

   // Check if the cleaned transcript matches a command
   const command = ['homepage', 'salespage'].find(cmd => cleanedTranscript.includes(cmd));

   if (command) {
     // If a command is found, navigate to the corresponding page
     if (command === 'homepage') {
       navigate('/HomePage');
     } else if (command === 'salespage') {
       navigate('/SalesPage');
     }
   } else {
     // If no command is found, use the OpenAI API to understand the command
     try {
       const response = await axios.post('https://api.openai.com/v1/chat/completions', {
         model: 'gpt-3.5-turbo',
         messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: transcript }],
         max_tokens: 10
       }, {
         headers: {
           'Authorization': `Bearer ${OPEN_AI_KEY}`,
         }
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
     <p>{transcript}</p>
     <button onClick={SpeechRecognition.startListening}>Listen!</button>
     <button onClick={SpeechRecognition.stopListening}>Stop!</button>
     <button onClick={resetTranscript}>Reset</button>
   </nav>
 );
}

export default NavBar;
