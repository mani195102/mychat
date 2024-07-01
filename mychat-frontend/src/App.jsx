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
import Profile from './pages/Profile'
import { useDispatch,useSelector } from 'react-redux';
 import SearchAndConversations from './components/SearchandConversations'

function App() {
  const dispatch = useDispatch();
  return (
    <div className="App">
    <Routes>
    <Route path='/' element={<Login />} />
    <Route path='profile/:id' element={<Profile />} />
    <Route path='app' element={<MainContainer />}>
      <Route path='welcome' element={<Welcome />} />
      <Route path='chat/:_id' element={<ChatArea />} />
      <Route path='users' element={<Users />} />
      <Route path='groups' element={<Groups />} />
      <Route path='create-groups' element={<CreateGroups />} />
      <Route path='conversations' element={<SearchAndConversations />} />

      {/* <Route path='private-chat' element={<PrivateChat />} /> */}
    </Route>
  </Routes>

    </div>
  )
}

export default App
