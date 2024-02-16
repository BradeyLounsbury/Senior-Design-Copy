import {
    ArrowLeftOutlined, 
    CaretDownOutlined, 
    CloseOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    LeftOutlined,
    RightOutlined} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import React, { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../components/Account';
import styles from './Search.module.css';
import routes from '../constants/Routes.js';
import Axios from 'axios';
import User from '../components/User.js';
import Event from '../components/Event.js';
import GroupTile from '../components/GroupTile';

function Search() {

    const [width, setWidth] = useState(window.innerWidth);
    const isMobile = width <= 1000;

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

    const { getSession } = useContext(AccountContext);
    const navigate = useNavigate();

    useEffect(() => {
        getSession()
        .then((session) => {
            setViewerEmail(session.idToken.payload.email);
            Axios.post('/api/getProfile', {
                email: session.idToken.payload.email,
            }).then((response) => {
                setViewerID(response.data.userID);
                setViewerEvents(response.data.events);
                setViewerGroups(response.data.groups);
            }).catch((err) => {
                console.error(err);
            })

            Axios.post('/api/searchProfiles', {})
            .then((response) => {
                setUserList(response.data);
            })
            .catch((err) => {
                console.error(err);
            });

            Axios.post('/api/searchEvents', {})
            .then((response) => {
                setEventList(response.data);
            })
            .catch((err) => {
                console.error(err);
            });

            Axios.post('/api/searchGroups', {})
            .then((response) => {
                setGroupList(response.data);
            })
            .catch((err) => {
                console.error(err);
            });
        })
        .catch((err) => {
            console.error("Session error: ", err);
            navigate(routes.login);
        })
    }, []);

    const [viewerEmail, setViewerEmail] = useState("");
    const [viewerEvents, setViewerEvents] = useState([]);
    const [viewerGroups, setViewerGroups] = useState([]);
    const [viewerID, setViewerID] = useState();
    const [userList, setUserList] = useState([]);
    const [eventList, setEventList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [keyword, setKeyword] = useState([]);
    

    const updateSearch = (keyword) => {
        if (keyword === "") {
            setFilteredUsers([]);
            setFilteredEvents([]);
            setFilteredGroups([]);
            return;
        }

        let tempUsers = userList.filter(user => {
            if (user[1]) {
                return user[1].toLowerCase().includes(keyword.toLowerCase());
            } else {
                return false;
            }
        })
        setFilteredUsers(tempUsers);

        let tempEvents = eventList.filter(event => {
            if (event[1]) {
                return event[1].toLowerCase().includes(keyword.toLowerCase());
            } else {
                return false;
            }
        })
        setFilteredEvents(tempEvents);

        let tempGroups = groupList.filter(group => {
            if (group[1]) {
                return group[1].toLowerCase().includes(keyword.toLowerCase());
            } else {
                return false;
            }
        })
        console.log(tempGroups)
        setFilteredGroups(tempGroups);

        setKeyword(keyword);
    };

    if(isMobile) {
        return (
            <div className={styles.pageWrap}>
                <div className={styles.searchWrap}>
                    <input 
                    className={styles.searchBar} 
                    key="search-bar" 
                    placeholder='Search for Users, Events, or Groups' 
                    onChange={(e) => updateSearch(e.target.value)}>
                    </input>
                </div>
                <div className={styles.usersWrap}>
                    <div className={styles.userHeader} hidden={filteredUsers.length > 0 ? false : true}>Users</div>
                    {filteredUsers.slice(0, 5).map(function(val, idx){
                        return (
                        <div key={val[0]} className={styles.userTile}>
                        <User
                        userID={val[0]}
                        viewerID={viewerID}
                        email={viewerEmail}
                        username={val[1]}/>
                        </div> )
                    })}
                </div>
                <div className={styles.eventsWrap}>
                    <div className={styles.eventsHeader} hidden={filteredEvents.length > 0 ? false : true}>Events</div>
                    {filteredEvents.slice(0, 5).map(function(val, idx){
                        return (
                        <div key={val[0]} className={styles.eventTile}>
                        <Event
                        id={val[0]}
                        viewerID={viewerID}
                        email={viewerEmail}
                        title={val[1]}
                        hasJoined={viewerEvents.includes(val[0])}/>
                        </div> )
                    })}
                </div>
                <div className={styles.groupsWrap}>
                    <div className={styles.groupsHeader} hidden={filteredGroups.length > 0 ? false : true}>Groups</div>
                    {filteredGroups.slice(0, 5).map(function(val, idx){
                        return (
                        <div key={val[0]} className={styles.groupTile}>
                        <GroupTile
                        id={val[0]}
                        viewerID={viewerID}
                        email={viewerEmail}
                        title={val[1]}
                        hasJoined={viewerGroups.includes(val[0])}/>
                        </div> )
                    })}
                </div>
            </div>
        );
    } else {
        return (
            <div className={styles.pageWrap}>
                <div className={styles.searchWrap}>
                    <input 
                    className={styles.searchBar} 
                    key="search-bar" 
                    placeholder='Search for Users, Events, or Groups' 
                    onChange={(e) => updateSearch(e.target.value)}>
                    </input>
                </div>
                <div className={styles.contentWrap}>
                    <div className={styles.usersWrap}>
                        <div className={styles.userHeader} hidden={filteredUsers.length > 0 ? false : true}>Users</div>
                        {filteredUsers.slice(0, 5).map(function(val, idx){
                            return (
                            <div key={val[0]} className={styles.userTile}>
                            <User
                            userID={val[0]}
                            viewerID={viewerID}
                            email={viewerEmail}
                            username={val[1]}/>
                            </div> )
                        })}
                    </div>
                    <div className={styles.eventsWrap}>
                        <div className={styles.eventsHeader} hidden={filteredEvents.length > 0 ? false : true}>Events</div>
                        {filteredEvents.slice(0, 5).map(function(val, idx){
                            return (
                            <div key={val[0]} className={styles.eventTile}>
                            <Event
                            id={val[0]}
                            viewerID={viewerID}
                            email={viewerEmail}
                            title={val[1]}
                            hasJoined={viewerEvents.includes(val[0])}/>
                            </div> )
                        })}
                    </div>
                    <div className={styles.groupsWrap}>
                        <div className={styles.groupsHeader} hidden={filteredGroups.length > 0 ? false : true}>Groups</div>
                        {filteredGroups.slice(0, 5).map(function(val, idx){
                            return (
                            <div key={val[0]} className={styles.groupTile}>
                            <GroupTile
                            id={val[0]}
                            viewerID={viewerID}
                            email={viewerEmail}
                            title={val[1]}
                            hasJoined={viewerGroups.includes(val[0])}/>
                            </div> )
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default Search;