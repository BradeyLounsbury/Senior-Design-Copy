import React, { useState } from 'react';
import styles from './MoreInfo.module.css';
import routes from '../constants/Routes';
import { useNavigate } from 'react-router-dom';

function MoreInfo() {
    const [isActiveCreate, setIsActiveCreate] = useState(false);
    const [isActiveCal, setIsActiveCal] = useState(false);
    const [isActiveJoin, setIsActiveJoin] = useState(false);
    const [isActiveProfileInfo, setIsActiveProfileInfo] = useState(false);
    return (
        <div className={styles["main-faq"]}>
              <div className={styles["col-faq"]}>
                <div className={styles["section-faq"]}>
                   <p> <h4>More Information </h4> </p>
                </div>
               {/* Create Group/Event */}
                <div className={styles['q1']} style={{cursor:"pointer"}}  onClick={() => setIsActiveCreate(!isActiveCreate)} >
                    <hr />
                    How to Create Events or Groups
                    <hr />
                    
                </div>
                <p className={styles['a1']}>
                {isActiveCreate && <div className={styles['a1']}>
                    Through the Header, click Create and either Group or Event. Fill out the fields that show 
                    up for either the Group or Event then click Create when finished. The Event will show up on My Events in the Event page.
                    The Group will show up in My Group
                    </div>}
                </p>
                {/* Join Group/Event */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveJoin(!isActiveJoin)} >
                    <hr />
                    How to Join or Leave Events or Groups
                    <hr />
                    
                </div>
                <p className={styles['a1']}>
                {isActiveJoin && <div className={styles['a1']}>
                    Head to Events or Groups page and look under Public Events. 
                    Click on an Event or Group that is available and click Join. This will show up in My Events or My Groups
                    You can leave an Event or Group the same way you Joined one within My Events or My Groups
                    </div>}
                </p>
              {/* Calendar Stuff */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveCal(!isActiveCal)} >
                    <hr />
                    Calendar Information
                    <hr />
                </div>
                <p className={styles['a1']}>
                {isActiveCal && <div className={styles['a1']}>
                    The Calendar will hold your Events on the dates they will take place, along 
                    with tell you the time they will happen.
                    </div>}
                </p>
                {/* Profile Stuff */}
                <div className={styles['q1']} style={{cursor:"pointer"}} onClick={() => setIsActiveProfileInfo(!isActiveProfileInfo)} >
                    <hr />
                    Change Profile Information
                    <hr />
                </div>
                <p className={styles['a1']}>
                {isActiveProfileInfo && <div className={styles['a1']}>
                    Go to My Profile to see all of your profile information. Click Edit to change
                    your information such as bio. Then either Save or Cancel your changes.
                    </div>}
                </p>

                </div>

            
        </div>
      );
    }
export default MoreInfo;

