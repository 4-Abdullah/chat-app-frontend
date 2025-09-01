
import { Route, Routes } from 'react-router-dom';
import ChatApp from './pages/chatApp';
import Login from './pages/Login';
import Register from './pages/Register';


function App() {
    const isAuth = localStorage.getItem('username')
    console.log(isAuth)
  return (
    <div>
      <Routes>
            <Route path='/' element={<ChatApp/>}></Route>
            <Route path='/Login' element={<Login/>}></Route>
            <Route path='/Register' element={<Register/>}></Route>
    </Routes>
    </div>
  );
}

export default App;