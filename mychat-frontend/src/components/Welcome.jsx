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
    <motion.div
      className="welcome-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.img
        drag
        whileTap={{ scale: 1.03, rotate: 360 }}
        src={logo}
        alt='logo'
        className='welcome-logo'
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <b>Hi, {userData.name} !!!</b>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        View and text directly to people present in the chat rooms
      </motion.p>
    </motion.div>
  );
}

export default Welcome;
