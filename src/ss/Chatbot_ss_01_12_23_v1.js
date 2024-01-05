import React, { useState } from 'react';
import './Chatbot.css';
import axios from 'axios';

// Directly add your OpenAI key here
const OPEN_AI_KEY = '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';

function Chatbot() {
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState('');
 const [showChat, setShowChat] = useState(false);

 const handleInputChange = (e) => {
   setInput(e.target.value);
 };

 const handleSendMessage = async () => {
   if (input !== '') {
     // Send user message to OpenAI API
     const response = await axios.post('https://api.openai.com/v1/chat/completions', {
       model: 'gpt-3.5-turbo',
       messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: input }],
       max_tokens: 5
     }, {
       headers: {
         'Authorization': `Bearer ${OPEN_AI_KEY}`,
       }
     });

     // Add bot response to chat
     const botMessage = response.data.choices[0].message.content;

     // Add user message and bot response to chat
     setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: botMessage }]);
     setInput('');
   }
 };

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
       </div>
     )}
   </div>
 );
}

export default Chatbot;
