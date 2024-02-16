import {
    MenuOutlined, 
    CloseOutlined, 
    UserOutlined, 
    CalendarOutlined, 
    TeamOutlined, 
    LogoutOutlined, 
    CaretDownOutlined,
    PlusOutlined,
    RightOutlined,
    BellOutlined,
    BellFilled,
    DashboardOutlined} from '@ant-design/icons';
import React, { useEffect, useState, useContext, useRef } from 'react'
import styles from './Header.module.css';
import routes from '../constants/Routes';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import Pool from "../UserPool.js";
import { AccountContext } from '../components/Account';

const Header = (props) =>
{
    const RemoveNotif = (index) =>
    {
        Axios.post('/user/deleteNotification', {
            userID: userID.current, 
            notif: notifs.notifs[index]
        })
        .then((response) => {
        })
        .catch((err) => {})

        let newNotifs = Object.assign({}, notifs);
            newNotifs.notifs.splice(index, 1);
            setNotifs(newNotifs);
    }

    const Notification = (props) =>
    {
        const messageClick = () =>
        {
            //Do thing to delete notifcation on backend
            navigate("/messages/" + userID.current + "/" + props.notif.sender);
            RemoveNotif(props.index)
            resetState();
        }

        const groupRequestClick = () => {
            navigate("/group/" + props.notif.groupID);
            RemoveNotif(props.index);
            resetState();
        }

        if(props.notif.type === "message")
        {
            return (
                <div className={styles["notification-item"]}
                        onClick={() => {messageClick(); resetState();}}>
                    {"New message from " + props.notif.sender}
                    <CloseOutlined onClick={() => RemoveNotif(props.index)}/>
                </div>
            );
        }
        else if(props.notif.type === "group-request-decision")
        {
            return (
                <div className={styles["notification-item"]}>
                    {(props.notif.accept ?
                        "You were accepted into " : "You were not accepted into ")
                        + props.notif.group}
                    <CloseOutlined onClick={() => RemoveNotif(props.index)}/>
                </div>
            );
        }
        else if(props.notif.type === "group-request")
        {
            return (
                <div onClick={() => groupRequestClick()} className={styles["notification-item"]}>
                    {"New join requests in " + props.notif.group}
                    <CloseOutlined onClick={() => RemoveNotif(props.index)}/>
                </div>
            )
        }
        else if(props.notif.type === "no-notifications")
        {
            return (
                <div className={styles["notification-item"]}>
                    Nothing to see here!
                </div>
            );
        }
    }

    
    let [openState, setOpenState] = useState("closed");
    let [createIsOpen, setCreateIsOpen] = useState(false);
    let [redir, setRedir] = useState(false);
    let [redirLink, setRedirLink] = useState('');
    let [notifs, setNotifs] = useState({seen: true, notifs:[]});

    const navigate = useNavigate();
    const { getSession } = useContext(AccountContext);
    const userID = useRef("");

    function resetState()
    {
        setOpenState("closed");
        setCreateIsOpen(false);
        setRedir(false);
        setRedirLink('');
        //notifs dont need reset
    }

    const RenderList = () =>
    {
        if(openState === "menu")
        {
            if(props.isLoggedIn)
            {
                return (
                    <div>
                        
                        <div className={styles['header-item']} onClick={() => {setRedir(true); setRedirLink(routes.profile)}}>
                            <UserOutlined className={styles['list-item-icon']}/>
                            My Profile
                        </div>
                        <div className={styles['header-item']} onClick={() => setCreateIsOpen(!createIsOpen)}>
                            {createIsOpen ?
                                <CaretDownOutlined className={styles['list-item-icon']}/>
                                : 
                                <PlusOutlined className={styles['list-item-icon']}/>}
                            Create
                        </div>
                        {(createIsOpen && 
                            <>
                                <div className={styles['sub-header-item']} onClick={() => {setRedir(true); setRedirLink(routes.createEvent);}}>
                                    <RightOutlined className={styles['sub-list-item-icon']}/>
                                    New Event
                                </div>
                                <div className={styles['sub-header-item']} onClick={() => {setRedir(true); setRedirLink(routes.createGroup)}}>
                                    <RightOutlined className={styles['sub-list-item-icon']}/>
                                    New Group
                                </div>
                            </>
                        )}
                        <div className={styles['header-item']} onClick={() => {setRedir(true); setRedirLink(routes.dashboard)}}>
                            <DashboardOutlined className={styles['list-item-icon']}/>
                            Dashboard
                        </div>
                        <div className={styles['header-item']} onClick={() => 
                            {
                                const user = Pool.getCurrentUser();
                                if (user) { user.signOut() };
                                setRedir(true);
                                setRedirLink(routes.landing);
                            }}>
                            <LogoutOutlined className={styles['list-item-icon']}/>
                            Logout
                        </div>
                    </div>
                );
            }
            else
            {
                return (
                    <div>
                        <div className={styles['header-item']} >
                        
                            <UserOutlined className={styles['list-item-icon']}  />
                            <a
                        className={styles["header-item"]}
                        style={{ cursor:"pointer" }}
                        href={routes.gettingStarted}>
                            Login / Register 
                        </a>
                        </div>
                        <div className={styles['header-item']}>
                            <span className={styles['list-item-icon']}/>
                            <a
                        className={styles["header-item"]}
                        style={{ cursor:"pointer" }}
                        href={routes.about}>
                            About Us
                            </a>
                        </div>
                        <div className={styles['header-item']}>
                            <span className={styles['list-item-icon']}/>
                            <a
                        className={styles["header-item"]}
                        style={{ cursor:"pointer" }}
                        href={routes.tos}>
                            Terms of Service
                            </a>
                        </div>
                    </div>
                );
            }
        }
        else if(openState === "notifs" && props.isLoggedIn)
        {
            if(!notifs.seen)
            {
                Axios.post('/user/setNotifsSeen', {
                    userID: userID.current, 
                });

                let newNotifs = notifs;
                newNotifs.seen = true;
                setNotifs(newNotifs);
            }

            return (
                <div className={styles['notification-list']}>
                    {notifs.notifs.map((entry, index) => (
                        <Notification notif={entry} index={index} key={index}/>
                    ))}
                    {notifs.notifs.length == 0 && <Notification notif={{type: "no-notifications"}}/>}
                </div>
            );
        }
    }

    useEffect(() => {
        getSession()
        .then((session) => {
            userID.current = session.idToken.payload.email;

            Axios.post("/user/getNotifications", {
                    userID: userID.current
            }).then(
                (response) => {
                    if(response.data.notifs)
                    {
                        response.data.notifs.reverse();
                        setNotifs(response.data);
                    }
                }
            );
        })
        .catch((err) => {
            console.error("Session error: ", err);
        });
    }, []);

    if(redir)
    {
        navigate(redirLink);
        resetState();
    }

    if(props.isLoggedIn && userID.current !== "")
    {
        const config = {
            pushKey:
                "BNdTEmPb_LRfnVoGZAKua_evFCWGAWTuqCQUWaUcM1HNHmuSDZS5Kl5LrpZk2GmxD63CD_5wow8rjObqdOYxZRk",
            appSyncUrl:
                "https://skaitxymavaexeqbrdpu4ceiya.appsync-api.us-east-1.amazonaws.com/graphql",
            appSyncApiKey: "da2-odpgeqgd7vexhfe56ad57bskwu",
        };
        async function subscribe(topic) {
        var swReg = await navigator.serviceWorker.register("/service-worker.js");
        const subscription = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(config.pushKey),
        })
        .then()
        .catch((err) => {
            console.error(err)
        });
        
        fetch(config.appSyncUrl, {
            method: "POST",
            headers: { "x-api-key": config.appSyncApiKey },
            body: JSON.stringify({ query: `mutation($topic: String, $subscription: String) {subscribe(topic: $topic, subscription: $subscription)}`, 
            variables: { topic, subscription: JSON.stringify(subscription) } })
        });
        }
        function urlB64ToUint8Array(base64String) {
            const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, "+")
                .replace(/_/g, "/");
            
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
        subscribe(userID.current);

    }

    var icon;
    if(openState === "menu")
    {
        icon = <CloseOutlined
                onClick={() => setOpenState("closed")}
                style={{margin:'auto 0 auto 16px'}}/>;
    }
    else
    {
        icon = <MenuOutlined
                onClick={() => setOpenState("menu")}
                style={{margin:'auto 0 auto 16px'}}/>;
    }


    if(props.isLoggedIn)
    {
        let bell;
        if(notifs.notifs && notifs.notifs.length > 0)
        {
            bell = <BellFilled
                    onClick={() => setOpenState(openState === "notifs" ? "closed" : "notifs")}
                    style={{margin:'auto 16px auto 0'}}/>;
        }
        else
        {
            bell = <BellOutlined
                    onClick={() => setOpenState(openState === "notifs" ? "closed" : "notifs")}
                    style={{margin:'auto 16px auto 0'}}/>;
        }

        return (
            <>
            <div className={styles['header']}>
                <div className={styles['top-banner']}>
                    {icon}
                    {bell}
                    {notifs.seen === false && <div className={styles['circle']}/>}
                </div>
                {RenderList()}
            </div>
            <div style={{height:'48px'}}/>
            </>
        );
    }
    else
    {
        return (
            <>
            <div className={styles['header']}>
                <div className={styles['top-banner']}>
                    {icon}
                </div>
                {RenderList()}
            </div>
            <div style={{ height: '48px' }} />
            </>
        );
    }
}

export {Header};