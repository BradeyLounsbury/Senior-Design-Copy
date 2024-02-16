import {
  CalendarOutlined, 
  EnvironmentOutlined,
  NotificationOutlined,
  TeamOutlined,
  CommentOutlined,
  RightOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import styles from './Dashboard.module.css';
import routes from '../constants/Routes.js';
import React, { useContext, useEffect, useState } from 'react';
import { AccountContext } from '../components/Account';

function Dashboard() {
  const { getSession } = useContext(AccountContext);
  const navigate = useNavigate();

  const [width, setWidth] = useState(window.innerWidth);
  const isMobile = width <= 768;

  const handleWindowSizeChange = () =>
  {
      setWidth(window.innerWidth);
  }

  useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);


  useEffect(() => {
    getSession()
      .then((session) => {
          console.log("Session: ", session);
      })
      .catch((err) => {
          console.error("Session error: ", err);
          navigate(routes.login);
      })
  });

  const handleTileClick = (sender) => {
    console.log("Current sender: ", sender);
    switch(sender) {
      case 'FindEvents': navigate(routes.findEvents); break;
      case 'Search': navigate(routes.search); break;
      case 'Events': navigate(routes.events); break;
      case 'Groups': navigate(routes.groups); break;
      case 'Calendar': navigate(routes.calendar); break;
      case 'Messages': navigate(routes.messages); break;
      default: break;
    }
  }

  const successCallback = (position) => {
    console.log(position);
  };
  
  const errorCallback = (error) => {
    console.log(error);
  };
  
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  

  if(isMobile)
  {
    return (
      <div className={styles['dashboard-wrap']}>
        <div className={styles['thumbnail-tile']}>
          <div className={styles['thumbnail-content']} onClick={() => handleTileClick("FindEvents")}/>
          <div className={`${styles['dashboard-tile']} ${styles['no-top-margin']}`} style={{width:"100%"}} onClick={() => handleTileClick("FindEvents")}>
            <div className={styles['dashboard-tile-icon']}><EnvironmentOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Find Events</div>
          </div>
        </div>
          <div className={styles['dashboard-tile']} onClick={() => handleTileClick("Search")}>
            <div className={styles['dashboard-tile-icon']}><SearchOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Search</div>
          </div>
          <div className={styles['dashboard-tile']} onClick={() => handleTileClick("Events")}>
            <div className={styles['dashboard-tile-icon']}><NotificationOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Events</div>
          </div>
          <div className={styles['dashboard-tile']} onClick={() => handleTileClick("Groups")}>
            <div className={styles['dashboard-tile-icon']}><TeamOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Groups</div>
          </div>
          <div className={styles['dashboard-tile']} onClick={() => handleTileClick("Calendar")}>
            <div className={styles['dashboard-tile-icon']}><CalendarOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Calendar</div>
          </div>
          <div className={styles['dashboard-tile']} onClick={() => handleTileClick("Messages")}>
            <div className={styles['dashboard-tile-icon']}><CommentOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Messages</div>
          </div>
        </div>
    );
  }
  else
  {
    return(
      <div className={styles['dashboard-wrap']}>
        <div className={styles['thumbnail-tile']}>
          <div className={styles['thumbnail-content']} onClick={() => handleTileClick("FindEvents")}/>
          <div className={`${styles['dashboard-tile']} ${styles['no-top-margin']}`} style={{width:"100%"}} onClick={() => handleTileClick("FindEvents")}>
            <div className={styles['dashboard-tile-icon']}><EnvironmentOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Find Events</div>
          </div>
        </div>

        <div className={styles['dashboard-tile']} style={{width:"100%"}} onClick={() => handleTileClick("Search")}>
            <div className={styles['dashboard-tile-icon']}><SearchOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Search</div>
          </div>

        <div style={{display:"flex"}}>
          <div className={styles['dashboard-tile']} style={{width:"50%", marginRight:"5px"}} onClick={() => handleTileClick("Events")}>
            <div className={styles['dashboard-tile-icon']}><NotificationOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Events</div>
          </div>
          <div className={styles['dashboard-tile']} style={{width:"50%", marginLeft:"5px"}} onClick={() => handleTileClick("Groups")}>
            <div className={styles['dashboard-tile-icon']}><TeamOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Groups</div>
          </div>
        </div>

        <div style={{display:"flex"}}>
          <div className={styles['dashboard-tile']} style={{width:"50%", marginRight:"5px"}} onClick={() => handleTileClick("Calendar")}>
            <div className={styles['dashboard-tile-icon']}><CalendarOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Calendar</div>
          </div>
          <div className={styles['dashboard-tile']} style={{width:"50%", marginLeft:"5px"}} onClick={() => handleTileClick("Messages")}>
            <div className={styles['dashboard-tile-icon']}><CommentOutlined/></div>
            <div className={styles['dashboard-tile-text']}>Messages</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;