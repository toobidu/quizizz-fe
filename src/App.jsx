import React, { useState, useEffect } from "react";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import authStore from "./stores/authStore";


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
    </>
  );
}

export default App;