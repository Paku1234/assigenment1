import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { debounce } from 'lodash';

// OpenAI Key
const OPEN_AI_KEY = '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';

function NavBar() {
  const navigate = useNavigate();

  const { transcript, resetTranscript } = useSpeechRecognition();
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
    } else if (cleanedTranscript.startsWith('select')) {
      // Extract dropdown value
      const selectedValue = cleanedTranscript.split('select ')[1];

      // Update state with selected value
      setSelectedValue(selectedValue);
    } else {
      // Use OpenAI to understand command
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: transcript },
          ],
          max_tokens: 10,
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
      <p>{transcript}</p>
      <button onClick={SpeechRecognition.startListening}>Listen!</button>
      <button onClick={SpeechRecognition.stopListening}>Stop!</button>
      <button onClick={resetTranscript}>Reset</button>
      <br />
      
    </nav>
  );
}

export default NavBar;
