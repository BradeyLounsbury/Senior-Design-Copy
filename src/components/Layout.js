import React, { useContext, useEffect, useState, useRef } from "react"
import {Header} from '../components/Header.js';
import  Footer from '../components/Footer.js'; 
import routes from '../constants/Routes.js';
import { Outlet } from "react-router-dom";
import Pool from "../UserPool.js";
import {ConfirmationModeless, ModelessContext} from "./ConfirmationModeless.js";
import autoAnimate from '@formkit/auto-animate';

const Layout = (props) => {
  let isLoggedIn = false;
  const updateILI = (bool) => {
    isLoggedIn = bool;
  }

  const parent = useRef(null);

  let [confProps, setConfProps] = useState({isVisible: false, success: false, text: ""});

  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent]);

  useEffect(() => {
    if(confProps.isVisible)
    {
      setTimeout(() => {
        setConfProps({isVisible: false, success: false, text: ""});
      }, 2000);
    }
  }, [confProps])

  const user = Pool.getCurrentUser();
  if (user) {
      user.getSession((err, session) => {
        if (err) {
          updateILI(false);
        } else {
          updateILI(true);
        }
      });
  } else {
      updateILI(false);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn}/>
        <div ref={parent}>
        {confProps.isVisible && <ConfirmationModeless {...confProps}/>}
        <ModelessContext.Provider value={setConfProps}>
          <Outlet />
        </ModelessContext.Provider>
        <Footer />
      </div>
    </>
  );
}
export default Layout;
