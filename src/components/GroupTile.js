import React, { useState, useRef, useEffect, useContext } from 'react';
import { UserOutlined, TeamOutlined, CaretDownOutlined, InfoCircleOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useNavigate } from "react-router-dom";

import styles from './GroupTile.module.css';
import defaultAvatar from '../assets/default-avatar.png';
import autoAnimate from '@formkit/auto-animate';
import Axios from 'axios';
import {ModelessContext} from '../components/ConfirmationModeless';

const GroupTile = (props) => {
    let [isOpen, setIsOpen] = useState(props.isOpen);
    const [owner, setOwner] = useState(props.owner);
    const [isOwner, setIsOwner] = useState(false);
    const [hasJoined, setHasJoined] = useState(props.hasJoined);
    const parent = useRef(null);
    const navigate = useNavigate();
    const modeless = useContext(ModelessContext);
    const [ownerPic, setOwnerPic] = useState(defaultAvatar);
    const [title, setTitle] = useState("");
    const [about, setAbout] = useState("");
    const [roster, setRoster] = useState({});
    const [activities, setActivities] = useState({tags: {}});

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    useEffect(() => {
        setHasJoined(props.hasJoined);
        if (props.id) {
            Axios.post('/api/getGroup', {
                groupID: props.id,
            }).then((response) => {
                setTitle(response.data.Item.title);
                setAbout(response.data.Item.desc);
                setRoster(response.data.Item.roster);
                setActivities(response.data.Item.activities);
                Axios.post('/api/getPFP', {
                    id: response.data.Item.owner
                }).then((response) =>{
                    setOwnerPic(response.data);
                }).catch((err) => {
                    console.error(err);
                })
            }).catch((err) => {
                console.error(err);
            })
            Axios.post('/api/grabGroupOwner', {
                id: props.id,
            }).then((response) => {
                setOwner(response.data.Items[0].username);
            }).catch((err) => {
                console.error(err);
                setOwner("N/A");
            })
        }
    }, [])

    const reveal = () => setIsOpen(!isOpen);

    const joinGroup = () => { 
        console.log("Joining group. . .");
        Axios.post('/api/requestJoinGroup', {
            email: props.email,
            groupID: props.id,
        }).then((response) => {
            modeless({isVisible: true, success: true, text: "Request sent"});
            console.log(response.data);        
        }).catch((err) => {
            modeless({isVisible: true, success: false, text:"Error sending request"});
            console.error(err);
        });
    }

    const leaveGroup = () => { 
        console.log("Leaving group. . .");
        Axios.post('/api/leaveGroup', {
            email: props.email,
            id: props.id,
        }).then((response) => {
            modeless({isVisible: true, success: true, text: response.data});
            setHasJoined(false);
            console.log(response.data);        
        }).catch((err) => {
            modeless({isVisible: true, success: false, text: "Error leaving group"});
            console.error(err);
        });
    }

    const editGroup = () => {

    }

    return (
        <div className={styles.tileWrap}>
            <div className={styles.tileHeader} onClick={reveal}>
                <img className={styles.groupIcon} src={ownerPic} onError={() => setOwnerPic(defaultAvatar)} alt='uh oh' onClick={reveal}></img>
                <span className={styles.groupName}>
                    {title}
                </span>
                <UserOutlined className={styles.groupMemIcon}/>
                <span className={styles.groupMems}>
                    {roster.length}
                </span>
            </div>
            <div ref={parent}>
            {isOpen &&
                <div className={styles.openInnerWrap}>
                    <div className={styles.aboutWrap}>
                        <div className={styles.aboutTitle}>About Us</div>
                        <div className={styles.aboutInfo}>
                            {about} 
                        </div>
                    </div>
                    <div className={styles.leaderWrap}>
                        <div className={styles.leaderTitle}>Team Leader</div>
                        <div className={styles.leaderInfo}>
                            {owner}
                        </div>
                    </div>
                    <div className={styles.activitiesWrap}>
                        <div className={styles.activitiesTitle}>Activities</div>
                        <div className={styles.activitiesInfo}>
                            { activities.tags.length > 0 ?
                                activities.tags.map(function(val, idx) {return <div key={idx} className={styles.activityTag}> {val} </div>})
                                :
                                <div className={styles.activitiesNone}>None</div>
                            }
                        </div>
                    </div>
                    <div className={styles.buttons}>
                        <div className={styles.moreInfo} onClick={() => {navigate(`/group/${props.id}`, {state: {props: props, hasJoined: hasJoined, isOwner: isOwner, owner: owner}})}}>More Info</div>
                        {   hasJoined && !isOwner && 
                            <div className={styles.leave} onClick={leaveGroup}>Leave</div>
                        }
                        {   !hasJoined && !isOwner &&
                            <div className={styles.join} onClick={joinGroup}>Request To Join</div>
                        }
                        {   isOwner &&
                            <div className={styles.edit} onClick={() => navigate(`/group/${props.id}`, {state: {props: props, hasJoined: hasJoined, isOwner: isOwner, owner: owner, isEditOpen: true}})}>Edit</div>
                        }
                    </div>
                </div>
            }
            </div>
        </div>
    );
}
export default GroupTile;