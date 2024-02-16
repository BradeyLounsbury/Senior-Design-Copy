import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import styles from './User.module.css';
import defaultAvatar from '../assets/default-avatar.png';
import autoAnimate from '@formkit/auto-animate';
import Axios from 'axios';
import {ModelessContext} from '../components/ConfirmationModeless';

const User = (props) => {
    let [isOpen, setIsOpen] = useState(false);
    const [viewer, setViewer] = useState(props.viewerID);
    const [user, setUser] = useState(props.userID);
    const parent = useRef(null);
    const navigate = useNavigate();
    const modeless = useContext(ModelessContext);
    const [pfp, setPFP] = useState(defaultAvatar);
    const [bio, setBio] = useState("");
    const [username, setUsername] = useState("");
    const [interests, setInterests] = useState({});

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent]);

    useEffect(() => {
        Axios.post('/api/getProfileByID', {
            id: props.userID,
        }).then((response) => {
            setBio(response.data.bio);
            setInterests(response.data.favorites);
            setUsername(response.data.username);
        }).catch((err) => {
            console.error(err);
        })

        if (props.userID) {
            Axios.post('/api/getPFP', {
                id: props.userID,
            }).then((response) => {
                setPFP(response.data);
            })
        }
    }, []);

    const reveal = () => setIsOpen(!isOpen);

    
    return (
        <div className={styles.tileWrap}>
            <div className={styles.tileHeader} onClick={reveal}>
                <img className={styles.pfp} src={pfp} onError={() => setPFP(defaultAvatar)} onClick={reveal} alt='pfp' />
                <span className={styles.username}>
                    {username}
                </span>
            </div>
            <div ref={parent}>
            {isOpen &&
                <div className={styles.openInnerWrap}>
                    <div className={styles.bioWrap}>
                        <div className={styles.bioTitle}>Bio</div>
                        <div className={styles.bioInfo}>
                            {bio} 
                        </div>
                    </div>
                    <div className={styles.interestsWrap}>
                        <div className={styles.interestsTitle}>Interests</div>
                        <div className={styles.interestsInfo}>
                            { interests && interests.tags.length > 0 ?
                                interests.tags.map(function(val, idx) {return <div key={idx} className={styles.interestTag}> {val} </div>})
                                :
                                <div className={styles.interestsNone}>None</div>
                            }
                        </div>
                    </div>
                    <div className={styles.button} onClick={() => {navigate(`/user/${user}`)}}>View User</div>
                </div>
            }
            </div>
        </div>
    );
}

export default User;