import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function NavBar() {
 const navigate = useNavigate();
 const { transcript, resetTranscript } = useSpeechRecognition({
  commands: [
    {
      command: 'navigate to home page',
      callback: () => navigate('/HomePage'),
    },
    {
      command: 'navigate to sales page',
      callback: () => navigate('/SalesPage'),
    },
  ],
 });

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
