// src/components/PageTransition.jsx
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}      // Bắt đầu: Mờ tịt
      animate={{ opacity: 1 }}      // Kết thúc: Hiện rõ
      exit={{ opacity: 0 }}         // Lúc mất: Mờ đi
      transition={{ duration: 0.3 }} // Diễn ra nhanh gọn trong 0.3s
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;