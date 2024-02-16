import styles from './FindEvents.module.css';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AccountContext } from '../components/Account';
import MapTile from '../components/MapTile.js';
import routes from '../constants/Routes';
import Event from '../components/Event.js';
import Axios from 'axios';
import { useNavigate } from "react-router-dom";

function EventInfo(props)
{
    return(
        <div style={{margin:"10px"}}>
            <Event isOpen={true} {...props}/>
        </div>
    );
}   


const FindEvents = () =>
{
    const { getSession } = useContext(AccountContext);
    const navigate = useNavigate();
    let [eventID, setEventID] = useState(null);
    let [infoProps, setInfoProps] = useState({participants: "", totalSlots: "0"});
    let [events, setEvents] = useState([]);
    let [myEvents, setMyEvents] = useState([]);
    let map = useRef(null);
    let email = useRef(null);


    useEffect(() => {
        getSession()
          .then((session) => {
            email.current = session.idToken.payload.email;
            Axios.post('/api/grabPrivEvents', {
            email: email.current,
            })
            .then((response) => {
            let eventIDs = [];
            for(const event of response.data)
            {
                eventIDs.push(event.Item.id);
            }
            setMyEvents(eventIDs);
            }).catch((e) => {
            console.error(e)
            });

            Axios.post('/api/grabPubEvents')
            .then((response) => {
                let evs = response.data;
                Axios.post("/api/getGroupEvents", {email: email.current})
                .then((response) => {
                    setEvents(evs.concat(response.data));
                })
                .catch((err) => {
                    console.log(err);
                })
            }).catch((e) => {
                console.error(e);
            });
          })
          .catch((err) => {
              console.error("Session error: ", err);
              navigate(routes.login);
          });
        
      }, []);

    const updateEventID = (id) =>
    {
        setEventID(id);
        if (id)
        {
            setInfoProps(events.find(x => x.id === id));
        }
        else
        {
            setInfoProps({});
        }
    }

    return (
        <div style={{position:"relative"}}>
            <MapTile ref={map} updateEventID={updateEventID} getMarkers={() => {return events;}}/>
            <div className={styles.eventRender}>
            <EventInfo {... infoProps} email={email.current} hasJoined={myEvents.includes(eventID)} key={eventID}/>
            </div>
        </div>
    );
}

export default FindEvents;