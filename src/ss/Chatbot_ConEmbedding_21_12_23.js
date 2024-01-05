import React, { useState ,useContext, useEffect} from 'react';
import './Chatbot.css';
import axios from 'axios';
import { DataContext } from './DataContext';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Directly add your OpenAI key here
const OPEN_AI_KEY = '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';

function parseQuestion(question) {
 return question.replace(/[^\w\s]/gi, '').toLowerCase();
}

function Chatbot() {
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState('');
 const [showChat, setShowChat] = useState(false);
 const { data } = useContext(DataContext);
 const { transcript, resetTranscript } = useSpeechRecognition();

 function generateAnswer(data, similarityScore) {
 // If the similarity score is below a certain threshold, return a default response
 if (similarityScore < 0.5) {
   return "I'm sorry, I don't have the information you're looking for.";
 }

 // If the similarity score is above the threshold, generate a response based on the data
 const response = `The most similar data to your question is: ${JSON.stringify(data)}. The similarity score is ${similarityScore}.`;

 return response;
 }

 async function generateEmbedding(text) {
 const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
   prompt: text,
   max_tokens: 100
 }, {
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${OPEN_AI_KEY}`,
   },
 })
 .then(response => {
   console.log(response);
   return response.data;
 })
 .catch(error =>{
   console.error();
   resetTranscript();
 });

 // Tokenize the output and average the embeddings of the tokens
 // This is a simplified example and may not work for all cases
 const tokens = response.data.choices[0].text.split(' ');
 const embeddings = tokens.map(token => '');
 const averageEmbedding = embeddings.reduce((a, b) => a.map((c, i) => c + b[i])).map(c => c / embeddings.length);

 return averageEmbedding;
 }

 function calculateSimilarity(embedding1, embedding2) {
 let dotProduct = 0;
 let magnitude1 = 0;
 let magnitude2 = 0;

 for (let i = 0; i < embedding1.length; i++) {
   dotProduct += embedding1[i] * embedding2[i];
   magnitude1 += Math.pow(embedding1[i], 2);
   magnitude2 += Math.pow(embedding2[i], 2);
 }

 return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
 }

 function findMostSimilarEmbedding(questionEmbedding, dataEmbeddings) {
 let mostSimilarDataIndex = -1;
 let mostSimilarSimilarity = -1;

 for (let i = 0; i < dataEmbeddings.length; i++) {
   const similarity = calculateSimilarity(questionEmbedding, dataEmbeddings[i]);

   if (similarity > mostSimilarSimilarity) {
     mostSimilarDataIndex = i;
     mostSimilarSimilarity = similarity;
   }
 }

 return mostSimilarDataIndex;
 }

 const handleInputChange = (e) => {
  setInput(e.target.value);
 };

 const handleSendMessage = async () => {
 if (transcript !== '') {
   const parsedQuestion = parseQuestion(transcript); // Use transcript here
   const storedOverallDataJSONString = localStorage.getItem('overallData');
   const storedOverallData = JSON.parse(storedOverallDataJSONString);

   // Generate embeddings for the user's question and the data in the JSON file
   const questionEmbedding = await generateEmbedding(parsedQuestion);
   const dataEmbeddings = await Promise.all(storedOverallData.map(generateEmbedding));

   // Find the most similar embedding for the user's question among the data embeddings
   const mostSimilarDataIndex = findMostSimilarEmbedding(questionEmbedding, dataEmbeddings);

   // If a similar data is found, use it to generate the answer
   if (mostSimilarDataIndex !== -1) {
     const answer = generateAnswer(storedOverallData[mostSimilarDataIndex]);
     setMessages([...messages, { role: 'user', text: transcript }, { role: 'bot', text: answer }]); // Use transcript here
     resetTranscript(); // Reset the transcript after sending the message
     return;
   }

   const response = await axios.post('https://api.openai.com/v1/chat/completions', {
     model: 'gpt-3.5-turbo',
     messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: transcript }], // Use transcript here
     max_tokens: 10
   }, {
     headers: {
       'Authorization': `Bearer ${OPEN_AI_KEY}`,
     }
   });

   // Add bot response to chat
   const botMessage = response.data.choices[0].message.content;

   // Add user message and bot response to chat
   setMessages([...messages, { role: 'user', text: transcript }, { role: 'bot', text: botMessage }]); // Use transcript here
   resetTranscript(); // Reset the transcript after sending the message
 }
 };
 useEffect(() => {
  if (transcript !== '') {
    handleSendMessage();
  }
}, [transcript]);

 const handleClick = () => {
  setShowChat(!showChat);
 };

 return (
  <div className={`chatbot ${showChat ? 'chat-open' : ''}`}>
    <div className="logo" onClick={handleClick}>
      <img src="/chatbot.png" alt="Chatbot Logo" />
    </div>
    {showChat && (
      <div className="chatbox">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className="message">
              {message.role === 'bot' ? (
               <div className="bot-message">{message.text}</div>
              ) : (
               <div className="user-message">{message.text}</div>
              )}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
        <button onClick={SpeechRecognition.startListening}>🎤</button> {/* Microphone button */}
      </div>
    )}
  </div>
);
}

export default Chatbot;