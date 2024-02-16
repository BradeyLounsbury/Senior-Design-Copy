import {
  ArrowLeftOutlined, 
  CaretDownOutlined, 
  CloseOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined} from '@ant-design/icons';
import { useNavigate, useParams } from "react-router-dom"
import React, { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../components/Account';
import Event from '../components/Event.js';
import styles from './Events.module.css';
import routes from '../constants/Routes.js';
import Axios from 'axios';
import loading from '../assets/loading.gif';
import helpers from '../constants/dataCheckEvents.js';
import { is } from 'date-fns/locale';

function Events() {
  const { getSession } = useContext(AccountContext);
  const navigate = useNavigate();
  
  const queryParameters = new URLSearchParams(window.location.search)
  const tab = queryParameters.get("tab");
  const page = queryParameters.get("page");
  
  const [email, setEmail] = useState("");

  const [width, setWidth] = useState(window.innerWidth);
  const isMobile = width <= 719;

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
          grabPrivEvents(session.idToken.payload.email);
      })
      .catch((err) => {
          console.error("Session error: ", err);
          navigate(routes.login);
      })
  }, []);

  const [eventData, setEventData] = useState([]);
  const [privateEventData, setPrivateEventData] = useState([]);
  const [currentTab, setCurrentTab] = useState((tab === "Public Events" || tab === "Private Events") ? tab : "My Events");
  const [currentPage, setCurrentPage] = useState(Number(page) ? Number(page) : 1);
  const [expandFilter, setExpandFilter] = useState(false);
  const [sortByState, setSortByState] = useState({val: "Date", display: false});
  const [orderState, setOrderState] = useState({val: "Asc", display: false});
  const [showState, setShowState] = useState({val: isMobile ? 5 : 15, display: false});
  const [privLoaded, setPrivLoaded] = useState(false);
  const [pubLoaded, setPubLoaded] = useState(false);
  const [groupLoaded, setGroupLoaded] = useState(false);
  let [isEditOpen, setIsEditOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Edit Event");
  const [groupEvents, setGroupEvents] = useState([]);

  // This fetches priv events (used on initial render)
  const grabPrivEvents = (email) => {
    let data = [];
    if(!privLoaded)
    {
      Axios.post('/api/grabPrivEvents', {
        email: email,
      })
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          if (!helpers.isOutdated(response.data.at(i).Item.date)){
            data.push({
              id: response.data.at(i).Item.id,
              Title: response.data.at(i).Item.title,
              Date: response.data.at(i).Item.date,
              Description: response.data.at(i).Item.desc,
              Participants: response.data.at(i).Item.participants,
              Slots: response.data.at(i).Item.totalSlots,
              Location: response.data.at(i).Item.location,
              Owner: response.data.at(i).Item.owner,
              startTime: response.data.at(i).Item.startTime,
              endTime: response.data.at(i).Item.endTime,
              accessType: response.data.at(i).Item.accessType,
              group: response.data.at(i).Item.group
            });
          }
        };
        data.sort((idxStart, idxEnd) => { return helpers.getDate(idxStart.Date) - helpers.getDate(idxEnd.Date)}) // sort by date by default
        console.log(data);
        setEventData(data);
        setPrivateEventData(data);
        setPrivLoaded(true);
      }).catch((e) => {
        console.error(e);
      });
    }
    else
    {
      setEventData(privateEventData);
    }
  };

  useEffect(() => {
    updateEventList(currentTab);
  }, [privLoaded]);

  const updateEventList = (selectedTab) => {
    let data = [];

    if(selectedTab === "My Events")
      grabPrivEvents(email);
    else if(selectedTab === "Public Events"){ // query events that dont belong to session owner
      Axios.post('/api/grabPubEvents')
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          if (!helpers.isOutdated(response.data.at(i).date)){
            data.push({
              id: response.data.at(i).id,
              Title: response.data.at(i).title,
              Date: response.data.at(i).date,
              Description: response.data.at(i).desc,
              Participants: response.data.at(i).participants,
              Slots: response.data.at(i).totalSlots,
              Location: response.data.at(i).location,
              Owner: response.data.at(i).owner,
              startTime: response.data.at(i).startTime,
              endTime: response.data.at(i).endTime,
              accessType: response.data.at(i).accessType,
              group: response.data.at(i).group
            });
          }
        };
        data.sort((idxStart, idxEnd) => { return helpers.getDate(idxStart.Date) - helpers.getDate(idxEnd.Date)}) // sort by date by default
        console.log(data);
        setEventData(data);
        setPubLoaded(true);
      }).catch((e) => {
        console.error(e);
      });
    }
    else if(selectedTab == "Private Events")
    {
      Axios.post('/api/getGroupEvents', {email: email})
      .then((response) => {
        console.log(response.data);
        for (let i = 0; i < response.data.length; i++) {
          if (!helpers.isOutdated(response.data.at(i).date)){
            data.push({
              id: response.data.at(i).id,
              Title: response.data.at(i).title,
              Date: response.data.at(i).date,
              Description: response.data.at(i).desc,
              Participants: response.data.at(i).participants,
              Slots: response.data.at(i).totalSlots,
              Location: response.data.at(i).location,
              Owner: response.data.at(i).owner,
              startTime: response.data.at(i).startTime,
              endTime: response.data.at(i).endTime,
              accessType: response.data.at(i).accessType,
              group: response.data.at(i).group
            });
          }
        };
        data.sort((idxStart, idxEnd) => { return helpers.getDate(idxStart.Date) - helpers.getDate(idxEnd.Date)}) // sort by date by default
        console.log(data);
        setEventData(data);
        setGroupLoaded(true);
      }).catch((e) => {
        console.error(e);
      });
    }
  }

  const getCurrentSubList = () => {
    const endIdx = currentPage * showState.val;
    const startIdx = endIdx - showState.val;
    return eventData.slice(startIdx, endIdx);
  }

  const handleTabClick = (e) => {
    console.log("Updating Tab: ", e.target.innerText);
    setCurrentTab(e.target.innerText)
    updateEventList(e.target.innerText);
    setCurrentPage(1);
    window.history.replaceState("", "", "/events?tab=" + e.target.innerText + "&page=1");
  }

  const handleFilterDrop = (sender) => {
    console.log("Expanding Filter: ", sender);
    switch(sender) {
      case 'Sort By': 
        setSortByState({val: sortByState.val, display: !sortByState.display}); 
        setOrderState({val: orderState.val, display: false});
        setShowState({val: showState.val, display: false});
        break;
      case 'Order': 
        setSortByState({val: sortByState.val, display: false}); 
        setOrderState({val: orderState.val, display: !orderState.display});
        setShowState({val: showState.val, display: false});
        break;
      case 'Show' : 
        setSortByState({val: sortByState.val, display: false}); 
        setOrderState({val: orderState.val, display: false});
        setShowState({val: showState.val, display: !showState.display});
        break;
      default: break;
    }
  }

  const handleSort = (sortBy, order) => {
    console.log("Sorting list: ", sortBy, order);
  
    console.log(eventData);
    let data = eventData.slice();
    if (sortBy === "Date") data.sort((idxStart, idxEnd) => {return helpers.getDate(idxStart.Date) - helpers.getDate(idxEnd.Date)})
    else if (sortBy === "Size") data.sort((idxStart, idxEnd) => { return idxStart.Slots - idxEnd.Slots;})
    else if (sortBy === "Name") data.sort((idxStart, idxEnd) => { return idxStart.Title.localeCompare(idxEnd.Title);})

    if (order === "Desc") data.reverse();
    setEventData(data);
  }

  const handleSortBySelect = (e) => {
    console.log("Updating Filter: ", e.target.innerText);
    setSortByState({val: e.target.innerText, display: sortByState.display});
    handleSort(e.target.innerText, orderState.val);
  }

  const handleOrderSelect = (e) => {
    console.log("Updating Filter: ", e.target.innerText);
    setOrderState({val: e.target.innerText, display: orderState.display});
    handleSort(sortByState.val, e.target.innerText);
  }

  const handleShowSelect = (e) => {
    setShowState({val: e.target.innerText, display: showState.display});
  }

  const hasJoined = (eventID) => {
    for (let idx in privateEventData) {
      if (privateEventData[idx].id === eventID) return true;
    }
    return false;
  }

  const childToParent = (bool) => {
    setIsEditOpen(true);
    isEditOpen = true;
    console.log(isEditOpen + " " + bool);
  }

  const submitEdit = () => {

  }

  return (
    <div className={styles['events-wrap']}>
      <div className={styles['page-return']} onClick={()=>{navigate(routes.dashboard)}}>
        <ArrowLeftOutlined className={styles['back-btn']}/>
        <div className={styles['page-return-text']}>My Dashboard</div>
      </div>
      <div className={styles['events-content']}>
        <div className={styles['filter-wrap']}>
          <div className={styles['filter-top']}>
            <div 
              className={`${currentTab === "My Events" ? 
                            styles['filter-toggle-on'] : 
                            styles['filter-toggle-off']} ${styles['curved-border-right']}`}
              onClick={handleTabClick}>
              My Events
            </div>
            <div 
              className={`${currentTab === "Public Events" ? 
                            styles['filter-toggle-on'] : 
                            styles['filter-toggle-off']} ${styles['curved-border-left']}`}
              onClick={handleTabClick}>
                Public Events
            </div>
            <div 
              className={`${currentTab === "Private Events" ? 
                            styles['filter-toggle-on'] : 
                            styles['filter-toggle-off']} ${styles['curved-border-left']}`}
              onClick={handleTabClick}>
                Private Events
            </div>
            <div className={styles['filter-drop']} 
              onClick={()=>{
                setExpandFilter(!expandFilter);
                setSortByState({val: sortByState.val, display: false}); 
                setOrderState({val: orderState.val, display: false});
                setShowState({val: showState.val, display: false});
                }}>
              Filter
              {!expandFilter ? 
              <CaretDownOutlined className={styles['filter-drop-icon']}/>
              :
              <CloseOutlined className={styles['filter-drop-icon']}/>
              }
            </div>
          </div>
          {/* Filter */}
          { expandFilter ?
          <div className={styles['filter-expanded']}>
            <div className={styles['filter-option']}>
              Sort By
              <div className={styles['dropdown-option-wrap']}>
                <div className={styles['dropdown-selected']} onClick={()=>{handleFilterDrop("Sort By")}}>
                  {sortByState.val}
                  <CaretDownOutlined className={styles['selected-icon']}/>
                </div>
                <div className={`${!sortByState.display ? styles['is-hidden'] : "" }`}>
                  <div className={styles['dropdown-item']} onClick={handleSortBySelect}>Date</div>
                  <div className={styles['dropdown-item']} onClick={handleSortBySelect}>Size</div>
                  <div className={styles['dropdown-item']} onClick={handleSortBySelect}>Name</div>
                </div>
              </div>
            </div>
            <div className={styles['filter-option']}>
              Order
              <div className={styles['dropdown-option-wrap']}>
                <div className={styles['dropdown-selected']} onClick={()=>{handleFilterDrop("Order")}}>
                  {orderState.val}
                  <CaretDownOutlined className={styles['selected-icon']}/>
                </div>
                <div className={`${!orderState.display ? styles['is-hidden'] : "" }`}>
                  <div className={styles['dropdown-item']} onClick={handleOrderSelect}>Desc</div>
                  <div className={styles['dropdown-item']} onClick={handleOrderSelect}>Asc</div>
                </div>
              </div>
            </div>
            <div className={styles['filter-option']}>
              Show
              <div className={styles['dropdown-option-wrap']}>
                <div className={styles['dropdown-selected']} onClick={()=>{handleFilterDrop("Show")}}>
                  {`${showState.val}`}
                  <CaretDownOutlined className={styles['selected-icon']}/>
                </div>
                <div className={`${!showState.display ? styles['is-hidden'] : "" }`}>
                  <div className={styles['dropdown-item']} onClick={handleShowSelect}>5</div>
                  <div className={styles['dropdown-item']} onClick={handleShowSelect}>10</div>
                  <div className={styles['dropdown-item']} onClick={handleShowSelect}>25</div>
                </div>
              </div>
            </div>
          </div>
          : <></>}
        </div>
        {/* Events */}
        <div className={styles['events-grid']}>
        {getCurrentSubList().map(function(val, idx){
          return (
            <div key={val.id + privLoaded} className={styles['tile-wrap']}>
              <div className={(idx !== 0 && isMobile) ? styles['tile-divider'] : ""}></div>
              <Event
                id={val.id} 
                title={val.Title} 
                owner={val.Owner} 
                location={val.Location}
                date={val.Date}
                description={val.Description}
                participants={val.Participants}
                totalSlots={val.Slots}
                startTime={val.startTime}
                endTime={val.endTime}
                accessType={val.accessType}
                email={email}
                hasJoined={hasJoined(val.id)}
                group={val.group}/>
            </div> 
            
          )
        })}
        </div>
        {
          currentTab === "My Events" ?
            (privLoaded ?
              getCurrentSubList().length === 0 &&
              <div className={styles['no-events']}>
                Nothing to see here
                <div style={{fontSize:"30px"}}>Go join some events!</div>
              </div>
            :
            <div className={styles['no-events']}>
              <img src={loading} alt="Loading icon" style={{alignSelf:"center"}}/>
            </div>
            )
          :
            null
        }
        {
          currentTab === "Public Events" ?
            (pubLoaded ?
              getCurrentSubList().length === 0 &&
              <div className={styles['no-events']}>
                Nothing to see here
                <div style={{fontSize:"30px"}}>Maybe you should make one!</div>
              </div>
            :
            <div className={styles['no-events']}>
              <img src={loading} alt="Loading icon" style={{alignSelf:"center"}}/>
            </div>
            )
          :
            null
        }
        {
          currentTab === "Private Events" ?
            (groupLoaded ?
              getCurrentSubList().length === 0 &&
              <div className={styles['no-events']}>
                Nothing to see here
                <div style={{fontSize:"30px"}}>No groups or just no events?</div>
              </div>
            :
            <div className={styles['no-events']}>
              <img src={loading} alt="Loading icon" style={{alignSelf:"center"}}/>
            </div>
            )
          :
            null
        }
        {/* Page Change */}
        <div className={styles['bottom-nav-bar']}>
          { currentPage > 1 ?
            <DoubleLeftOutlined className={styles['nav-bar-item']} onClick={() => {setCurrentPage(1); window.history.replaceState("", "", "/events?tab=" + currentTab + "&page=1");}}/>
          :
            <div className={styles['nav-bar-item-empty']}></div>
          }
          { currentPage > 1 ?
            <LeftOutlined className={styles['nav-bar-item']} onClick={() => {setCurrentPage(currentPage-1); window.history.replaceState("", "", "/events?tab=" + currentTab + "&page=" + Number(currentPage-1));}}/>
          : 
            <div className={styles['nav-bar-item-empty']}></div>
          }
          <div className={styles['page-num']}>{currentPage}</div>
          { currentPage < Math.ceil(eventData.length/showState.val) ? 
            <RightOutlined className={styles['nav-bar-item']} onClick={() => {setCurrentPage(currentPage+1); window.history.replaceState("", "", "/events?tab=" + currentTab + "&page=" + Number(currentPage+1));}}/>
          :
            <div className={styles['nav-bar-item-empty']}></div>
          }
          { currentPage < Math.ceil(eventData.length/showState.val) ?
            <DoubleRightOutlined className={styles['nav-bar-item']} onClick={() => {setCurrentPage(Math.ceil(eventData.length/showState.val)); window.history.replaceState("", "", "/events?tab=" + currentTab + "&page=" + Math.ceil(eventData.length/showState.val));}}/>
          :
            <div className={styles['nav-bar-item-empty']}></div>
          }
        </div>
      </div>
    </div>
  );
}

export default Events;