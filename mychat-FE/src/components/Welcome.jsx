import React, { useEffect } from 'react';
import logo from '../assets/message.svg';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const lighttheme = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userdata"));

  useEffect(() => {
    if (!userData) {
      navigate("/");
    }
  }, [userData, navigate]);

  if (!userData) {
    return null; // Render nothing or a loading spinner
  }

  return (
    <div className={`welcome-container${lighttheme ? '' : ' dark'}`}>
      <motion.img
        drag
        whileTap={{ scale: 1.03, rotate: 360 }}
        src={logo}
        alt='logo'
        className='welcome-logo'
      />
      <b>Hi, {userData.name} !!!</b>
      <p>View and text directly to people present in the chat rooms</p>
    </div>
  );
}

export default Welcome;
