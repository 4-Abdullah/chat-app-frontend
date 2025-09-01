import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
      const navigate = useNavigate();
     const [user, setUser] = useState({
        identifier: '',   // Provide an initial value
        password: ''     // Provide an initial value
      });
   
   
    const [showPassword, setShowPassword] = useState(false);
    // To show or hide password  
    const pressShow = (e) => {
      e.preventDefault();
      setShowPassword(!showPassword)
    }

   // To handle password validation on real time 
  const [password,setPassword] = useState('')
  const [errorP, setErrorP] = useState('');
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if(newPassword.length>0 && newPassword.length<8){
      setErrorP('Password atleast be 8 characters');
    }
    else{
        setErrorP('')
    }
  }
  // To handle Email validation on real time 
  const [email,setEmail] = useState('')
  const [errorE,setErrorE] = useState('')
  const handleEmailChange = (e) =>{
  const newEmail = e.target.value;
  setEmail(newEmail);
  if(newEmail.includes("@gmail.com")||newEmail.includes("@yahoo.com")||newEmail.includes("@hotmail.com")||newEmail.includes("@outlook.com")){
    setErrorE('');
    }
    else{
      setErrorE('Invalid Email');
    }
  }

  
  const [errorU,setErrorU] = useState('')
  const handleUsernameChange = (e) =>{
  const newUsername = e.target.value;
  const newEmail = e.target.value;
  if((newUsername.length>2 && newUsername.length<12) || (newEmail.includes("@gmail.com")
    ||newEmail.includes("@yahoo.com")||newEmail.includes("@hotmail.com")||newEmail.includes("@outlook.com"))){
    setErrorU('');
    }
    else{
       if(newUsername.length<3){
        setErrorU('Username is too short!');
      }
    }
  }

const SubmitLogin = async (e) => {
   
   e.preventDefault();
   
  const response = await fetch(`http://localhost:5000/Login`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    // credentials: "include", 
    body: JSON.stringify(user),
})
console.log("Status Code:", response.status); // Example: 200, 400, 500
console.log("Response OK?", response.ok); // true if 2xx, false otherwise
const data = await response.json()
console.log("Response JSON:", data); 

              // check response ok
              if (response.ok) {
                // login successful, redirect to the application page
                e.preventDefault();
                // localStorage.setItem('authToken', data.accessToken)
                // console.log(localStorage.getItem('authToken'))

                // const destination = `/Application/?email=${user.email}`;
                const destination = `/`
                // localStorage.setItem('username', data.username)
                sessionStorage.setItem('username', data.username)
                navigate(destination)
                toast.success('Login successful')
                console.log(response);
               } else {      
                 // login failed, display an error message
                 toast.error('Login Error!')
                 console.log(response);
               } 
}


  return (
    <div>
        <form onSubmit={SubmitLogin}  className="flex flex-col gap-4 absolute text-l w-64 h-50 bottom-40 left-1/2 -translate-x-1/2 -translate-y-1/2 font-italic">   
               <div  className="relative">
               <input required onChangeCapture={handleUsernameChange} value={user.identifier}  onChange={(e) =>setUser({ ...user, [e.target.name]: e.target.value})} className="p-2 text-black text-opacity-50 focus:text-black  w-full h-12 rounded-lg" placeholder='Username or email' name='identifier' type='text'/>
               {(errorU || errorE) && <div className="text-xs text-black">{errorU || errorE}</div>}
               
               </div>
               <div className="relative">
               <input required value={user?.password} onChangeCapture={handlePasswordChange} onChange={(e) =>setUser({ ...user, [e.target.name]: e.target.value})} className="p-2 text-black text-opacity-50 focus:text-black  w-full h-12 rounded-lg" placeholder="Password" name='password' type={showPassword? "text":'password'}/>
               {errorP && <div className="text-xs text-black">{errorP}</div>}
             {showPassword? 
               <svg xmlns="http://www.w3.org/2000/svg" onClick={e => pressShow(e)} width="18" height="18" fill="indigo" className="absolute bi bi-eye top-1/2 right-2 -translate-y-1/2" viewBox="0 0 16 16">
               <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
               <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
               </svg>:
               <svg xmlns="http://www.w3.org/2000/svg" onClick={e => pressShow(e)} width="18" height="18" fill="indigo" className="absolute bi bi-eye-slash top-1/2 right-2 -translate-y-1/2" viewBox="0 0 16 16">
                 <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                 <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                 <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
               </svg>
             }
             </div>
               <div className="relative">  
              
                <button type='submit' className="absolute shrink-0 w-32 bottom-0 -right-1 -translate-x-1/2 -translate-y-1 bg-indigo-600 hover:bg-indigo-700 text-slate-800 font-bold py-2 px-4 rounded-full">
               Login
              </button>
            
                <Link to="/Register">
          <button type='button' className="absolute shrink-0 w-1/2 h-14 -bottom-20 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 font-bold py-2 px-4 rounded-full">
            Register
            {/* <Toaster /> */}
          </button>
          </Link>
          </div>
           </form>
    </div>
  )
}
