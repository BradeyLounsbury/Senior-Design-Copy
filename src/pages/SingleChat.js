import React, { useEffect, useState, useContext, useRef } from "react";
import { AccountContext } from '../components/Account';
import { useParams } from "react-router-dom";
import Axios from 'axios';
import styles from './SingleChat.module.css';
import TextArea from "antd/lib/input/TextArea";
import { useNavigate } from "react-router-dom";
import routes from '../constants/Routes';
import defaultAvatar from '../assets/default-avatar.png';
import { Button } from "antd";
import {SendOutlined} from "@ant-design/icons";

function SingleChat()
{
    const { getSession } = useContext(AccountContext);
    const navigate = useNavigate();

    let chatID = useRef(null);
    let chat = useRef(null);
    let iAm = useRef(null);
    let userEmail = useRef(null);
    let timer = useRef(false);
    let [typedMessage, setTypedMessage] = useState("");
    let [username, setUsername] = useState("");
    let [messages, setMessages] = useState([]);
    const [pfp, setPFP] = useState(defaultAvatar);

    let {user} = useParams();

    useEffect(() => {

        Axios.post("/getUsername", {
            id: user
        })
        .then((response) => {
            setUsername(response.data);
        })
        .catch((err) => {
            setUsername("ERROR");
        });

        Axios.post("/api/getPFP", {
            id: user,
        }).then((response) => {
            setPFP(response.data);
        })

        getSession()
        .then((session) => {
            userEmail.current = session.idToken.payload.email;
            Axios.post("/chat/getchats", {
                user: userEmail.current
            })
            .then((response) => {
                if(response.data[user])
                {
                    chatID.current = response.data[user].chatID;
                    Axios.post("/chat/getChat", {
                        id: chatID.current
                    })
                    .then((response) => {
                        chat.current = response.data;
                        iAm.current = user === chat.current.user1 ? "user2" : "user1";
                        chat.current.messages.reverse(); 
                        console.log(chat.current.messages);
                        setMessages(chat.current.messages);

                        Axios.post("/chat/setChatSeen", {
                            isSeen: true,
                            email: userEmail.current,
                            otherID: user
                        })
                    })
                    .catch((err) => {
                        //console.log(err);
                    })
                }
                else
                {
                    //Idk. chat should only be created when a message is sent
                }
            })
            .catch((err) => {
                //console.log(err);
            })
        })
        .catch((err) => {
            console.error("Session error: ", err);
            navigate(routes.login);
        })

        const interval = setInterval(() => {
                updateMessages();
        }, 3000)

        return () => clearInterval(interval);
    }, []);


    const updateMessages = () => {
        if(chatID.current)
        {
            Axios.post("/chat/getchats", {
                user: userEmail.current
            })
            .then((response) => {
                if(!response.data[user].read)
                {
                    Axios.post("/chat/getChat", {
                        id: chatID.current
                    })
                    .then((response) => {
                        response.data.messages.reverse(); 
                        setMessages(response.data.messages);
                        Axios.post("/chat/setChatSeen", {
                            isSeen: true,
                            email: userEmail.current,
                            otherID: user
                        })
                    })
                    .catch((err) => {
                    })
                }
            })
            .catch((err) => {

            })
        }
    };
    
    const updateTypedMessage = (e) => {
            setTypedMessage(e.target.value);
        }
    
    
    const sendMessage = () => {

            if(typedMessage !== "")
            {
                if(chatID.current)
                {
                    Axios.post("/chat/sendmessage", {
                        sender: iAm.current,
                        senderID: chat.current[iAm.current],
                        id: chatID.current,
                        text: typedMessage,
                        receiver: user
                    })
                    .then((data) => {
                        setMessages([{sender: iAm.current, text: typedMessage}].concat(messages));
                    });
                }
                else
                {
                    Axios.post("/chat/createChat", {
                        user1Email: userEmail.current,
                        user2: user
                    })
                    .then((response) => {
                        chatID.current = response.data.id;
                        chat.current = response.data;
                        iAm.current = "user1";

                        Axios.post("/chat/sendmessage", {
                            sender: iAm.current,
                            senderID: chat.current[iAm.current],
                            id: chatID.current,
                            text: typedMessage,
                            receiver: user,
                        })
                        .then((data) => {
                            setMessages([{sender: iAm.current, text: typedMessage}].concat(messages));
                        });
                    })
                    .catch((err) => {
                        //idk
                    })
                }

                setTypedMessage("");
            }
        };

    return (
        <div>
            <div className={styles.nameAndPicture} onClick={() => navigate("/user/" + user)}>
                    <img className={styles.profilePicture} src={pfp} onError={() => setPFP(defaultAvatar)}  alt={""} />
                    <span className={styles.username} >{username} </span>
            </div>
            <div className={styles.messagesTile}>
                {console.log(messages)}
                {messages.map((message, i) => {
                    if(message.sender === iAm.current)
                    {
                        return (
                            <div className={styles.selfMessageBubble} key={message.text+i}>
                                {message.text}
                            </div>
                        );
                    }
                    else
                    {
                        return (
                            <div className={styles.otherMessageBubble} key={message.text+i}>
                                {message.text}
                            </div>
                        );
                    }
                })}
            </div>
            <div className={styles.typeAndSend}>
                <TextArea className={styles.textEntry} placeholder="Message" bordered={false} autoSize={{minRows:1, maxRows:5}} type="text" id="messageField" value={typedMessage} onChange={updateTypedMessage}/>
                <Button type="primary" className={styles.sendBtn} onClick={sendMessage} icon={<SendOutlined/>}></Button>
                {/* <div className={styles.sendBtn} onClick={sendMessage}>SEND</div> */}
            </div>
        </div>
    );
}

export default SingleChat;