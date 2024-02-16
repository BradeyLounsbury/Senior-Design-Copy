import React, { useState } from 'react';
import styles from './FAQ.module.css';

function FAQ() {
    const [isActivePurpose, setIsActivePurpose] = useState(false);
    const [isActiveNeed, setIsActiveNeed] = useState(false);
    const [isActiveEvents, setIsActiveEvents] = useState(false);
    const [isActiveGroups, setIsActiveGroups] = useState(false);
    const [isActiveChat, setIsActiveChat] = useState(false);
    const [isActiveReport, setIsActiveReport] = useState(false);
    const [isActiveCalendar, setIsActiveCalendar] = useState(false);
    return (
        <div className={styles["main-faq"]}>
              {/* Column1 */}
              <div className={styles["col-faq"]}>
                <div className={styles["section-faq"]} >
                   <p> <h4>Frequenctly Asked Questions </h4> </p>
                </div>
                {/* q1 */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActivePurpose(!isActivePurpose)}>
                <hr />
                    Whats the purpose of Event Planner?
                    <hr />
                </div>
                <p className={styles['a1']} >
                {isActivePurpose && <div className={styles['a1']}>
                    The Event Planner allows people to post 
                    an event and allow people 
                    to join said event during the place and 
                    time it takes place
                    </div>}
                </p>
                {/* q2 */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveNeed(!isActiveNeed)}>
                    <hr />
                    What do you need to use Event Planner?
                    <hr />
                </div>
                <p className={styles['a1']}>
                {isActiveNeed && <div className={styles['a1']}>
                    You will need a valid email address and password
                    to get started on making an account
                    to join events
                    </div>}
                </p>
              {/* q3 */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveEvents(!isActiveEvents)}>
                    <hr />
                    What kind of events are there?
                    <hr />
                </div>
                <p className={styles['a1']}>
                {isActiveEvents && <div className={styles['a1']}>
                    Users can participate in sports events, 
                    recreational events or anything similiar 
                    that a group of people can do together.
                    Events can be public to anyone or private to groups.
                    </div>}
                </p>
                {/* q4 */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveGroups(!isActiveGroups)}>
                    <hr />
                    What are Groups?
                    <hr />
                </div>
                <p className={styles['a1']}>
                {isActiveGroups && <div className={styles['a1']}>
                    Users can request to join groups or create a group themselves.
                    A group is a community of users who have similiar interests or is interested 
                    to what the group offers. While in a group you can see the groups private events and 
                    group chat.
                    </div>}
                </p>
                {/* q5 */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveReport(!isActiveReport)}>
                    <hr />
                    How do you report users?
                    <hr />
                </div>
                <p className={styles['a1']}>
                {isActiveReport && <div className={styles['a1']}>
                    Go to the users profile and click on the flag icon top right of the page
                    next to the profile picture. You can report for a select amount of reasons such as
                    hateful conduct or spamming. You could also leave a comment for another reason thats not listed.
                    </div>}
                </p>
                {/* q6 */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveCalendar(!isActiveCalendar)}>
                    <hr />
                    What is the Calendar?
                    <hr />
                </div>
                <p className={styles['a1']}>
                {isActiveCalendar && <div className={styles['a1']}>
                    The Calendar is one place you can use to see when your events are starting.
                    </div>}
                </p>
                {/* q7 */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveChat(!isActiveChat)}>
                    <hr />
                    How do I message users?
                    <hr />
                </div>
                <p className={styles['a1']}>
                {isActiveChat && <div className={styles['a1']}>
                    Go to the users profile you want to chat with and click message at the bottom. If you 
                    already message the user before, go to dashboard and view messages.
                    </div>}
                </p>
                {/*  */}
                </div>

            
        </div>
      );
    }
export default FAQ;