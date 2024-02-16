import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  TeamOutlined, 
  SettingOutlined,
  EditOutlined,
} from '@ant-design/icons';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AccountContext } from '../components/Account';
import styles from './EventInfo.module.css';
import defaultBanner from '../assets/tennis-court.jpg';
import defaultAvatar from '../assets/default-avatar.png';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import routes from '../constants/Routes';
import Axios from 'axios';
import CustomModal from '../components/CustomModal';
import {Autocomplete, LoadScript} from '@react-google-maps/api';
import {ModelessContext} from '../components/ConfirmationModeless';
import helpers from '../constants/dataCheckEvents.js';

const libraries = ["places"];

function EventInfo() {
  const { getSession } = useContext(AccountContext);
  const modeless = useContext(ModelessContext);
  const navigate = useNavigate();
  const {eventID} = useParams();
  const [email, setEmail] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [accessType, setAccessType] = useState("Public");

  
  const autocomplete = useRef(null);
  const options = {
    componentRestrictions: { country: "us" },
    fields: ["formatted_address", "geometry", "icon", "name"],
    strictBounds: false
  };

  const onLoad = (x) => {
    autocomplete.current = x;
  }

  const onPlaceChanged = () => {
    setNewLocation(autocomplete.current.getPlace().formatted_address);
  }

  useEffect(() => {
    getSession()
      .then((session) => {
        setEmail(session.idToken.payload.email);
        checkIsAdmin(session.idToken.payload.email);
        Axios.post('/api/grabPrivEvents', {
          email: session.idToken.payload.email,
        })
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            if (response.data.at(i).Item.id === eventID) {
              setHasJoined(true);
              Axios.post('/api/isEventOwner', {
                id: eventID,
                email: session.idToken.payload.email,
              }).then((response) => {
                  setIsOwner(response.data);
              }).catch((err) => {
                  console.error(err);
              })
            }
          }
        }).catch((e) => {
          console.error(e);
        });
      })
      .catch((err) => {
          console.error("Session error: ", err);
          navigate(routes.login);
      });

    Axios.post('/api/getEvent', {
      eventID: eventID,
    }).then((response) => {
      console.log("Event Successfully Retrieved");
      setEventTitle(response.data.Item.title);
      setNewTitle(response.data.Item.title);
      setEventDate(response.data.Item.date);
      setNewDate(response.data.Item.date);
      setEventStart(response.data.Item.startTime);
      setNewStart(response.data.Item.startTime);
      setEventEnd(response.data.Item.endTime);
      setNewEnd(response.data.Item.endTime);
      setStd("EST");
      setEventLocation(response.data.Item.location);
      setNewLocation(response.data.Item.location);
      setEventDesc(response.data.Item.desc);
      setNewDesc(response.data.Item.desc);
      setEventSlots({
        count: response.data.Item.participants.length,
        total: response.data.Item.totalSlots
      });
      setAccessType(response.data.Item.accessType);
      setOwnerID(response.data.Item.owner);
      Axios.post('/api/participantNames', {
        participants: response.data.Item.participants,
      }).then((response) => {
        setEventParticipants(response.data);
      }).catch((err) => {
        modeless({isVisible: true, success: false, text: "Couldn't grab participants"});
        console.error(err)
      })

      Axios.post('/api/getGroupName', {
        groupID: response.data.Item.group,
      }).then((response) => {
        setGroupName(response.data);
      }).catch((err) => {
        console.error(err);
      });
    }).catch((e) => {
          console.error(e);
    });
    Axios.post('/api/grabEventOwner', {
      id: eventID,
    }).then((response) => {
      setOwnerName(response.data.Items[0].username);
      Axios.post('/api/getPFP', {
        id: response.data.Items[0].userID
      }).then((response) =>{
        setOwnerPic(response.data);
      })
    }).catch((err) => {
      console.error(err);
      setOwnerName("N/A");
    });

    Axios.post('/api/getEventBanner', {
      id: eventID,
    }).then((response) => {
      setBanner(response.data);
    }).catch((err) => {
      console.error(err);
    })
    
  }, []);

  const [ownerPic, setOwnerPic] = useState(defaultAvatar);
  const [ownerName, setOwnerName] = useState("Owner Name");
  const [ownerID, setOwnerID] = useState("");
  const [groupName, setGroupName] = useState("");
  const [userPics, setUserPics] = useState([defaultAvatar]);
  const [banner, setBanner] = useState(defaultBanner);
  const [eventTitle, setEventTitle] = useState("Event Title");
  const [eventDate, setEventDate] = useState("TBD");
  const [eventStart, setEventStart] = useState("0:00 AM");
  const [eventEnd, setEventEnd] = useState("0:00 AM");
  const [std, setStd] = useState("EST");
  const [eventLocation, setEventLocation] = useState("N/A");
  const [eventDesc, setEventDesc] = useState("None");
  const [eventSlots, setEventSlots] = useState({
    count: 0,
    total: 0
  });
  const [eventParticipants, setEventParticipants] = useState([[,]]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRemoveModal, setIsRemoveModal] = useState(false);
  const [removeParticipant, setRemoveParticipant] = useState(""); // participant to be removed
  const [isOwner, setIsOwner] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newBanner, setNewBanner] = useState("");
  const [newBannerName, setNewBannerName] = useState("");
  const [adminDelete, setAdminDelete] = useState(false);

  const [titleStyle, setTitleStyle] = useState("modal-input");
  const [locationStyle, setLocationStyle] = useState("modal-input");
  const [timeStyle, setTimeStyle] = useState("time-modal-input");
  const [dateStyle, setDateStyle] = useState("modal-input");

  const handleJoinClick = () => {
    console.log("Joining event. . .");
    if (eventSlots.count < eventSlots.total) {
      Axios.post('/api/joinEvent', {
          email: email,
          id: eventID,
      }).then((response) => {
          console.log(response.data);
          setHasJoined(true);
          setEventSlots({
            count: eventSlots.count+1,
            total: eventSlots.total
          });        
      }).catch((err) => {
          console.error(err);
      });
    }
    else {
        console.error("Event is currently full");
    }
  }

  const handleLeaveClick = () => { 
    console.log("Leaving event. . .");
    Axios.post('/api/leaveEvent', {
        email: email,
        id: eventID,
    }).then((response) => {
        console.log(response.data);
        setHasJoined(false);
        setEventSlots({
          count: eventSlots.count-1,
          total: eventSlots.total
        });         
    }).catch((err) => {
        console.error(err);
    });
  }

  const handleEditClick = () => {
    setIsEditOpen(true);
  }

  const handleParticipant = (participant) => {
    setRemoveParticipant(participant);
    setIsRemoveModal(true);
  }

  const updateNewBanner = (e) => {
    console.log(e.target.files[0]);
    setNewBanner(e.target.files[0]);
    setNewBannerName(e.target.files[0].name)
  }

  const confirmRemove = () => {
    Axios.post('/api/removeParticipant', {
      id: eventID,
      participant: removeParticipant[0],
    }).then((response) => {
      modeless({isVisible: true, success: true, text: `${removeParticipant[1]} has been removed`});
      let idx = eventParticipants.indexOf(removeParticipant)
      let temp = eventParticipants;
      temp.splice(idx, 1);
      setEventParticipants(temp);
      setIsRemoveModal(false);
    }).catch((err) => {
      modeless({isVisible: true, success: false, text: `Couldn't remove ${removeParticipant[1]}`});
      console.error(err);
      setIsRemoveModal(false);
    })
  }

  const submitEdit = () => {
    console.log(newTitle);
    let tempParticipants = [];
    for (let i = 0; i < eventParticipants.length; i++) {
      tempParticipants.push(eventParticipants[i][0]);
    }
    Axios.post('/api/updateEvent', {
      id: eventID,
      title: newTitle,
      desc: newDesc,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      location: newLocation,
      totalSlots: eventSlots.total,
      participants: tempParticipants,
    })
    .then((response) => {
      modeless({isVisible: true, success: true, text: "Updated event successfully!"});
      console.log("updated event!");
      setEventTitle(newTitle);
      setEventDesc(newDesc);
      setEventDate(newDate);
      setEventStart(newStart);
      setEventEnd(newEnd);
      setEventLocation(newLocation);
      setEventParticipants(tempParticipants);
    })
    .catch((err) => {
      modeless({isVisible: true, success: false, text: "Error editing event"});
      console.error(err);
    })

    if (newBanner !== "") {
      const form = new FormData();
      form.append('banner', newBanner);
      form.append('id', eventID);
      console.log(form);

      Axios.post('/api/uploadEventBanner', form, {headers: {'Content-Type': 'multipart/form-data'}})
      .then((_) => {
        modeless({isVisible: true, success: true, text:'Banner uploaded successfully'});
        setBanner(URL.createObjectURL(newBanner));
        setNewBanner("");
        setNewBannerName("");
      }).catch((err) => {
        console.log(err);
        modeless({isVisible: true, success: false, text:'Error uploading banner'});
      })
    }
  }

  const submitDelete = () => {
    if (adminDelete) {
      Axios.post('/api/getProfileByID', {
        id: ownerID,
      }).then((response) => {
        console.log("owner successfully located");
        Axios.post('/api/deleteEvent', {
          id: eventID,
          email: response.data.email, // owners email
        })
        .then(() => {
          console.log("Event successfully deleted")
          modeless({isVisible: true, success: true, text: "Event Succesfully Deleted"});
          navigate(routes.dashboard);
        })
        .catch((err) => {
          console.error(err);
        })
      }).catch(() => {
          modeless({isVisible: true, success: false, text:'Could not locate owner by ID'});
      })
    }
    else {
      Axios.post('/api/deleteEvent', {
        id: eventID,
        email: email,
      })
      .then(() => {
        modeless({isVisible: true, success: true, text: "Event Succesfully Deleted"});
        navigate(routes.dashboard);
      })
      .catch((err) => {
        console.error(err);
      })
    }
  }
  const viewUserProfile = (val) => {
    navigate("/user/" + val)
  }

  const checkData = (e) => {
    let isValid = false;
    if(helpers.checkTime(newStart, newEnd, newDate) == true && helpers.checkDate(newDate) == true && helpers.checkTitle(newTitle) == true && helpers.checkLocation(newLocation) == true){
      isValid = true; 
    }
    if(helpers.checkTime(newStart, newEnd, newDate) == false){
      setTimeStyle("incorrect-time");
    }
    else{
      setTimeStyle("time-modal-input");
    }
    if(helpers.checkDate(newDate) == false){
      setDateStyle("incorrect-text");
    }
    else{
      setDateStyle("modal-input");
    }
    if(helpers.checkTitle(newTitle) == false){
      setTitleStyle("incorrect-text");
    }
    else{
      setTitleStyle("modal-input");
    }
    if(helpers.checkLocation(newLocation) == false){
      setLocationStyle("incorrect-text");
    }
    else{
      setLocationStyle("modal-input");
    }
    // Check all Data here
    if(isValid === true){
      submitEdit()
    }
    return isValid;
  }
  const setClose = () =>{
    setTimeStyle("time-modal-input");
    setLocationStyle("modal-input");
    setTitleStyle("modal-input");
    setDateStyle("modal-input");
    setIsEditOpen(false);
  }

  const checkIsAdmin = (seshEmail) => {
    Axios.post('/api/getProfile', {
      email: seshEmail,
    }).then((response) => {
      response.data.isAdmin ? setIsAdmin(true) : setIsAdmin(false);

    }).catch((err) => {
      modeless({isVisible: true, success: false, text:'Could not locate session owner profile'});
    });
  }

  return (
    <div className={styles['page-wrap']}>
      <img className={styles['img-banner']} src={banner} onError={() => setBanner(defaultBanner)} alt="Tennis Court Banner"/>
      <div className={styles['event-top']}>
        <div className={styles['img-owner-wrap']}>
          <img className={styles['img-owner']} src={ownerPic} onError={() => setOwnerPic(defaultAvatar)} alt="Owner Avatar"/>
        </div>
        <div className={styles['event-title-wrap']}>
          <div className={styles['column-title-wrap']}>
            <div className={styles['event-title']}>{eventTitle}</div>
            {isAdmin && <SettingOutlined className={styles['admin-settings-icon']} onClick={() => {setModalOpen(true)}}/>}
          </div>
          <div className={styles['date-wrap']}>
            <div className={styles['event-label']}>Date:</div>
            <div className={styles['event-text']} style={{marginLeft: '10px'}}>{eventDate}</div>
          </div>
        </div>
      </div>
      <div className={styles['event-info-frame']}>
        <div className={styles['column-wrap']}>
        <div className={styles['icon-wrap']}><ClockCircleOutlined className={styles['info-icon']}/></div>
          <div className={styles['event-label']}>Time</div>
        </div>
        <div className={styles['event-text']}>{`${eventStart} - ${eventEnd} ${std}`}</div>
      </div>
      <div className={styles['event-info-frame']}>
        <div className={styles['column-wrap']}>
          <div className={styles['icon-wrap']}><EnvironmentOutlined className={styles['info-icon']}/></div>
          <div className={styles['event-label']}>Location</div>
        </div>
        <div className={styles['event-text']}>{eventLocation}</div>
      </div>
      <div className={styles['event-info-frame']}>
        <div className={styles['column-wrap']}>
        <div className={styles['icon-wrap']}><InfoCircleOutlined className={styles['info-icon']}/></div>
          <div className={styles['event-label']}>Description</div>
        </div>
        <div className={styles['event-text']}>{eventDesc}</div>
      </div>
      <div className={styles['event-info-frame']}>
        <div className={styles['column-wrap']}>
        <div className={styles['icon-wrap']}><CrownOutlined className={styles['info-icon']}/></div>
          <div className={styles['event-label']}>{accessType === "Public" ? "Owner" : "Group"}</div>
        </div>
        <div className={styles['event-text']}>{accessType === "Public" ? ownerName : groupName}</div>
      </div>
      <div className={styles['event-info-frame']}>
        <div className={styles['column-wrap']}>
        <div className={styles['icon-wrap']}><TeamOutlined className={styles['info-icon']}/></div>
          <div className={styles['event-label']}>Participants</div>
        </div>
        <div className={styles['participants-info']}>
          { eventParticipants.length > 0 ?
            eventParticipants.map(function(val, idx) {return <div key={idx} className={styles['participants-tag-page']} onClick={() => {viewUserProfile(val[0])}} > {val[1]} </div>})
            :
            <div className={styles['participants-none']}>None</div>
          }
        </div>
        {/* <div className={styles['column-wrap-overflow']}>
          {userPics.map(function(val, idx){return (<img key={idx} className={styles['img-user']} src={val} alt="User Avatar"/>)})}
        </div> */}
        <div className={styles['event-text']}>{`Slots: ${eventSlots.count} / ${eventSlots.total}`}</div>
      </div>
      <div className={styles['join-backdrop']}>
        { hasJoined && !isOwner &&
          <button className={styles["leave-btn"]} onClick={handleLeaveClick}>Leave Event</button>
        }
        { !hasJoined && !isOwner &&
          <button className={styles["join-btn"]} onClick={handleJoinClick}>Join Event</button>
        }
        { isOwner &&
          <button className={styles["edit-btn"]} onClick={handleEditClick}>Edit Event</button>
        }
      </div>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <CustomModal
        title={`${eventTitle} edit`}
        cancelTxt="Cancel" 
        submitTxt= "Confirm"
        isOpen={isEditOpen} 
        //Closes Modal window
        handleClose= {() => {setClose()}}
        handleCancel= {() =>{setClose()}}
        handleSubmit={() => {checkData()}}>
          <div className={styles['modal-input-frame']}>
            <div className={styles['modal-input-title']}>Title</div>
            {/* Title */}
            <input className={styles[titleStyle]} placeholder = {eventTitle} maxLength='30' onChange={(e) => {setNewTitle(e.target.value)}}/>
            <div className={styles['modal-input-title']}>Date</div>
            {/* Date */}
            <input className={styles[dateStyle]} type='date' placeholder = {eventDate} onChange={(e) => {setNewDate(e.target.value)}}/>
            <div className={styles['time-wrap']}>
              {/* Time */}
              <div className={styles['modal-input-title']}>Start Time</div>
              <input className={styles[timeStyle]} placeholder = {eventStart} type='time' onChange={(e) => {setNewStart(e.target.value)}}/>
              <div className={styles['time-modal-input-title']}>End Time</div>
              <input className={styles[timeStyle]} placeholder = {eventEnd} type='time' onChange={(e) => {setNewEnd(e.target.value)}}/>
            </div>
            <div className={styles['modal-input-title']}>Location</div>
            <Autocomplete
              options={options}
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}>
                {/* Location */}
              <input className={styles[locationStyle]} placeholder = {eventLocation} onChange={(e) => setNewLocation(e.target.value)}/>
            </Autocomplete>
            {/* Description */}
            <div className={styles['modal-input-title']}>Description</div>
            <textarea className={styles['modal-input']} placeholder = {eventDesc} maxLength="250" rows='3' onChange={(e) => {setNewDesc(e.target.value)}}/>
            <div className={styles['modal-input-title']}>Participants</div>
            <div className={styles['participants-modal']}>
              { eventParticipants.length > 0 ?
                eventParticipants.map(function(val, idx) {return <div key={idx} className={styles['participants-tag']} onClick={() => handleParticipant(val)}> {val[1]} </div>})
                :
                <div className={styles['participants-none']}>None</div>
              }
            </div>
            <div className={styles['banner-title-wrap']}>
              <div className={styles['modal-input-title']}>Banner</div>
              <label onChange={updateNewBanner} htmlFor="bannerForm">
                <input name='' type='file' id='bannerForm' hidden/>
                <EditOutlined className={styles['upload-icon']}></EditOutlined>
              </label>
            </div>
            <div className={styles['new-banner-wrap']}>
              <div className={styles['new-banner']}>{newBannerName}</div>
            </div>
            <div className={styles['delete-wrap']}>
              <div className={styles['delete-btn-edit']} onClick={() => {
                setAdminDelete(false);
                setConfirmOpen(true);
                }}>Delete</div>
            </div>
          </div> 
        </CustomModal>
      </LoadScript>
        <CustomModal
        title={`Are you sure you want to remove ${removeParticipant[1]} from ${eventTitle}?`}
        cancelTxt="Cancel" 
        submitTxt= "Confirm"
        isOpen={isRemoveModal} 
        //Closes Modal window
        handleClose= {() => {setIsRemoveModal(false)}}
        handleCancel= {() =>{setIsRemoveModal(false)}}
        handleSubmit={() => {confirmRemove()}}>
        </CustomModal>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <CustomModal 
          title="Admin Controls"
          cancelTxt="Cancel"
          submitTxt={"Save Changes"} 
          isOpen={modalOpen} 
          handleClose={() => {setModalOpen(false)}}
          handleCancel={() => {setModalOpen(false)}}
          handleSubmit={submitEdit}>
          <div className={styles['modal-content-wrap']}>
            <div className={styles['input-frame']}>
              <div className={styles['input-title']}>Title</div>
              <input className={styles['input-text']} maxLength="30" onChange={(e) => setNewTitle(e)}/>
            </div>
            <div className={styles['input-frame']}>
              <div className={styles['input-title']}>Description</div>
              <textarea className={styles['input-textarea']} rows='3' maxLength="250" onChange={(e) => setNewDesc(e)}/>
            </div>
            <div className={styles['input-frame']}>
              <div className={styles['input-title']}>Location</div>
              <Autocomplete
                options={options}
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}>
                <input className={styles['input-text']} onChange={(e) => setNewLocation(e)}/>
              </Autocomplete>
            </div>
            <div className={styles['input-frame']}>
              <div className={styles['input-title']}>Start Time</div>
              <input className={styles['input-time']} type="time" onChange={(e) => setNewStart(e)}/>
            </div>
            <div className={styles['input-frame']}>
              <div className={styles['input-title']}>End Time</div>
              <input className={styles['input-time']} type="time" onChange={(e) => setNewEnd(e)}/>
            </div>
            <div className={styles['input-frame']}>
              <div className={styles['input-title']}>Date</div>
              <input className={styles['input-text']} type="date" onChange={(e) => setNewDate(e)}/>
            </div>
            <div className={styles['delete-wrap']}>
              <div className={styles['delete-btn']} onClick={() => {
                setAdminDelete(true);
                setConfirmOpen(true);
                }}>Delete Event</div>
            </div>
          </div>
        </CustomModal>
      </LoadScript>
        <CustomModal 
          title="Delete Event"
          cancelTxt="No"
          submitTxt={"Yes"} 
          isOpen={confirmOpen} 
          handleClose={() => {setConfirmOpen(false)}}
          handleCancel={() => {setConfirmOpen(false)}}
          handleSubmit={submitDelete}>
          <div className={styles['confirm-content-wrap']}>
            Are you sure you want to delete this event?
          </div>
        </CustomModal>
    </div>
  );
}

export default EventInfo;