import React, { useState ,useContext} from 'react';
import './Chatbot.css';
import axios from 'axios';
import { DataContext } from './DataContext';


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
 

 const handleInputChange = (e) => {
   setInput(e.target.value);
 };

 const handleSendMessage = async () => {
   if (input !== '') {
     // Send user message to OpenAI API
     const storedOverallDataJSONString = localStorage.getItem('overallData');
     const storedOverallData = JSON.parse(storedOverallDataJSONString);
   
     // Parse the user's question
     const parsedQuestion = parseQuestion(input);
   
     // Check if the parsed question matches any of the keys in the JSON data
     
     const keys = Object.keys(storedOverallData).map(key => key.toLowerCase());
     for (let key of keys) {
       if (parsedQuestion.includes(key)) {
         // If the parsed question matches a key, respond with the data from the JSON file
         const botMessage = storedOverallData[key];
         setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: botMessage }]);
         setInput('');
         return;
       }
     }
     if (parsedQuestion.includes("weekly sales")) {
      const botMessage = `The weekly sales are ${storedOverallData.weeklySales}.`;
      setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: botMessage }]);
      setInput('');
      return;
    }
    if (parsedQuestion.includes("holiday")) {
      const botMessage = `${storedOverallData.isHoliday}`;
      setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: botMessage }]);
    setInput('');
    return;
  }
    if (parsedQuestion.includes("average satisfaction level")) {
      if (storedOverallData.employeeOverview) {
        const botMessage = `The average satisfaction level is ${storedOverallData.employeeOverview.averageSatisfactionLevel}%.`;
        setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: botMessage }]);
        setInput('');
        return;
      }
     }
     if (parsedQuestion.includes("average hours worked")) {
      if (storedOverallData.employeeOverview) {
        const botMessage = `The average hours worked is ${storedOverallData.employeeOverview.averageHoursWorked}%.`;
        setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: botMessage }]);
        setInput('');
        return;
      }
     }
     if (parsedQuestion.includes("average performance")) {
      if (storedOverallData.employeeOverview) {
        const botMessage = `The average performance is ${storedOverallData.employeeOverview.averagePerformance}%.`;
        setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: botMessage }]);
        setInput('');
        return;
      }
     }
     const rankMap = {
      'top':0,
      'second': 1,
      'third': 2,
      'fourth': 3,
      'fifth': 4
    };
    
    for (let rank in rankMap) {
      if (parsedQuestion.includes(`${rank} most popular cuisine`)) {
        if (storedOverallData.mostOrderedCuisine && storedOverallData.mostOrderedCuisine.length > rankMap[rank]) {
          const botMessage = `The ${rank} most popular cuisine is ${storedOverallData.mostOrderedCuisine[rankMap[rank]].cuisine} with a percentage of ${storedOverallData.mostOrderedCuisine[rankMap[rank]].percentage}%.`;
          setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: botMessage }]);
          setInput('');
          return;
        }
      }
    }
     const response = await axios.post('https://api.openai.com/v1/chat/completions', {
       model: 'gpt-3.5-turbo',
       messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: input }],
       max_tokens: 10
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
