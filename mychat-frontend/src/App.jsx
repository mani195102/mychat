import React from 'react';
import './App.css';
import MainContainer from './components/MainContainer';
import Login from './pages/Login';
import { Routes, Route } from "react-router-dom";
import ChatArea from './components/ChatArea';
import Welcome from './components/Welcome';
import CreateGroups from './components/CreateGroups';
import Groups from './components/Groups';
import Users from './components/Users';
import Profile from './pages/Profile';
import ForgetPassword from './pages/ForgetPassword'; 
import ResetPassword from './pages/ResetPassword'; 
import SearchAndConversations from './components/SearchandConversations';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/forgetpassword' element={<ForgetPassword />} /> {/* Route for ForgetPassword */}
        <Route path='/reset_password/:token' element={<ResetPassword />} /> {/* Route for ResetPassword */}
        <Route path='app' element={<MainContainer />}>
          <Route path='profile/:id' element={<Profile />} />
          <Route path='welcome' element={<Welcome />} />
          <Route path='chat/:_id' element={<ChatArea />} />
          <Route path='users' element={<Users />} />
          <Route path='groups' element={<Groups />} />
          <Route path='create-groups' element={<CreateGroups />} />
          <Route path='conversations' element={<SearchAndConversations />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
