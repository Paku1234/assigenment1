import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './HomePage.js';
import SalesPage from './SalesPage.js';
import NavBar from './NavBar';


function VoiceCommands() {
 const navigate = useNavigate();
 const [transcript, setTranscript] = useState('');

 const handleListen = () => {
   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
   const recognition = new SpeechRecognition();
   recognition.onresult = (event) => {
     if (event.results[0] && event.results[0].transcript) {
       const transcript = event.results[0].transcript.toLowerCase();
       console.log('Transcript:', transcript);
       setTranscript(transcript);

       if (transcript.includes('navigate to HomePage')) {
         navigate('/HomePage');
         console.log(navigate);
       } else if (transcript.includes('navigate to SalesPage')) {
         navigate('/SalesPage');
         console.log(navigate);

       }
     }
   };
   recognition.start();
 };

 const handleStop = () => {
   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
   console.log(window.SpeechRecognition || window.webkitSpeechRecognition);
   const recognition = new SpeechRecognition();
   recognition.stop();
 };

 return (
   <div>
     <button onClick={handleListen}>Start</button>
     <button onClick={handleStop}>Stop</button>
     <p>{transcript}</p>
   </div>
 );
}

function App() {
  return (
   <Router>
     <NavBar />
     <VoiceCommands />
     <Routes>
       <Route path="/" element={<VoiceCommands />} />
       <Route path="/HomePage" element={<HomePage />} />
       <Route path="/SalesPage" element={<SalesPage />} />
     </Routes>
   </Router>
  );
 }

export default App;
