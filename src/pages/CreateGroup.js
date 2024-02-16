import React, { useState, useContext, useEffect } from 'react';
import { AccountContext } from '../components/Account';
import TagsInput from 'react-tagsinput';
import Axios from 'axios';
import { useNavigate } from "react-router-dom";
import styles from './CreateGroup.module.css';
import 'react-tagsinput/react-tagsinput.css';
import routes from '../constants/Routes';
import {ModelessContext} from '../components/ConfirmationModeless';
import { EditOutlined } from '@ant-design/icons';

function CreateGroup() {
  const { getSession } = useContext(AccountContext);
  const modeless = useContext(ModelessContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const updateOwner = (userEmail) => {
    Axios.post("/api/getProfile", {
      email: userEmail,
    }).then((response) => {
      setOwner(response.data.username);
      setOwnerUID(response.data.userID);
    }).catch((e) => {
      console.log(e);
    });  
  }

  useEffect(() => {
    getSession()
      .then((session) => {
          console.log("Session: ", session);
          updateOwner(session.idToken.payload.email);
          setEmail(session.idToken.payload.email);
      })
      .catch((err) => {
          console.error("Session error: ", err);
          navigate(routes.login);
      })
  });

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [activities, setActivities] = useState({tags: []});
  const [owner, setOwner] = useState("");
  const [ownerUID, setOwnerUID] = useState("");
  const [titleStyle, setTitleStyle] = useState("input-text");
  const [banner, setBanner] = useState("");
  const [bannerName, setBannerName] = useState("");
  

  const updateTitle = (e) => {
    setTitle(e.target.value);
    console.log("Current Title: ", e.target.value);
  }

  const updateDesc = (e) => {
    setDesc(e.target.value);
    console.log("Current Desc: ", e.target.value);
  }

  const updateActivities = (tags) => {
    setActivities({tags: tags});
    console.log("Current Desc: ", tags);
  }

  const updateBanner = (e) => {
    console.log(e.target.files[0]);
    setBanner(e.target.files[0]);
    setBannerName(e.target.files[0].name);
  }

  const handleCreate = () => {
    checkTitle();
    if(checkTitle() == true){
    console.log("Creating New Group . . .", [title, desc, activities]);
    Axios.post('/api/createGroup', {
      email: email,
      title: title, 
      desc: desc, 
      activities: activities,
      roster: [ownerUID],
      owner: ownerUID
    }).then((response) => {
      console.log(response);
      if (banner !== "") {
        const form = new FormData();
        form.append('banner', banner);
        form.append('id', response.data);
        console.log(form);
  
        Axios.post('/api/uploadGroupBanner', form, {headers: {'Content-Type': 'multipart/form-data'}})
        .then((_) => {
          setBanner(URL.createObjectURL(banner));
          setBanner("");
          setBannerName("");
        }).catch((err) => {
          console.log(err);
          modeless({isVisible: true, success: false, text:'Error uploading banner'});
        })
      }
      modeless({isVisible: true, success: true, text: "Group successfully created"});
    }).catch((e) => {
      modeless({isVisible: true, success: false, text: "Error creating group"});
      console.log(e);
    });
  }
  else{
    console.log('Invalid Title Input ');
  }
}

  const checkTitle =  (e) => {
    if(title == ""){
      setTitleStyle("incorrect-text");
      return false;
    }
    setTitleStyle("input-text");
    return true;
  }


  return (
    <div className={styles['page-wrap']}>
      <h2 className={styles['page-title']}>Create a new group</h2>
      <div className={styles['input-frame']}>
        <div className={styles['input-title']}>Title</div>
        <input className={styles[titleStyle]} maxLength="30" onChange={updateTitle}/>
      </div>
      <div className={styles['input-frame']}>
        <div className={styles['input-title']}>Description</div>
        <textarea className={styles['input-textarea']} rows='3' maxLength="250" onChange={updateDesc}/>
      </div>
      <div className={styles['input-frame']}>
        <div className={styles['input-title']}>Activities</div>
        <TagsInput  className={styles['input-tags']} value={activities.tags} onChange={updateActivities}/>
      </div>
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
          Create Group</button>
      </div>
    </div>
  );
}

export default CreateGroup;