import React, { useState, useEffect } from "react";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import authStore from "./stores/authStore";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initialize auth khi app khởi động
    authStore.getState().initialize();
  }, []);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;