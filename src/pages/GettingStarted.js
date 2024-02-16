import {ArrowLeftOutlined} from '@ant-design/icons';
import styles from './GettingStarted.module.css';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"
import routes from '../constants/Routes.js';
import Axios from 'axios';

function GettingStarted() {
    const navigate = useNavigate();

  const handleTileClick = (sender) => {
    console.log("Current sender: ", sender);
    switch(sender) {
      case 'Register': navigate(routes.register); break;
      case 'Login': navigate(routes.login); break;
      default: break;
    }
  }


    return(
    <div className={styles['find-out-more-tile']}>


    <div style={{marginTop:'20px'}}>
    <div className={styles['eventPlanner']}>
            Event Planner
        </div>
        <div className={styles['getStarted']}>
            Getting Started
        </div>
        <div className={styles['sign-up-btn']} style={{background:'#074F57', color:'white', cursor:"pointer" }}  onClick={() => handleTileClick("Register")}>
            SIGN UP
        </div>
        <div className={styles['log-in-btn']} style={{background:'#074F57', color:'white', cursor:"pointer" }} onClick={() => handleTileClick("Login")}>
            LOG IN
        </div>
    </div>
</div>
    );
}

export default GettingStarted;