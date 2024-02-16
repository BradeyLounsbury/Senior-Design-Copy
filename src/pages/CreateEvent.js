import React, { useState, useContext, useEffect, useRef } from 'react';
import { AccountContext } from '../components/Account';
import Axios from 'axios';
import { useNavigate } from "react-router-dom";
import styles from './CreateEvent.module.css';
import routes from '../constants/Routes';
import {ModelessContext} from '../components/ConfirmationModeless';
import {Autocomplete, LoadScript} from '@react-google-maps/api';
import {AimOutlined, DownOutlined} from '@ant-design/icons';
import CoordMap from '../components/CoordMap';
import CustomModal from '../components/CustomModal';
import Pool from '../UserPool.js';
import helpers from '../constants/dataCheckEvents.js';
import { EditOutlined } from '@ant-design/icons';

const libraries = ["places"];

function CreateEvent() {
  const { getSession } = useContext(AccountContext);
  const modeless = useContext(ModelessContext);
  const navigate = useNavigate();

  const updateOwner = (userEmail) => {
    Axios.post("/api/getProfile", {
      email: userEmail,
    }).then((response) => {
      setOwner(response.data.username);
      setOwnerUID(response.data.userID);
      console.log(response.data.username);
    }).catch((e) => {
      console.log(e);
    });  
  }

  useEffect(() => {
    getSession()
      .then((session) => {
        const email = session.idToken.payload.email;
        console.log("Session: ", email);
        setEmail(email);
        updateOwner(email);
        let groups = [];

        Axios.post("/api/getOwnedGroups", {
          email: email
        })
        .then((response) => {
          let promises = [];
          Object.keys(response.data).forEach((k) => {
            let promise = Axios.post("/api/getGroupName", {groupID: k})
            .then((response) => {
              groups.push({name:response.data, id: k});
            });

            promises.push(promise);
          })

          Promise.allSettled(promises)
          .then(([result]) => {
            setOwnedGroups(groups);
          })
        })
      })
      .catch((err) => {
          console.error("Session error: ", err);
          navigate(routes.login);
      })
  }, []);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState("");
  const [totalSlots, setTotalSlots] = useState(0);
  const [coords, setCoords] = useState(["", ""]);
  const [mapOpen, setMapOpen] = useState(false);
  const [owner, setOwner] = useState("");
  const [ownerUID, setOwnerUID] = useState("");
  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState("Public"); 
  const [titleStyle, setTitleStyle] = useState("input-text");
  const [descStyle, setDescStyle] = useState("input-text-bubble");
  const [locationStyle, setLocationStyle] = useState("input-text");
  const [timeStyle, setTimeStyle] = useState("input-time");
  const [dateStyle, setDateStyle] = useState("input-text");
  const [totalSlotStyle, setTotalSlotSytle] = useState("input-text-bubble");
  const coordMap = useRef(null);
  const latField = useRef(null);
  const lngField = useRef(null);
  const options = {
    componentRestrictions: { country: "us" },
    fields: ["formatted_address", "geometry", "icon", "name"],
    strictBounds: false
  };
  const [banner, setBanner] = useState("");
  const [bannerName, setBannerName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState({name:"Select Group", id:""});
  const [groupSelectOpen, setGroupSelectOpen] = useState(false);
  const [ownedGroups, setOwnedGroups] = useState([]);
  
  const autocomplete = useRef(null);

  const onLoad = (x) =>
  {
    autocomplete.current = x;
  }

  const coordsSelected = () =>
  {
    let coords = coordMap.current.state.coords;
    latField.value = coords[0];
    document.getElementById('lat_field').value = coords[0];
    lngField.value = coords[1];
    document.getElementById('lng_field').value = coords[1];
    setCoords(coords);
  }

  const onPlaceChanged = () =>
  {
    let location = autocomplete.current.getPlace().geometry.location;
    latField.value = location.lat();
    document.getElementById('lat_field').value = location.lat();
    lngField.value = location.lng();
    document.getElementById('lng_field').value = location.lng();
    setCoords([location.lat(), location.lng()]);

    setLocation(autocomplete.current.getPlace().formatted_address);
  }

  const updateLat = (e) => {
      let newCoords = coords;
      newCoords[0] = e.target.value;
      setCoords(newCoords);
  }

  const updateLng = (e) =>
  {
    let newCoords = coords;
      newCoords[1] = e.target.value;
      setCoords(newCoords);
  }
  

  const updateTitle = (e) => {
    setTitle(e.target.value);
    console.log("Current Title: ", e.target.value);
  }

  const updateDesc = (e) => {
    setDesc(e.target.value);
    console.log("Current Desc: ", e.target.value);
  }

  const updateLocation = (e) => {
    setLocation(e.target.value);
    console.log("Current Location: ", e.target.value);
  }

  const updateStartTime = (e) => {
    setStartTime(e.target.value);
    console.log("Current Start Time: ", e.target.value);
  }

  const updateEndTime = (e) => {
    setEndTime(e.target.value);
    console.log("Current End Time: ", e.target.value);
  }

  const updateDate = (e) => {
    setDate(e.target.value);
    console.log("Current End Time: ", e.target.value);
  }

  const updateTotalSlots = (e) => {
    setTotalSlots(e.target.value);
    console.log("Current Total Slots: ", e.target.value);
  }

  const updateBanner = (e) => {
    console.log(e.target.files[0]);
    setBanner(e.target.files[0]);
    setBannerName(e.target.files[0].name);
  }

  const handleCreate = () => {
    // console.log("Creating New Event . . .", [title, desc, location, startTime, endTime, date, totalSlots, owner]);
    console.log("title", helpers.checkTitle(title));
    console.log("location", helpers.checkLocation(location));
    console.log("time", helpers.checkTime(startTime, endTime, date));
    console.log("date", helpers.checkDate(date));
    console.log("slots", helpers.checkParticipant(totalSlots));
    if(checkData()
      // helpers.checkTitle(title) && helpers.checkLocation(location) && helpers.checkTime(startTime, endTime, date) && helpers.checkDate(date) && helpers.checkParticipant(totalSlots)
      ){    
      Axios.post('/api/createEvent', {
        email: email,
        title: title, 
        desc: desc, 
        location: location, 
        startTime: startTime, 
        endTime: endTime, 
        date: date, 
        totalSlots: totalSlots,
        participants: [ownerUID],
        owner: ownerUID,
        coords: coords,
        accessType: accessType,
        group: accessType === "Private" ? selectedGroup.id : ""
      }).then((response) => {
        if (banner !== "") {
          const form = new FormData();
          form.append('banner', banner);
          form.append('id', response.data);
          console.log(form);
    
          Axios.post('/api/uploadEventBanner', form, {headers: {'Content-Type': 'multipart/form-data'}})
          .then((_) => {
            setBanner(URL.createObjectURL(banner));
            setBanner("");
            setBannerName("");
          }).catch((err) => {
            console.log(err);
            modeless({isVisible: true, success: false, text:'Error uploading banner'});
          })
        }
        modeless({isVisible: true, success: true, text: "Event successfully created"});
        console.log(response);
      }).catch((e) => {
        modeless({isVisible: true, success: false, text: "Error creating event"});
        console.log(e);
      });
    }
    else{
      console.log('Invalid Data Input ', date);
      checkData();
    }
  }

  const handleTabClick = (e) => {
    setAccessType(e.target.innerText);
  }

  const checkData = (e) => {
    let isValid = false;
    if(helpers.checkTime(startTime, endTime, date) == true && helpers.checkParticipant(totalSlots) == true && helpers.checkDate(date) == true && helpers.checkTitle(title) == true && helpers.checkLocation(location) == true){
      isValid = true;
    }
    if(helpers.checkTime(startTime, endTime, date) == false){
      setTimeStyle("incorrect-time");
    }
    else{
      setTimeStyle("input-time");
    }
    if(helpers.checkDate(date) == false){
      setDateStyle("incorrect-text");
    }
    else{
      setDateStyle("input-text");
    }
    if(helpers.checkParticipant(totalSlots) == false){
      setTotalSlotSytle("incorrect-text-bubble");
    }
    else{
      setTotalSlotSytle("input-text-bubble");
    }
    if(helpers.checkTitle(title) == false){
      setTitleStyle("incorrect-text");
    }
    else{
      setTitleStyle("input-text");
    }
    if(helpers.checkLocation(location) == false){
      setLocationStyle("incorrect-text");
    }
    else{
      setLocationStyle("input-text");
    }
    // Check all Data here
    return isValid;
  }

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
    <CustomModal
        isOpen={mapOpen}
        children={<CoordMap ref={(e) => {coordMap.current = e}}/>}
        cancelTxt="Cancel"
        submitTxt="Submit"
        handleClose={() => {setMapOpen(false)}}
        handleCancel={() => {setMapOpen(false)}}
        handleSubmit={() => {coordsSelected(); setMapOpen(false);}}
        />
    <div className={styles['page-wrap']}>
      <h2 className={styles['page-title']}>Create a new event  </h2>
      <div className={styles['input-frame']}>
          <div className={styles['input-title']}>Title</div>
          {/* Title */}
        <input className={styles[titleStyle]} maxLength="30" onChange={updateTitle}/>
      </div>
      <div className={styles['input-frame']}>
        {/* Desc */}
        <div className={styles['input-title']}>Description</div>
        <textarea className={styles['input-textarea']} rows='3' maxLength="250" onChange={updateDesc}/>
      </div>
      <div className={styles['input-frame']}>
        <div className={styles['input-title']}>Location</div>
          <Autocomplete
            options={options}
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}> 
              {/* Location */}
            <input className={styles[locationStyle]} onChange={updateLocation}/>
          </Autocomplete>
        <div className={styles["coords-wrap"]}>
          <button className={styles["map-btn"]} onClick={() => {setMapOpen(true)}}>
            <AimOutlined/>
          </button>
          {/* Coords */}
          <input id="lat_field" ref={(e) => {latField.current = e}} className={styles["coord-input"]} placeholder="Lat" type="text" inputMode="numeric" onKeyDown={(e) =>  !/^[0-9.\B]/.test(e.key) && e.preventDefault()} onChange={updateLat}/>
          <input id="lng_field" ref={(e) => {lngField.current = e}} className={styles["coord-input"]} placeholder="Long" type="text" inputMode="numeric" onKeyDown={(e) =>  !/^[0-9.\B]/.test(e.key) && e.preventDefault()} onChange={updateLng}/>
        </div>
      </div>
      <div className={styles['input-flex-wrap']}>
        <div className={styles['input-flex-frame']}>
          {/* Time */}
          <div className={styles['input-title']}>Start Time</div>
          <input className={styles[timeStyle]} type="time" onChange={updateStartTime}/>
        </div>
        <div className={styles['input-flex-frame']}>
          <div className={styles['input-title']}>End Time</div>
          <input className={styles[timeStyle]} type="time" onChange={updateEndTime}/>
        </div>
      </div>
      <div className={styles['input-frame']}>
        {/* Date */}
        <div className={styles['input-title']}>Date</div>
        <input className={styles[dateStyle]} type="date" onChange={updateDate}/>
      </div>
      <div className={styles['input-frame']}>
        {/* Slots */}
        <div className={styles['input-title']}>Total Slots</div>
        <input className={`${styles['input-text']} ${styles[totalSlotStyle]}`} name = "totalSlots" type="text"  inputMode="numeric" onKeyDown={(e) =>  !/^[0-9\B]/.test(e.key) && e.preventDefault()}  minLength = "1" maxLength = "3" onChange={updateTotalSlots}  />
      </div>
      <div className={styles['input-frame']}>
        {/* Access Type */}
        <div className={styles['input-title']}>Access Type</div>
        <div className={styles['flexbox-wrap']}>
          <div 
            className={`${accessType === "Public" ? 
                          styles['filter-toggle-on'] : 
                          styles['filter-toggle-off']} ${styles['curved-border-right']}`}
            onClick={handleTabClick}>
            Public
          </div>
          <div 
            className={`${accessType === "Private" ? 
                          styles['filter-toggle-on'] : 
                          styles['filter-toggle-off']} ${styles['curved-border-left']}`}
            onClick={handleTabClick}>
              Private
          </div>
        </div>
      </div>
      {accessType === "Private" &&
      <div className={styles['input-frame']}>
        <div className={styles['report-content-wrap']}>
          <div className={styles['dropdown-option-wrap']}>
            <div className={styles['dropdown-selected']} onClick={() => setGroupSelectOpen(!groupSelectOpen)}>
              {selectedGroup.name}
              <DownOutlined className={styles['selected-icon']}/>
            </div>
            <div style={{maxHeight:"150px", overflow:"scroll", outlineStyle:"solid", marginInline:"3px"}} className={`${!groupSelectOpen ? styles['is-hidden'] : "" }`}>
              {ownedGroups.map((v) => {
                return (<div className={styles['dropdown-item']} onClick={() => setSelectedGroup(v)} key={v.id}>{v.name}</div>);
              })}
            </div>
          </div>
        </div>
      </div>
      }
      <div className={styles['input-frame']}>
        <div className={styles['banner-title-wrap']}>
          <div className={styles['input-title']}>Banner</div>
          <label onChange={updateBanner} htmlFor="bannerForm">
            <input name='' type='file' id='bannerForm' hidden/>
            <EditOutlined className={styles['upload-icon']}></EditOutlined>
          </label>
        </div>
        <div className={styles['banner-wrap']}>
          <div className={styles['banner']}>{bannerName}</div>
        </div>
      </div>
      <div className={styles['create-btn-wrap']}>
        <button className={styles["create-btn"]}  
        onClick={() =>{ 
          updateOwner(email);
          handleCreate(); 
          
          }  
        }>
          Create Event</button>
      </div>
    </div>
    </LoadScript>
  );
}

export default CreateEvent;