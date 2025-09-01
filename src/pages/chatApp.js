import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
         import {
  Menu,
  MenuItem,
  MenuButton,
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import * as linkify from "linkifyjs";
import Navbar from '../components/navbar';
import ChatBot from '../components/chatBot';
import { ChatContext } from '../Context API/Context';
import ReactMarkdown from 'react-markdown';
import ReactDom from 'react-dom'
import MenuModel from '../components/menu';
import { useListMenuPosition } from './../components/useListMenuPosition';
const socket = io.connect('http://localhost:5000', {
  auth: { serverOffset: 0 }
});

function ChatApp() {
  const [message, setMessage] = useState('');
  const [imageChunks, setImageChunks] = useState([]);
  const [Search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [FriendName, setFriendName] = useState("");
  const [chat, setChats] = useState([]);
  const [Users, setUsers] = useState([]);
  const [SearchUser, setSearchUsers] = useState([]);
  const inputRef = useRef(null);
   const [open, setOpen] = useState(false);
   const { active, setActive } = useContext(ChatContext);
   const { bot, setbot } = useContext(ChatContext);
   const [botmessage, setbotmessage] = useState({})
    const [activeIndex, setActiveIndex] = useState(null);
   const anchorRef = useRef([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollContainerRef = useRef();
  const position = useListMenuPosition(anchorRef, scrollContainerRef);

     const [inView, setInView] = useState(false);
       const [result, setresult] = useState({})
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
const content = data.content.replace(/^(analysis\s*&assistantfinal\l*)/, '').trim()
const reasoning = data.reasoning
const reasoning_details  = data.reasoning_details

  setresult({content:content, reasoning: reasoning, reasoning_details:reasoning_details});
      setMessage('');
   console.log(data)
       }
    const user = sessionStorage.getItem('username')
    console.log(user)
    const navigate = useNavigate();

useEffect(()=>{
    if(!user){
      return navigate(`./Login`); 
    }


    (async() =>{
    const res = await fetch(`http://localhost:5000/Friend?username=${user}`)
     const data = await res.json()  
   
    if(res.status===200){
   console.log(data); 
   setUsers(() => [...data.friends]);
 }
 })();
    
  socket.on(
    'message',
     (username,friendName,message,imageUrls,serverOffset) => {
      console.log(username,friendName,message,imageUrls)
    setChats((prev) => [...prev, {from:username,message:message,image:imageUrls}]);
    socket.auth.serverOffset = serverOffset;
  }
)
socket.on('uploadStarted', (fileName) => {
  console.log(`Uploading ${fileName}...`);
  setUploading(true);
});

socket.on('uploadComplete', (image) => {
  console.log('Upload finished:', image);
  setUploading(false);
  setImageChunks(()=>[])
});

  // 🧹 Clean up on unmount
  return () => {
    socket.off()
  };
},[user])  


  const handleSubmit = async(friendName) => {

    if (message||imageChunks.length) {

      console.log(message)
      socket.emit('sendMessage', {username:user,friendName,message,imageChunks} );
      
      setMessage('');
       inputRef.current.value = ''
    }
  };

const SearchUsers = async(e) =>{
  e.preventDefault()
  const res = await fetch(`http://localhost:5000/Friend?search=${Search}`)
   const data = await res.json()  
 console.log(data); 
 setSearchUsers(() => [...data]);

}

const getMessages = async(friendName) =>{
  
  setChats(()=>[])
  const res = await fetch(`http://localhost:5000/Friend/messages?username=${user}&friendName=${friendName}`)
   const data = await res.json()  

  setFriendName(friendName)
  setActive(true)
  setbot(false)
  if(res.status===200){
   console.log(data); 
      setChats(()=> [...data.chatList])

 }

}

const addFriend = async(friendName) =>{
 
  const res = await fetch(`http://localhost:5000/Friend`,
    {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username:user, friendName})
      }) 
   const data = await res.json()  
 console.log(data); 
  
 setUsers(() => [...data.friends]);
}

const deleteMessage = async(message,image) =>{
  
  const res = await fetch(`http://localhost:5000/messages`,
    {
        method:"DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username:user, FriendName, message, image})
      }) 
   const data = await res.json()  
 console.log(data); 

      setChats(()=> [...data.messageList])

}

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async (message) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared from Chat App',
          text: message,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

function testlink(message){

  const test = linkify.find(message)
  if(test[0]?.isLink){
     return test[0]?.value
   }
console.log(test[0]?.isLink, message,chat)
return test[0]?.isLink
}

const handleImageChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const CHUNK_SIZE = 1024 * 512; // 1MB
  const chunks = [];
  let offset = 0;

  function sendChunk() {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const reader = new FileReader();

    reader.onloadend = () => {
      chunks.push({
        chunk: reader.result,
        fileName: file.name,
        mimeType: file.type,
        offset,
        isLast: offset + CHUNK_SIZE >= file.size,
      });

      offset += CHUNK_SIZE;
      if (offset < file.size) {
        sendChunk();
      } else {
        setImageChunks(chunks); // Store all chunks in state
      }
    };

    reader.readAsArrayBuffer(chunk);
  }

  sendChunk();
  setImageChunks()
};



const Spinner = () => (
  <div className='wrapper'>
    <div className='loader'>Uploading...</div>
   
  </div>
);
console.log(chat)
  return (
    <div style={{display:'flex', flexDirection:'row', height:'100vh',overflow:'hidden', width:'100%', color:'white', background:'#E6E6FA' }}>
      <div style={{width:"5%"}}>
      <Navbar/>
      </div>
      <div style={{listStyle:'none', width:'100%', borderLeft:'1px solid #757778',background:'#6363c4ff', display:'flex', flexDirection:'row' }}>
      
        {!Search||Search===user?<>
        <div style={{borderRight:'1px solid #757778',overflowY:"auto", width:'20%'}}>
          <h2 style={{color:'ThreeDDarkShadow'}}>Chat Room</h2>
          <div style={{display:'flex', flexDirection:'row' }}>
            <input type='search' name='search' value={Search} onChange={(event) => setSearch(event.target.value)} placeholder='Search'/>
            <button type='button' onClick={SearchUsers}>Search</button>
          </div>
      <ul
      style={{margin:"0px",justifyItems:'left',padding:'10px', listStyleType:'none'}}>

          {Users.map((user, index) => (

          <li key={index} style={{width:'100%',rowGap:'50px',height:'100%'}}>
              <button style={{width:'100%',padding:"5px", gap: '10px', borderRadius:"5px"}}
               onClick={()=>getMessages(user.friendName)}>{user.friendName}</button>
          </li>
          
        ))}</ul>

        </div>
        
        {active?
      <div style={{display:'flex',width:'100%',height:'700px', flexDirection:"column", margin:'0px',background:'white' ,color:'black'}}>
        <div style={{backgroundColor:"steelblue", fontSize:'x-large', fontStyle:'italic', color:'white'}}>{bot?'ChatGPT':FriendName.toUpperCase()}</div>
        <div style={{flex:'1'}}/>
       <ul
       ref={scrollContainerRef}
       style={{listStyle:'none', padding:'1px',maxHeight:'800px', overflowY:'auto' }}>
        
        {bot?
       <li style={{position:'relative'}}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{result.content}</ReactMarkdown>
            <ReactMarkdown>{result.reasoning}</ReactMarkdown>
            <>{result.reasoning_details>0&&result.reasoning_details.map((res) => (
              <ReactMarkdown>{res.text}</ReactMarkdown>
            ))}</>
        </li>

            // Scroll

        :chat.length>0&&chat.map((message, index) => (<>
      {message.from===user?     
        <li key={index}
          
        ref={anchorRef}
        style={{ borderBottom: '1px solid #eee',
        cursor: 'pointer',
textAlign:'end', padding:'5px', width:'fit-content', marginLeft: 'auto', position:'relative'}}>
            <div className='chatCard'>
              {testlink(message.message)?
              <div style={{maxWidth:'250px', wordWrap:'break-word', whiteSpace:'normal'}}>
              <a href={testlink(message.message)} target="_blank" rel="noopener noreferrer">{message.message}</a></div>:
              <>{(message.image?.length>0&&message.message)?
             
<div>
 <img src={message.image} alt="uploaded" width={300} />
 <div style={{maxWidth:'200px', wordWrap:'break-word', whiteSpace:'normal'}}>{message.message}</div></div>:
    <>{(message.image?.length>0)?           
 <img src={message.image} alt="uploaded" width={300} />
 
              :<div style={{maxWidth:'200px', wordWrap:'break-word', whiteSpace:'normal'}}>{message.message}</div>}</>}</>
}     
<MenuModel position={position} anchorRef={anchorRef.current[index]} onClose={() => setActiveIndex(null)} active={setActiveIndex}
 index={index} message={message} copyToClipboard={copyToClipboard} handleShare={handleShare} deleteMessage={deleteMessage}/>
</div>
          </li>:
            <li key={index} style={{ textAlign:'start' }}>
       
                 <div> {testlink(message.message)?
              <a href={testlink(message.message)} target="_blank" rel="noopener noreferrer">{message.message}</a>:
                  <>{message.image?.length>0?
             
 <>
 <div>{message.image[0]}</div>
 <img src={message.image} alt="uploaded" width={200} height={200}/>
 </>
       :<>{message.message}</>}</>
}
<Menu  direction="right"
  position="anchor" menuStyle={{  maxHeight: '100px',viewScroll:"auto",
    minWidth: '80px',
    maxWidth: '120px',
     overflow: 'auto',
    }}  menuButton={<MenuButton style={{width:'20px',minHeight:'10px',maxHeight:'30px'}}>▾</MenuButton>}>
      <MenuItem onClick={typeof(message.message)==='string'?()=>copyToClipboard(message.message):'download'}>Copy</MenuItem>
      <MenuItem onClick={()=>handleShare(message.message)}>Share</MenuItem>
    </Menu>
            
</div>
          </li>}
          </>
        ))}
      </ul>
      <div >
 {uploading && <Spinner />}</div>

        <div style={{height:'30px', backgroundColor:'grey'}}>
        <input type="text" value={message} placeholder="Your message" onChange={(event) => setMessage(event.target.value)} />
        <input type="file" accept="image/*" onChange={handleImageChange} ref={inputRef}/>              
        <button onClick={()=>bot?action():handleSubmit(FriendName)}>Send</button>
        </div>
      
      </div>:
      <div>Didn't get messages</div>
      }</>
        :
        <>
      <ul style={{listStyle:'none', margin: 0}}>
        {SearchUser.map((user, index) => (
          
          <li key={index} style={{border:'1px solid', padding:"5px", gap: '10px', borderColor:'blueviolet', borderRadius:"5px",display:'flex', flexDirection:'row'}}>
              <div>{user.username}</div>
              <button onClick={()=>addFriend(user.username)}>AddFriend</button>
          </li>
          
        ))}</ul>
        </>}
    </div>
      
    </div>
  );
}

export default ChatApp;