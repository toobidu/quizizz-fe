import React, { useState } from "react";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header/>
      <Outlet />
      <Footer />
    </>
  );
}

export default App;