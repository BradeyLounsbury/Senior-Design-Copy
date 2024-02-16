import Axios from 'axios';
import styles from './ChatsList.module.css';
import React, { useCallback, useEffect, useState, useContext, useRef } from 'react';
import { AccountContext } from '../components/Account';
import { Routes, Route, useParams, useNavigate} from 'react-router-dom';
import routes from '../constants/Routes';
import defaultAvatar from '../assets/default-avatar.png';

function ChatsListTile(props)
{
    const { getSession } = useContext(AccountContext);
    const navigate = useNavigate();
    const [pfp, setPFP] = useState(defaultAvatar);

    useEffect(() => {
        getSession()
        .then((session) => {
            console.log("Session: ", session);
            Axios.post("/api/getPFP", {
                id: props.senderID,
            }).then((response) => {
                setPFP(response.data);
            })
        })
        .catch((err) => {
            console.error("Session error: ", err);
            navigate(routes.login);
        })
    }, []);
    const handleOnClick = (senderID) => {
            navigate('/messages/'+senderID);
        };

    return(
        <div className={styles.chatsListEntry} onClick={() => handleOnClick(props.senderID)}>
            <div className={styles.nameAndPicture}>
                <img className={styles.profilePicture} src={pfp} onError={() => setPFP(defaultAvatar)} alt="User PFP"/>
                <span className={styles.username}>{props.name}</span>
            </div>
            {props.read ? null : <div className={styles.unread} />}
        </div>
    );
}


function ChatsList(props)
{
    let [chatsList, setChatsList] = useState([]);

    const { getSession } = useContext(AccountContext);
    const userID = useRef("");

    useEffect(() => {
        getSession()
            .then((session) => {
                userID.current = session.idToken.payload.email;

                Axios.post("/chat/getchatslist", {
                    user: userID.current
                }).then(
                    (response) => {
                        console.log(response.data);
                        setChatsList(response.data);
                    }
                )
                .catch((err) => {
                    //console.log(err);
                });
            })
            .catch((err) => {
                console.error("Session error: ", err);
            });
    }, []);

    return (
        <div className={styles.pageWrap}>
            <div style={{textAlign:'center', fontWeight:'700', borderBottom:'2px solid', paddingBottom:'7px'}}>Messages</div>
            {chatsList ? chatsList.map((entry, i) => (
                <ChatsListTile name={entry.sender} read={entry.read} chatID={entry.chatID} senderID={entry.senderID} key={entry.senderID}/>
            )) : null}
            {chatsList.length == 0 &&
                <div className={styles['no-messages']}>
                    You haven't messaged anyone
                    <div style={{fontSize:"30px"}}>When you do, they'll show up here</div>
                </div>
            }
        </div>
    );
}

export default ChatsList;