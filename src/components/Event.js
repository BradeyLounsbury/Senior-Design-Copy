import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
    TeamOutlined, 
    CaretDownOutlined, 
    InfoCircleOutlined, 
    EnvironmentOutlined, 
    ClockCircleOutlined,
    LockOutlined } from '@ant-design/icons'
import { useNavigate } from "react-router-dom";
import CustomModal from './CustomModal';
import styles from './Event.module.css';
import autoAnimate from '@formkit/auto-animate';
import Axios from 'axios';
import {ModelessContext} from '../components/ConfirmationModeless';
import defaultBanner from '../assets/tennis-court.jpg';

const Event = (props) => {
    let [isOpen, setIsOpen] = useState(props.isOpen);
    const [owner, setOwner] = useState(props.Owner);
    const [isOwner, setIsOwner] = useState(false);
    const [hasJoined, setHasJoined] = useState(props.hasJoined);
    const [totalSlots, setTotalSlots] = useState(props.totalSlots ? props.totalSlots : 0);
    const [totalParticipants, setTotalParticipants] = useState({});
    const parent = useRef(null);
    const navigate = useNavigate();
    const modeless = useContext(ModelessContext);
    const [banner, setBanner] = useState(defaultBanner);
    const [group, setGroup] = useState("");
    const [userID, setUserID] = useState();
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [accessType, setAccessType] = useState("");
    

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    useEffect(() => {
        setHasJoined(props.hasJoined);
        if (props.participants !== undefined) {
            setTotalParticipants(props.participants);
        }

        if (props.viewerID) {
            setUserID(props.viewerID);
        } else {
            Axios.post('/api/getProfile', {
                email: props.email,
            }).then((response) => {
                setUserID(response.data.userID);
            });
        }

        if (props.id) {
            Axios.post('/api/getEvent', {
                eventID: props.id, 
            }).then((response) => {
                setTitle(response.data.Item.title);
                setLocation(response.data.Item.location);
                setDate(response.data.Item.date);
                setDescription(response.data.Item.desc);
                setTotalParticipants(response.data.Item.participants);
                setTotalSlots(response.data.Item.totalSlots);
                setAccessType(response.data.Item.accessType);
                response.data.Item.owner === props.viewerID ? setIsOwner(true) : setIsOwner(false);
                Axios.post("/api/getGroupName", {groupID: response.data.Item.group})
                .then((response) => {
                    setGroup(response.data);
                })
            }).catch((err) => {
                console.error(err);
            })

            Axios.post('/api/grabEventOwner', {
                id: props.id,
            }).then((response) => {
                setOwner(response.data.Items[0].username);
            }).catch((err) => {
                console.error(err);
                setOwner("N/A");
            })

            Axios.post('/api/getEventBanner', {
                id: props.id,
            }).then((response) => {
                setBanner(response.data);
            }).catch((err) => {
                console.error(err);
            })
        }
        // } else if(props.id)
        // {
        //     Axios.post('/api/grabEventOwner', {
        //         id: props.id,
        //     }).then((response) => {
        //         setOwner(response.data.Items[0].username);
        //     }).catch((err) => {
        //         console.error(err);
        //         setOwner("N/A");
        //     });
        //     Axios.post('/api/isEventOwner', {
        //         id: props.id,
        //         email: props.email,
        //     }).then((response) => {
        //         setIsOwner(response.data);
        //     }).catch((err) => {
        //         console.error(err);
        //     })
        //     Axios.post('/api/getEventBanner', {
        //         id: props.id,
        //     }).then((response) => {
        //         setBanner(response.data);
        //     }).catch((err) => {
        //         console.error(err);
        //     })
        //     Axios.post("/api/getGroupName", {groupID: props.group})
        //     .then((response) => {
        //         setGroup(response.data);
        //     })
        // }
    }, [])

    const reveal = () => setIsOpen(!isOpen);

    const joinEvent = () => { 
        console.log("Joining event. . .");
        if (totalParticipants.length < totalSlots) {
            Axios.post('/api/joinEvent', {
                email: props.email,
                id: props.id,
            }).then((response) => {
                modeless({isVisible: true, success: true, text: response.data});
                setHasJoined(true);
                let temp = totalParticipants;
                temp.push(userID);
                setTotalParticipants(temp);
                console.log(response.data);
            }).catch((err) => {
                modeless({isVisible: true, success: true, text:"Error joining event"});
                console.error(err);
            });
        }
        else {
            modeless({isVisible: true, success: false, text: "Event is currently full"});
            console.error("Event is currently full");
        }
    }

    const leaveEvent = () => { 
        console.log("Leaving event. . .");
        Axios.post('/api/leaveEvent', {
            email: props.email,
            id: props.id,
        }).then((response) => {
            modeless({isVisible: true, success: true, text: response.data});
            setHasJoined(false);
            let idx = totalParticipants.indexOf(userID);
            let temp = totalParticipants;
            temp.splice(idx, 1);
            setTotalParticipants(temp);
            console.log(response.data);
        }).catch((err) => {
            modeless({isVisible: true, success: false, text:"Error leaving event"});
            console.error(err);
        });
    }

    return (
            <div className={`${styles.tileWrap} ${accessType === "Private" && styles.blueColor}`}>
                <div className={styles.tileImg} onClick={reveal}>
                    <img src={banner} onError={() => setBanner(defaultBanner)} alt='uh oh' className={styles.tileImg}/>
                </div>
                <div ref={parent}>
                {isOpen && 
                    <div className={styles.openInnerWrap}>
                        <div className={styles.hideWrap} onClick={reveal}>
                            <CaretDownOutlined className={styles.caret}></CaretDownOutlined>
                            <div className={styles.caretText}>Hide</div>
                        </div>
                        <div className={styles.locateWrap}>
                            <EnvironmentOutlined className={styles.locateIcon}/>
                            <span className={styles.locateTitle}>Location</span> 
                            <div className={styles.locateInfo}>{location}</div>
                        </div>
                        <div className={styles.dateWrap}>
                            <ClockCircleOutlined className={styles.dateIcon}/>
                            <span className={styles.dateTitle}>Date</span> 
                            <div className={styles.dateInfo}>{date}</div>
                        </div>
                        <div className={styles.descWrap}>
                            <InfoCircleOutlined className={styles.descIcon}/>
                            <span className={styles.descTitle}>Description</span>
                            <div className={styles.descInfo}><p>{description}</p></div>
                        </div>
                        <div className={styles.buttons}>
                            <div className={styles.moreInfo} onClick={() => {props.id && navigate(`/event/${props.id}`)}}>More Info</div>
                            {hasJoined && !isOwner &&
                                <div className={styles.leave} onClick={props.id && leaveEvent}>Leave</div>
                            }
                            {!hasJoined && !isOwner &&
                                <div className={styles.join} onClick={props.id && joinEvent}>Join</div>
                            }
                            {isOwner &&
                                <div className={styles.edit} onClick={() => navigate(`/event/${props.id}`)}>Edit</div>
                            }
                        </div>
                    </div>
                }
                </div>
                <div className={`${styles.tileTextBlock} ${accessType === "Private" && styles.blueBackgroundColor}`} onClick={reveal}>
                    <div className={styles.tileTitle}>
                        {title}
                    </div>
                    <div className={styles.tileUser}>
                        {accessType === "Private" ? group : owner}
                    </div>
                    <div className={styles.tilePeople}>
                        {totalParticipants.length+"/"+totalSlots}
                    </div>
                    {
                        accessType !== "Private" ?
                        <TeamOutlined className={styles.tileIcon}/>
                        :
                        <LockOutlined className={styles.tileIcon}/>
                    }
                    
                </div>
                
            </div>
    );
}
export default Event;