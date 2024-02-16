import {
    ArrowLeftOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    LeftOutlined,
    RightOutlined} from '@ant-design/icons';
  import { useNavigate } from "react-router-dom"
  import React, { useState, useContext, useEffect } from 'react';
  import { AccountContext } from '../components/Account';
  import GroupTile from '../components/GroupTile.js';
  import styles from './Groups.module.css';
  import routes from '../constants/Routes.js';
  import Axios from 'axios';
  import loading from '../assets/loading.gif';

  function Groups() {
    const { getSession } = useContext(AccountContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const queryParameters = new URLSearchParams(window.location.search)
    const tab = queryParameters.get("tab");
    const page = queryParameters.get("page");

    const [width, setWidth] = useState(window.innerWidth);
    const isMobile = width <= 764;

    const HandleWindowSizeChange = () =>
    {
      setWidth(window.innerWidth);
    }

    useEffect(() => {
      window.addEventListener('resize', HandleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', HandleWindowSizeChange);
      }
    }, []);

    useEffect(() => {
      getSession()
        .then((session) => {
            console.log("Session: ", session);
            setEmail(session.idToken.payload.email);
            grabPrivGroups(session.idToken.payload.email);
        })
        .catch((err) => {
            console.error("Session error: ", err);
            navigate(routes.login);
        })
    }, []);

    const [groupData, setGroupData] = useState([]);
    const [privateGroupData, setPrivateGroupData] = useState([]);
    const [currentTab, setCurrentTab] = useState((tab === "Public Groups") ? tab : "My Groups");
    const [currentPage, setCurrentPage] = useState(Number(page) ? Number(page) : 1);
    const [privLoaded, setPrivLoaded] = useState(false);
    const [pubLoaded, setPubLoaded] = useState(false);
    const [showState, setShowState] = useState({val: isMobile ? 5 : 8});

    // This fetches priv events (used on initial render)
    const grabPrivGroups = (email) => {
      let data = [];
      if(!privLoaded)
      {
      Axios.post('/api/grabPrivGroups', {
        email: email,
      })
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            data.push({
              id: response.data.at(i).Item.id,
              Title: response.data.at(i).Item.title,
              Description: response.data.at(i).Item.desc,
              Roster: response.data.at(i).Item.roster,
              Owner: response.data.at(i).Item.owner,
              Activities: response.data.at(i).Item.activities,
            });
          };
          setGroupData(data);
          setPrivateGroupData(data);
          setPrivLoaded(true);
        }).catch((e) => {
          console.error(e);
        });
      }
      else
      {
        setGroupData(privateGroupData);
      }
    }

    useEffect(() => {
      updateGroupList(currentTab);
    }, [privLoaded]);

    const updateGroupList = (selectedTab) => {
      let data = [];
      if(selectedTab === "My Groups")
        grabPrivGroups(email);
      else if(selectedTab === "Public Groups") { // query events that dont belong to session owner
        Axios.post('/api/grabPubGroups')
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            data.push({
              id: response.data.at(i).id,
              Title: response.data.at(i).title,
              Activities: response.data.at(i).activities,
              Description: response.data.at(i).desc,
              Roster: response.data.at(i).roster,
              Owner: response.data.at(i).owner,
            });
          };
          data.sort((idxStart, idxEnd) => { return idxEnd.Date - idxStart.Date;}) // sort by date by default
          data.reverse();
          setGroupData(data);
          setPubLoaded(true);
        }).catch((e) => {
          console.error(e);
        });
      }
    }

    const getCurrentSubList = () => {
      const endIdx = currentPage * showState.val;
      const startIdx = endIdx - showState.val;
      return groupData.slice(startIdx, endIdx);
    }
  
    const handleTabClick = (e) => {
      console.log("Updating Tab: ", e.target.innerText);
      setCurrentTab(e.target.innerText);
      updateGroupList(e.target.innerText);
      setCurrentPage(1);
      window.history.replaceState("", "", "/groups?tab=" + e.target.innerText + "&page=1");
    }

    const hasJoined = (groupID) => {
      for (let idx in privateGroupData) {
        if (privateGroupData[idx].id === groupID) return true;
      }
      return false;
    }
  
    return (
      <div className={styles['groups-wrap']}>
        <div className={styles['page-return']} onClick={()=>{navigate(routes.dashboard)}}>
          <ArrowLeftOutlined className={styles['back-btn']}/>
          <div className={styles['page-return-text']}>My Dashboard</div>
        </div>
        <div className={styles['groups-content']}>
          <div className={styles['filter-wrap']}>
            <div className={styles['filter-top']}>
            <div 
                className={`${currentTab === "My Groups" ? 
                              styles['filter-toggle-on'] : 
                              styles['filter-toggle-off']} ${styles['curved-border-right']}`}
                onClick={handleTabClick}>
                My Groups
              </div>
              <div 
                className={`${currentTab === "Public Groups" ? 
                              styles['filter-toggle-on'] : 
                              styles['filter-toggle-off']} ${styles['curved-border-left']}`}
                onClick={handleTabClick}>
                  Public Groups
              </div>      
            </div>
            
          </div>
          <div className={styles['groups-grid']}>
          {getCurrentSubList().map(function(val, idx){
            return (
              <div key={val.id + privLoaded} className={styles['tile-wrap']}>
                <div className={(idx !== 0 && isMobile) ? styles['tile-divider'] : ""}></div>
                <GroupTile 
                  isOpen={!isMobile}
                  id={val.id} 
                  title={val.Title} 
                  owner={val.Owner} 
                  activities={val.Activities}
                  description={val.Description}
                  roster={val.Roster}
                  email={email}
                  hasJoined={hasJoined(val.id)}/>
              </div> 
            )
          })}
          </div>
          {
            currentTab === "My Groups" ?
              (privLoaded ?
                groupData.length === 0 &&
                <div className={styles['no-groups']}>
                  Nothing to see here
                  <div style={{fontSize:"30px"}}>Go make some friends!</div>
                </div>
              :
              <div className={styles['no-groups']}>
                <img src={loading} alt="Loading icon" style={{alignSelf:"center"}}/>
              </div>
              )
            :
              null
          }
          {
            currentTab === "Public Groups" ?
              (pubLoaded ?
                groupData.length === 0 &&
                <div className={styles['no-groups']}>
                  Nothing to see here
                  <div style={{fontSize:"30px"}}>Where is everyone?</div>
                </div>
              :
              <div className={styles['no-groups']}>
                <img src={loading} alt="Loading icon" style={{alignSelf:"center"}}/>
              </div>
              )
            :
              null
          }
          <div className={styles['bottom-nav-bar']}>
            { currentPage > 1 ?
              <DoubleLeftOutlined className={styles['nav-bar-item']} onClick={() => {setCurrentPage(1); window.history.replaceState("", "", "/groups?tab=" + currentTab + "&page=1");}}/>
            :
              <div className={styles['nav-bar-item-empty']}></div>
            }
            { currentPage > 1 ?
              <LeftOutlined className={styles['nav-bar-item']} onClick={() => {setCurrentPage(currentPage-1); window.history.replaceState("", "", "/groups?tab=" + currentTab + "&page=" + Number(currentPage-1));}}/>
            : 
              <div className={styles['nav-bar-item-empty']}></div>
            }
            <div className={styles['page-num']}>{currentPage}</div>
            { currentPage < Math.ceil(groupData.length/showState.val) ? 
              <RightOutlined className={styles['nav-bar-item']} onClick={() => {setCurrentPage(currentPage+1); window.history.replaceState("", "", "/groups?tab=" + currentTab + "&page=" + Number(currentPage+1));}}/>
            :
              <div className={styles['nav-bar-item-empty']}></div>
            }
            { currentPage < Math.ceil(groupData.length/showState.val) ?
              <DoubleRightOutlined className={styles['nav-bar-item']} onClick={() => {setCurrentPage(Math.ceil(groupData.length/showState.val)); window.history.replaceState("", "", "/groups?tab=" + currentTab + "&page=" + Math.ceil(groupData.length/showState.val));}}/>
            :
              <div className={styles['nav-bar-item-empty']}></div>
            }
          </div>
        </div>
      </div>
    );
  }
  
  export default Groups;