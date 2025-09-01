import React, { useState } from 'react'

export default function ChatBot() {
    const [message, setmessage] = useState('')
    const [result, setresult] = useState([])
console.log('chatbot',message)
    const action = async () => {
        const res = await fetch('http://localhost:5000/chatbot', {
  method: 'POST',
   headers: {
          "Content-Type": "application/json"
        },
  body: JSON.stringify({ messages: message}),
});
const data = await res.json();
setresult(data)
console.log(data)
    }
    
  return (
    <div style={{backgroundColor:'white', color:'black'}}><b>ChatBot</b>
    <br/>
        <input type='text' value={message} onChange={(event) => setmessage(event.target.value)}/>
        <button onClick={action}>Bot</button>
        <div style={{backgroundColor:'black', color:'white'}}>{result.content}</div>
    </div>
  )
}
