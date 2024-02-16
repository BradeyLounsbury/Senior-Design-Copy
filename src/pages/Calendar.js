import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Axios from 'axios';
import { AccountContext } from '../components/Account';
import routes from '../constants/Routes';

import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";

const locales = {
    "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

function MyCalendar() {
    const { getSession } = useContext(AccountContext);

    const [eventData, setEventData] = useState([]);

    const [width, setWidth] = useState(window.innerWidth);
    const isMobile = width <= 768;

    const handleWindowSizeChange = () =>
    {
        setWidth(window.innerWidth);
    }

    const navigate = useNavigate();

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    useEffect(() => {
      getSession()
        .then((session) => {
            console.log("Session: ", session);
            getEvents(session.idToken.payload.email);
        })
        .catch((err) => {
            console.error("Session error: ", err);
            navigate(routes.login);
        })
    }, []);

    const getEvents = (email) => {
        let data = [];
        Axios.post('/api/grabPrivEvents', {
          email: email,
        })
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              data.push({
                Id: response.data.at(i).Item.id,
                Title: response.data.at(i).Item.title,
                Date: response.data.at(i).Item.date,
                Description: response.data.at(i).Item.desc,
                Participants: response.data.at(i).Item.participants,
                Slots: response.data.at(i).Item.totalSlots,
                Location: response.data.at(i).Item.location,
                Owner: response.data.at(i).Item.owner,
                StartTime: response.data.at(i).Item.startTime,
                EndTime: response.data.at(i).Item.endTime,
              });
            };
            console.log(parseEventData(data));
            setEventData(parseEventData(data));
          }).catch((e) => {
            console.error(e);
          });
      };

    const parseEventData = (events) => {
        let data = [];
        for (let idx in events) {
            const year = Number(events[idx].Date.split('-')[0]);
            const month = Number(events[idx].Date.split('-')[1])-1; // months are 0 - 11 
            const day = Number(events[idx].Date.split('-')[2]);
            const startTime = parseTime(events[idx].StartTime);
            const endTime = parseTime(events[idx].EndTime);
            data.push({ // cant simply use Date("year-month-day") because javascripts Date constructor is 1 day off depending on your time zone
                id: events[idx].Id,
                title: events[idx].Title,
                start: new Date(year, month, day, startTime.hour, startTime.minute, 0),
                end: new Date(year, month, day, endTime.hour, endTime.minute)      
            })
        };
        return data;
    }

    const parseTime = (time) => {
        let temp = {}
        if (time[time.length-2] === 'A'){ // AM
            temp.hour = Number(time.split(':')[0]);
            temp.minute = Number(time.split(':')[1].split(' ')[0]);
            if (temp.hour === 12) temp.hour = 0;
        }
        else { // PM
            temp.hour = Number(time.split(':')[0])+12;
            temp.minute = Number(time.split(':')[1].split(' ')[0]);
            if (temp.hour === 24) temp.hour = 12;
        }
        return temp;
    }

    const handleSelectEvent = (e) => {
        navigate(`/event/${e.id}`);
    }

    return (
        <>
        {isMobile ? 
            <div className="mobile-styling">
                <Calendar localizer={localizer} events={eventData} startAccessor="start" endAccessor="end" views={['month', 'day']} onSelectEvent={handleSelectEvent}/>
            </div>
        :
            <div className="desktop-styling">
                <h1>Calendar</h1>
                <Calendar localizer={localizer} events={eventData} startAccessor="start" endAccessor="end" views={['month', 'week', 'day']}onSelectEvent={handleSelectEvent}/>
            </div>
        }
        </>
    );
}

export default MyCalendar;