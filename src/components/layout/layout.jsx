import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header"; 
import Footer from "./Footer"; 

const Layout = () => {
  return (
    <div style={layoutStyle}>
      <Header />
      <main style={mainStyle}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

const layoutStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh', 
};

const mainStyle = {
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column',
};

export default Layout;
