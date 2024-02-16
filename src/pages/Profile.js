import {EditOutlined, FlagOutlined, DownOutlined} from '@ant-design/icons';
import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import { AccountContext } from '../components/Account';
import styles from './Profile.module.css';
import defaultAvatar from '../assets/default-avatar.png';
import { useNavigate, useParams } from "react-router-dom";
import routes from '../constants/Routes';
import Axios from 'axios';
import Pool from '../UserPool.js';
import TagsInput from 'react-tagsinput';
import CustomModal from '../components/CustomModal'
import { CognitoUser } from 'amazon-cognito-identity-js';
import {ModelessContext} from '../components/ConfirmationModeless';


function InputText(props)
{ 
  return (
      <div className={styles['info-frame']}>
        <div className={styles['profile-label']}>{props.label}</div>
        {props.canEdit ?
          <input 
          className={styles['input-text']} 
          type="text" 
          maxlength="40"
          value={props.text} 
          onChange={props.handleClick}/> 
        :
          <div className={styles['profile-text']}>{props.text}</div>
        }
      </div>
  );
}

function Profile() {
  const { getSession } = useContext(AccountContext);
  const modeless = useContext(ModelessContext);
  const navigate = useNavigate();
  let {userID} = useParams();

  const LoadProfileByID = (id) => {
    Axios.post('/api/getProfileByID', {
      id: id,
    }).then((response) => {
      setAge(response.data.age);
      setBio(response.data.bio);
      setGender(response.data.gender);
      setFirstName(response.data.firstName);
      setLastName(response.data.lastName)
      setPhoneNum(response.data.phone);
      setUserName(response.data.username);
      setFavorites(response.data.favorites);
      setEmail(response.data.email);
      if (response.data.isBanned) setIsBanned(true);
      else setIsBanned(false);
    }).catch((e) => {
      console.log(e);
    });  
  }

  const LoadProfile = (email) => {
    Axios.post('/api/getProfile', {
      email: email,
    }).then((response) => {
      setAge(response.data.age);
      setBio(response.data.bio);
      setGender(response.data.gender);
      setFirstName(response.data.firstName);
      setLastName(response.data.lastName)
      setPhoneNum(response.data.phone);
      setUserName(response.data.username);
      setFavorites(response.data.favorites);
      if (response.data.isBanned) setIsBanned(true);
      else setIsBanned(false);
    }).catch((e) => {
      console.log(e);
    });  
  }

  const LoadPFP = (id) => {
    Axios.post('/api/getPFP', {
      id: id,
    }).then((response) => {
      console.log(response);
      setProfilePic(response.data);
    })
  }

  useEffect(() => {
    getSession()
      .then((session) => {
        setEmail(session.idToken.payload.email);
        checkIsAdmin(session.idToken.payload.email);
        console.log("Session: ", session);
        Axios.post('/api/getProfile', {
          email: session.idToken.payload.email
        })
        .then((response) => {
          setViewerUID(response.data.userID);
          if(userID)
          {
            setOwnerUID(userID);
            LoadProfileByID(userID);
            LoadPFP(userID);
          }
          else
          {
            setOwnerUID(response.data.userID);
            LoadProfile(session.idToken.payload.email);
            LoadPFP(response.data.userID);
          }
        })
        .catch((err) => {
          console.log(err);
        })
      })
      .catch((err) => {
        console.error("Session error: ", err);
        navigate(routes.login);
      });
  }, []);
  
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [isEdit, setIsEdit] = useState(false);
  const [viewerUID, setViewerUID] = useState(""); // UID of who's viewing this profile
  const [ownerUID, setOwnerUID] = useState(""); // UID of profile owner
  const [firstName, setFirstName] = useState("N/A");
  const [lastName, setLastName] = useState("N/A");
  const [bio, setBio] = useState("N/A");
  const [userName, setUserName] = useState("N/A");
  const [email, setEmail] = useState("N/A");
  const [phoneNum, setPhoneNum] = useState("N/A");
  const [age, setAge] = useState("N/A");
  const [gender, setGender] = useState("N/A");
  const [favorites, setFavorites] = useState({tags: []});
  const [modalFavorites, setModalFavorites] = useState({tags: []});
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDropOpen, setReportDropOpen] = useState(false);
  const [reportInvalid, setReportInvalid] = useState(false);
  const [reportReason, setReportReason] = useState("Select Reason");
  const [reportComments, setReportComments] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [IsPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [resetStage, setResetStage] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [errorTxt, setErrorTxt] = useState("Something has failed!");
  const [VerifCode, setVerifCode] = useState("");


  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const handleSubmit = () => {
    // make backend call to save info
    setIsEdit(false);

    Axios.post('/api/updateProfile', {
      firstName: firstName,
      lastName: lastName,
      bio: bio,
      username: userName,
      email: email,
      phone: phoneNum,
      age: age,
      gender: gender,
      favorites: favorites
    }).then((response) => {
      modeless({isVisible: true, success: true, text:response.data});
      console.log(response.data);
    }).catch((e) => {
      modeless({isVisible: true, success: false, text:"Error updating profile"});
      console.log(e);
    });   
  }

  const handleCancel = () => {
    // make backend call to UID to set all states back to defaults
    setIsEdit(false)
  }

  const updateProfilePic = (e) => {
    if (ownerUID === viewerUID || isAdmin){
      let pfp = URL.createObjectURL(e.target.files[0]);
      console.log(pfp);
      console.log("updating profile picture. . . ");
      
      const form = new FormData();
      form.append('pfp', e.target.files[0]);
      form.append('id', ownerUID);
      console.log(form);

      Axios.post('/api/uploadPFP', form, { headers: {'Content-Type': 'multipart/form-data'}})
      .then((_) => {
        modeless({isVisible: true, success: true, text:'Profile picture updated'});
        setProfilePic(pfp);
      }).catch((err) => {
        console.log(err);
        modeless({isVisible: true, success: false, text:'Error updating profile picture'});
      })
    }
  }

  const updateFirstName = (e) => {setFirstName(e.target.value); console.log("Current first name: ", e.target.value);}
  const updateLastName = (e) => {setLastName(e.target.value); console.log("Current last name: ", e.target.value);}
  const updateBio = (e) => {setBio(e.target.value); console.log("Current Bio: ", e.target.value);}
  const updateUserName = (e) => {setUserName(e.target.value); console.log("Current Username: ", e.target.value);}
  const updatePhoneNum = (e) => {setPhoneNum(e.target.value); console.log("Current Phone Number: ", e.target.value);}
  const updateAge = (e) => {setAge(e.target.value); console.log("Current Age: ", e.target.value);}
  const updateGender = (e) => {setGender(e.target.value); console.log("Current Gender: ", e.target.value);}
  const updateFavorites = (tags) => { 
    setModalFavorites({tags: tags});
  }

  const handlePassModalCancel = () => {
    setIsPasswordModalOpen(false)
  }

  const getUser = () => {
    return new CognitoUser({
      Username: resetEmail.toLowerCase(),
      Pool
    });
  };

  const handleResetSubmit = () => {
    if (newPass === confirmPass){
      getUser().confirmPassword(VerifCode, confirmPass, {
        onSuccess: data => {
          modeless({isVisible: true, success: true, text:"Password successfully reset"});
          console.log("Password successfully reset!");
          setIsPasswordModalOpen(false);
        },
        onFailure: err => {
          console.error("Password failed to reset! : ", err);
          setErrorTxt(`Password failed to reset! ${err}`);
          setResetStage(3);
        }
      });
    }
    
  }

  const handleVerifSubmit = () => {
    getUser().forgotPassword({
      onSuccess: data => {
        console.log("Code sent successfully!");
        setResetStage(2);
      },
      onFailure: err => {
        console.error("Code fail to send! : ", err);
        setErrorTxt("Code failed to send!");
        setResetStage(3);
      }
    });
  }

  const handleModalCancel = () => { 
    setModalFavorites({tags: []});
    setModalOpen(false);
  }

  const handleModalSubmit = () => {
    setFavorites(modalFavorites);
    setModalOpen(false); 
  }

  const handleBanUser = () => {
    if (isBanned){
      Axios.post('/api/unbanUser', {
        email: email,
      }).then(() => {
        modeless({isVisible: true, success: true, text: "User Successfully unbanned"});
        setIsBanned(false);
      }).catch((e) => {
        modeless({isVisible: true, success: false, text: "Error unbanning user"});
        console.log(e);
      });
    }
    else{
      Axios.post('/api/banUser', {
        email: email,
      }).then(() => {
        modeless({isVisible: true, success: true, text: "User Successfully banned"});
        setIsBanned(true);
      }).catch((e) => {
        modeless({isVisible: true, success: false, text: "Error banning user"});
        console.log(e);
      });
    }
    setConfirmOpen(false);
  }

  const handleSelectReason = (e) => {
    setReportReason(e.target.innerText); 
    setReportDropOpen(false);
    setReportInvalid(false);
  }

  const handleReportUser = () => {
    if (reportReason === "Select Reason"){
      setReportInvalid(true);
    }
    else {
      Axios.post('/api/submitUserReport', {
        userID: ownerUID,
        reason: reportReason,
        comments: reportComments,
      }).then((response) => {
        modeless({isVisible: true, success: true, text: response.data});
        console.log(response);
      }).catch((e) => {
        modeless({isVisible: true, success: false, text: "Error reporting user"});
        console.log(e);
      });
      setReportOpen(false);
    }
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
    <div className={styles['profile-wrap']}>
      {(ownerUID !== viewerUID) && 
        <div className={styles['profile-top-wrap']}>
          <FlagOutlined className={styles['report-icon']}  onClick={() => {setReportOpen(true)}}/>
        </div>
      }
      <div className={styles['profile-pic-wrap']}>
          <img className={styles['img-profile-pic']} src={profilePic} onError={() => setProfilePic(defaultAvatar)} alt="Profile"/>
          {(ownerUID === viewerUID || isAdmin) && 
            <div className={styles['edit-wrap']}>
              <label onChange={updateProfilePic} htmlFor="formID">
                <input name='' type='file' id='formID' hidden />
                <EditOutlined className={styles['edit-icon']}/>
              </label>
            </div>
          }
        </div>
      <div className={styles['info-wrap']}>
        <InputText canEdit={(isEdit && (ownerUID === viewerUID || isAdmin))} label={"First Name"} text={firstName} handleClick={updateFirstName}/>
        <InputText canEdit={(isEdit && (ownerUID === viewerUID || isAdmin))} label={"Last Name"} text={lastName} handleClick={updateLastName}/>
        <div className={styles['info-frame']}>
          <div className={styles['profile-label']}>Bio</div>
          {(isEdit && ownerUID === viewerUID) ?
            <textarea className={styles['input-text-box']} rows="4" maxlength="150" onChange={updateBio}>
              {bio}
            </textarea> 
          :
            <div className={styles['profile-text']}>{bio}</div>
          }
        </div>
        <InputText canEdit={(isEdit && ownerUID === viewerUID)} label={"Username"} text={userName} handleClick={updateUserName}/>
        {(ownerUID === viewerUID || isAdmin) &&
          <div>
            <InputText canEdit={(isEdit && (ownerUID === viewerUID || isAdmin))} label={"Email"} text={email}/>
            <div className={styles['info-frame']}>
              <div className={styles['column-wrap']}>
                <div className={styles['profile-label']}>Password</div>
                <div className={styles['label-link']} onClick={() => {setIsPasswordModalOpen(true)}}>Change Password</div>
              </div>
              <div className={styles['pwd-text']}>*********</div>
            </div>
            <InputText canEdit={(isEdit && (ownerUID === viewerUID || isAdmin))} label={"Phone Number"} text={phoneNum} handleClick={updatePhoneNum}/>
          </div>
        }
        <InputText canEdit={(isEdit && (ownerUID === viewerUID || isAdmin))} label={"Age"} text={age} handleClick={updateAge}/>
        <InputText canEdit={(isEdit && (ownerUID === viewerUID || isAdmin))} label={"Gender"} text={gender} handleClick={updateGender}/>
        <div className={styles['info-frame']}>
          <div className={styles['profile-label']}>Interests</div>
          <div className={styles['column-wrap']}>
            { favorites.tags.length > 0 ?
              favorites.tags.map(function(val, idx){return (<div key={idx}className={styles['favorites-tag']}>{val}</div>)})
              :
              <div className={styles['profile-text']}>None</div>
            }
          </div>
          {(isEdit && ownerUID === viewerUID) && <button className={styles["favorites-btn"]} onClick={() => {
            setModalOpen(true);
            setModalFavorites(favorites);
            }}>
              Edit Interests
            </button>}
        </div>
      </div>
      <div className={styles['bottom-btn-wrap']}>
      {isAdmin ? 
        <>
          {isEdit ?
            <div>
              <button className={styles["cancel-btn"]} onClick={handleCancel}>Cancel</button>
              <button className={styles["save-btn"]} onClick={handleSubmit}>Save Changes</button>
            </div>
          :
            <div>
              {isAdmin && 
                <button className={styles["ban-btn"]} onClick={() => {setConfirmOpen(true)}}>
                  {isBanned ? "Unban User" : "Ban User"}
                </button>}
              {(ownerUID === viewerUID || isAdmin) && <button className={styles["edit-btn"]} onClick={() => {setIsEdit(true)}}>Edit Profile</button>}
              {ownerUID !== viewerUID && <button className={styles["message-btn"]} onClick={() => {navigate('/messages/'+ownerUID);}}>Message</button>}
            </div>
          }
        </>
      :
        <>
          {(isEdit && (ownerUID) === viewerUID) ?
            <div>
              <button className={styles["cancel-btn"]} onClick={handleCancel}>Cancel</button>
              <button className={styles["save-btn"]} onClick={handleSubmit}>Save Changes</button>
            </div>
          :
            <>
              {ownerUID === viewerUID && <button className={styles["edit-btn"]} onClick={() => {setIsEdit(true)}}>Edit Profile</button>}
              {ownerUID !== viewerUID && <button className={styles["message-btn"]} onClick={() => {navigate('/messages/'+ownerUID);}}>Message</button>}
            </>
          }
        </>
      }
      
      </div>
      <CustomModal 
        title="Reset Password"
        cancelTxt="Cancel" 
        submitTxt={resetStage === 1 ? "Send" : "Submit"} 
        isOpen={IsPasswordModalOpen} 
        handleClose={handlePassModalCancel}
        handleCancel={handlePassModalCancel}
        handleSubmit={resetStage === 1 ? handleVerifSubmit : handleResetSubmit}>
        {resetStage === 1 && // Email Stage
          <div className={styles['modal-input-frame']}>
            <div className={styles['modal-input-title']}>E-mail Address</div>
            <input className={styles['modal-input']} maxLength="30" onChange={(e) => setResetEmail(e.target.value)}/>
          </div> 
        }
        {resetStage === 2 && // Verification Stage
          <div className={styles['modal-input-frame']}>
            <div className={styles['modal-input-title']}>Verification Code</div>
            <input className={styles['modal-input']} maxLength="30" onChange={(e) => setVerifCode(e.target.value)}/>
            <div className={styles['modal-input-title']}>New Password</div>
            <input className={styles['modal-input']} type = "password" maxLength="30" onChange={(e) => setNewPass(e.target.value)}/>
            <div className={styles['modal-input-title']}>
              Confirm New Password
              <div className={newPass !== confirmPass ? styles['field-warning'] : styles['field-warning-hidden']}></div>
            </div>
            <input className={styles['modal-input']} type = "password" maxLength="30" onChange={(e) => setConfirmPass(e.target.value)}/>
          </div> 
        }
      </CustomModal>
      <CustomModal 
        title="Select Interests"
        cancelTxt="Cancel"
        submitTxt={"Save"} 
        isOpen={modalOpen} 
        handleClose={handleModalCancel}
        handleCancel={handleModalCancel}
        handleSubmit={handleModalSubmit}>
        <div className={styles['input-frame']}>
          <TagsInput  className={styles['input-tags']} value={modalFavorites.tags} onChange={updateFavorites}/>
        </div>
      </CustomModal>
      <CustomModal 
          title={isBanned ? "Unban User?" : "Ban User?"}
          cancelTxt="No"
          submitTxt={"Yes"} 
          isOpen={confirmOpen} 
          handleClose={() => {setConfirmOpen(false)}}
          handleCancel={() => {setConfirmOpen(false)}}
          handleSubmit={handleBanUser}>
          <div className={styles['confirm-content-wrap']}>
            Are you sure you want to {isBanned ? "unban" : "ban"} this user?
          </div>
        </CustomModal>
        <CustomModal 
          title="Report User"
          cancelTxt="Close"
          submitTxt={"Send"} 
          isOpen={reportOpen} 
          handleClose={() => {setReportOpen(false)}}
          handleCancel={() => {setReportOpen(false)}}
          handleSubmit={handleReportUser}>
          <div className={styles['report-content-wrap']}>
            <div className={styles['dropdown-option-wrap']}>
              <div className={`${styles['dropdown-selected']} ${(reportInvalid) && styles['red-border']}`} onClick={()=>{setReportDropOpen(!reportDropOpen)}}>
                {reportReason}
                <DownOutlined className={styles['selected-icon']}/>
              </div>
              <div className={`${!reportDropOpen ? styles['is-hidden'] : "" }`}>
                <div className={`${styles['dropdown-item']} ${styles['dropdown-item-top']}`} onClick={handleSelectReason}>Spamming</div>
                <div className={styles['dropdown-item']} onClick={handleSelectReason}>Promoting Terrorism</div>
                <div className={styles['dropdown-item']} onClick={handleSelectReason}>Threats of Violence</div>
                <div className={styles['dropdown-item']} onClick={handleSelectReason}>Sexual Activity</div>
                <div className={styles['dropdown-item']} onClick={handleSelectReason}>Privacy Violations</div>
                <div className={`${styles['dropdown-item']} ${styles['dropdown-item-bottom']}`} onClick={handleSelectReason}>Hateful Conduct</div>
              </div>
            </div>
            <div className={styles['input-frame']}>
              <div className={styles['input-title']}>Addtional Comments</div>
              <textarea className={styles['input-textarea']} rows='3' maxLength="250" onChange={(e) => {setReportComments(e.target.value)}}/>
            </div>
          </div>
        </CustomModal>
    </div>
  );
}

export default Profile;