import {
    InfoCircleOutlined,
    CrownOutlined,
    TeamOutlined,
    SettingOutlined, 
    EditOutlined,
    UserAddOutlined,
    CaretDownOutlined,
    CaretUpOutlined,
    CheckOutlined,
    CloseOutlined
  } from '@ant-design/icons';
  import React, { useState, useContext, useEffect, useRef } from 'react';
  import styles from './GroupInfo.module.css';
  import defaultBanner from '../assets/tennis-court.jpg';
  import defaultAvatar from '../assets/default-avatar.png';
  import { AccountContext } from '../components/Account';
  import { useNavigate, useParams, useLocation } from "react-router-dom";
  import routes from '../constants/Routes';
  import Axios from 'axios';
  import CustomModal from '../components/CustomModal';
  import {Autocomplete, LoadScript} from '@react-google-maps/api';
  import {ModelessContext} from '../components/ConfirmationModeless';
  import TagsInput from 'react-tagsinput';
  

  function GroupInfo() {

    const DenyRequest = (id) => {
      Axios.post("/api/decideGroupRequest", {
        accept: false,
        userID: id,
        groupID: groupID
      })
      .then((response) => {
        modeless({isVisible: true, success: true, text: "Denied join request"});
        let newRequests = Object.assign({}, requests);
        delete newRequests[id];
        setRequests(newRequests);
      })
      .catch((err) => {
        modeless({isVisible: true, success: false, text: "Failed to deny join request"});
      })
    }

    const ConfirmRequest = (id) => {
      Axios.post("/api/decideGroupRequest", {
        accept: true,
        userID: id,
        groupID: groupID
      })
      .then((response) => {
        modeless({isVisible: true, success: true, text: "User added to group"});
        let newRequests = Object.assign({}, requests);
        delete newRequests[id];
        setRequests(newRequests);
      })
      .catch((err) => {
        modeless({isVisible: true, success: false, text: "Failed to add user to group"});
      })
    }

    const RequestItem = (props) => {

      return(
        <div className={styles['request-item']}>
          <span style={{cursor:"pointer"}} onClick={() => navigate("/user/" + props.userID)}>{props.name}</span>
          <div style={{color:"#074F57", fontSize:"24px"}}>
            <CheckOutlined onClick={() => ConfirmRequest(props.userID)} style={{marginRight:"8px"}}/>
            <CloseOutlined onClick={() => DenyRequest(props.userID)}/>
          </div>
        </div>
      )
    };

    const { getSession } = useContext(AccountContext);
    const modeless = useContext(ModelessContext);
    const navigate = useNavigate();
    const {groupID} = useParams();
    const [email, setEmail] = useState("");
    const [hasJoined, setHasJoined] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [requests, setRequests] = useState({});

    useEffect(() => {
      getSession()
        .then((session) => {
            console.log("Session: ", session);
            setEmail(session.idToken.payload.email);
            checkIsAdmin(session.idToken.payload.email);
            // Compares group with list of groups viewer has joined
            Axios.post('/api/grabPrivGroups', {
              email: session.idToken.payload.email,
            })
            .then((response) => {
              Axios.post('/api/isGroupOwner', {
                id: groupID,
                email: session.idToken.payload.email,
              }).then((response) => {
                setIsOwner(response.data);
              }).catch((err) => {
                console.error(err);
              })
              for (let i = 0; i < response.data.length; i++) {
                if (response.data.at(i).Item.id === groupID) {
                  setHasJoined(true);
                }
              }
            }).catch((e) => {
              console.error(e);
            });
        })
        .catch((err) => {
            console.error("Session error: ", err);
            navigate(routes.login);
        })

      Axios.post("/api/getGroup", {
        groupID: groupID,
      }).then((response) => {
        console.log("Group Successfully Retrieved");
        setGroupTitle(response.data.Item.title);
        setNewTitle(response.data.Item.title);
        setGroupDesc(response.data.Item.desc);
        setNewDesc(response.data.Item.desc);
        setGroupSlots(response.data.Item.roster.length);
        setActivities(response.data.Item.activities);
        setNewActivities(response.data.Item.activities);
        setOwnerID(response.data.Item.owner);
        Axios.post('/api/memberNames', {
          members: response.data.Item.roster,
        }).then((response) => {
          setGroupMembers(response.data);
        }).catch((err) => {
          modeless({isVisible: true, success: false, text: "Couldn't grab members"});
          console.error(err)
        })
      }).catch((e) => {
            console.error(e);
      });
      
      Axios.post('/api/grabGroupOwner', {
        id: groupID,
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

      Axios.post('/api/getGroupBanner', {
        id: groupID,
      }).then((response) => {
        setBanner(response.data);
      }).catch((err) => {
        console.error(err);
      })

      Axios.post('/api/getGroupRequests', {
        id: groupID
      })
      .then((response) => {
        let promises = [];
        let reqs = {};
        Object.keys(response.data).forEach(key => {
          let promise = Axios.post('/getUsername', {
            id: key
          });
          promises.push(promise);
          
          promise
          .then((response) => {
            reqs[key] = ({name:response.data, userID:key});
          })
          .catch((err) => {})
        })

        Promise.allSettled(promises)
        .then(([result]) => {
          setRequests(reqs);
        })
      })
      .catch((err) => {})
    }, []);
  
    const [ownerPic, setOwnerPic] = useState(defaultAvatar);
    const [ownerName, setOwnerName] = useState("Owner Name");
    const [ownerID, setOwnerID] = useState("");
    const [activities, setActivities] = useState({tags: []});
    const [userPics, setUserPics] = useState([defaultAvatar]);
    const [banner, setBanner] = useState(defaultBanner);
    const [groupTitle, setGroupTitle] = useState("Group Name");
    const [groupDesc, setGroupDesc] = useState("None");
    const [groupSlots, setGroupSlots] = useState(0);
    const [groupMembers, setGroupMembers] = useState([[,]]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isRemoveModal, setIsRemoveModal] = useState(false);
    const [removeMember, setRemoveMember] = useState(""); // member to be removed
    const [isOwner, setIsOwner] = useState(false);

    const [newTitle, setNewTitle] = useState(groupTitle);
    const [newDesc, setNewDesc] = useState(groupDesc);
    const [newActivities, setNewActivities] = useState(activities);
    const [titleStyle, setTitleStyle] = useState("modal-input");
    const [newBanner, setNewBanner] = useState("");
    const [newBannerName, setNewBannerName] = useState("");
    const [requestsOpen, setRequestsOpen] = useState(false);

    const [adminDelete, setAdminDelete] = useState(false);
  
    const handleJoinClick = () => {
      console.log("Joining group. . .");
      Axios.post('/api/requestJoinGroup', {
          email: email,
          groupID: groupID,
      }).then((response) => {
        modeless({isVisible: true, success: true, text: "Request sent"});
      }).catch((err) => {
        modeless({isVisible: true, success: false, text:"Error sending request"});
        console.error(err);
      });
    }

    const handleLeaveClick = () => { 
      console.log("Leaving group. . .");
      Axios.post('/api/leaveGroup', {
          email: email,
          id: groupID,
      }).then((response) => {
          console.log(response.data);
          setHasJoined(false);        
      }).catch((err) => {
          console.error(err);
      });
    }

    const handleEditClick = () => {
      setIsEditOpen(true);
    }

    const updateActivites = (tags) => {
      setNewActivities({tags: tags});
    }

    const handleMember = (member) => {
      setRemoveMember(member);
      setIsRemoveModal(true);
    }

    const updateNewBanner = (e) => {
      console.log(e.target.files[0]);
      setNewBanner(e.target.files[0]);
      setNewBannerName(e.target.files[0].name)
    }

    const confirmRemove = () => {
      Axios.post('/api/removeMember', {
        id: groupID,
        member: removeMember[0],
      }).then((response) => {
        modeless({isVisible: true, success: true, text: `${removeMember[1]} has been removed`});
        let idx = groupMembers.indexOf(removeMember)
        let temp = groupMembers;
        temp.splice(idx, 1);
        setGroupMembers(temp);
        setIsRemoveModal(false);
      }).catch((err) => {
        modeless({isVisible: true, success: false, text: `Couldn't remove ${removeMember[1]}`});
        console.error(err);
        setIsRemoveModal(false);
      })
    }

    const submitEdit = () => {
      checkTitle();
      if(checkTitle() == true){
        let tempMembers = [];
        for (let i = 0; i < groupMembers.length; i++) {
          tempMembers.push(groupMembers[i][0]);
        }
        Axios.post('/api/updateGroup', {
          id: groupID,
          title: newTitle,
          desc: newDesc,
          members: tempMembers,
          activities: newActivities,
        })
        .then((response) => {
          modeless({isVisible: true, success: true, text: "Updated group successfully!"});
          console.log("updated group!");
          setGroupTitle(newTitle);
          setGroupDesc(newDesc);
          setGroupMembers(tempMembers);
          setActivities(newActivities);
        })
        .catch((err) => {
          modeless({isVisible: true, success: false, text: "Error editing group"});
          console.error(err);
        })
  
      if (newBanner !== "") {
        const form = new FormData();
        form.append('banner', newBanner);
        form.append('id', groupID);
        console.log(form);

        Axios.post('/api/uploadGroupBanner', form, {headers: {'Content-Type': 'multipart/form-data'}})
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
      else{
        console.log('Invalid Title Input ');
      }
    }

    const checkTitle =  (e) => {
      if(newTitle.trim() == '' ){
        setTitleStyle("incorrect-text");
        return false;
      }
      setTitleStyle("modal-input");
      return true;
    }

    const setClose = () =>{
      setTitleStyle("modal-input");
      setIsEditOpen(false);
    }

    const submitDelete = () => {
      if (adminDelete) {
        Axios.post('/api/getProfileByID', {
          id: ownerID,
        }).then((response) => {
          console.log("Owner successfully located");
          Axios.post('/api/deleteGroup', {
            id: groupID,
            email: response.data.email, // owners email
          })
          .then(() => {
            console.log("Group successfully deleted")
            modeless({isVisible: true, success: true, text: "Group Succesfully Deleted"});
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
        Axios.post('/api/deleteGroup', {
          id: groupID,
          email: email,
        })
        .then(() => {
          modeless({isVisible: true, success: true, text: "Group Succesfully Deleted"});
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
        <div className={styles['group-top']}>
          <div className={styles['img-owner-wrap']}>
            <img className={styles['img-owner']} src={ownerPic} onError={() => setOwnerPic(defaultAvatar)} alt="Owner Avatar"/>
          </div>
          <div className={styles['column-title-wrap']}>
            <div className={styles['group-title']}>{groupTitle}</div>
            {isAdmin && <SettingOutlined className={styles['admin-settings-icon']} onClick={() => {setModalOpen(true)}}/>}
          </div>
        </div>
        <div className={styles['group-info-frame']}>
          <div className={styles['column-wrap']}>
          <div className={styles['icon-wrap']}><InfoCircleOutlined className={styles['info-icon']}/></div>
            <div className={styles['group-label']}>About</div>
          </div>
          <div className={styles['group-text']}>{groupDesc}</div>
        </div>     

        <div className={styles['group-info-frame']}>
          <div className={styles['column-wrap']}>
          <div className={styles['icon-wrap']}><CrownOutlined className={styles['info-icon']}/></div>
            <div className={styles['group-label']}>Owner</div>
          </div>
          <div className={styles['group-text']}>{ownerName}</div>
        </div>

        <div className={styles['group-info-frame']}>
          <div className={styles['column-wrap']}>
          <div className={styles['icon-wrap']}><TeamOutlined className={styles['info-icon']}/></div>
            <div className={styles['group-label']}>Members</div>
          </div>
          <div className={styles['members-info']}>
          { groupMembers.length > 0 ?
            groupMembers.map(function(val, idx) {return <div key={idx} className={styles['members-tag-page']} onClick={() => {viewUserProfile(val[0])}}> {val[1]} </div>})
            :
            <div className={styles['members-none']}>None</div>
          }
        </div>
        </div>

        <div className={styles['group-info-frame']}>
          <div className={styles['column-wrap']}>
          <div className={styles['icon-wrap']}><InfoCircleOutlined className={styles['info-icon']}/></div>
            <div className={styles['group-label']}>Activities</div>
          </div>
          <div className={styles['activitiesInfo']}>
            {activities.tags.length > 0 ?
             activities.tags.map(function(val, idx) {return <div key={idx} className={styles.activityTag}> {val} </div>})
             :
             <div className={styles.activitiesNone}>None</div>
            }
          </div>
        </div>   
        
        {isOwner && 
        <div className={styles['group-info-frame']}>
          <div className={styles['column-wrap']}>
          <div className={styles['icon-wrap']}><UserAddOutlined className={styles['info-icon']}/></div>
            <div className={styles['group-label']} onClick={() => setRequestsOpen(!requestsOpen)} style={{cursor:"pointer"}}>
              Join Requests
              {requestsOpen ? <CaretUpOutlined/> : <CaretDownOutlined/>}
            </div>
          </div>
          {requestsOpen &&
          <div className={styles['requests-list']}>
            {requests ? Object.keys(requests).map((key) => (
              <RequestItem name={requests[key].name} userID={requests[key].userID} key={key}/>
            )) : {}}
          </div>
          }
        </div>   
        }

        <div className={styles['join-backdrop']}>
          
          { hasJoined && !isOwner && 
            <button className={styles["leave-btn"]} onClick={handleLeaveClick}>Leave Group</button>
          }
          { !hasJoined && !isOwner &&
            <button className={styles["join-btn"]} onClick={handleJoinClick}>Request To Join</button>
          }
          { isOwner &&
            <button className={styles["edit-btn"]} onClick={handleEditClick}>Edit Group</button>
          }
        </div>
        <CustomModal
        title={`${groupTitle} edit`}
        cancelTxt="Cancel" 
        submitTxt= "Confirm"
        isOpen={isEditOpen} 
        //Closes Modal window
        handleClose= {() => {setClose()}}
        handleCancel= {() =>{setClose()}}
        handleSubmit={() => {submitEdit()}}>
          <div className={styles['modal-input-frame']}>
            <div className={styles["modal-input-title"]}>Title</div>
            <input className={styles[titleStyle]} placeholder = {groupTitle} maxLength='30' onChange={(e) => {setNewTitle(e.target.value)}}/>
            <div className={styles['modal-input-title']}>About</div>
            <textarea className={styles['modal-input']} placeholder = {groupDesc} maxLength='250' rows='3' onChange={(e) => {setNewDesc(e.target.value)}}/>
            <div className={styles['modal-input-title']}>Members</div>
            <div className={styles['members-modal']}>
              { groupMembers.length > 0 ?
                groupMembers.map(function(val, idx) {return <div key={idx} className={styles['members-tag']} onClick={() => handleMember(val)}> {val[1]} </div>})
                :
                <div className={styles['members-none']}>None</div>
              }
            </div>
            <div className={styles['modal-input-title']}>Activities</div>
            <div className={styles['members-modal']}>
              <TagsInput className={styles['modalActivityTag']} value={newActivities.tags} onChange={updateActivites}/>
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
        <CustomModal
        title={`Are you sure you want to remove ${removeMember[1]} from ${groupTitle}?`}
        cancelTxt="Cancel" 
        submitTxt= "Confirm"
        isOpen={isRemoveModal} 
        //Closes Modal window
        handleClose= {() => {setIsRemoveModal(false)}}
        handleCancel= {() =>{setIsRemoveModal(false)}}
        handleSubmit={() => {confirmRemove()}}></CustomModal>
        <CustomModal 
          title="Admin Controls"
          cancelTxt="Cancel"
          submitTxt={"Save Changes"} 
          isOpen={modalOpen} 
          handleClose={() => {
            setNewActivities({tags: []});
            setModalOpen(false);
          }}
          handleCancel={() => {
            setNewActivities({tags: []});
            setModalOpen(false);
          }}
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
              <div className={styles['input-title']}>Activities</div>
              <TagsInput  className={styles['input-tags']} value={newActivities.tags} onChange={updateActivites}/>
            </div>
            <div className={styles['delete-wrap']}>
              <div className={styles['delete-btn']} onClick={() => {
                setAdminDelete(true);
                setConfirmOpen(true);
              }}>Delete Group</div>
            </div>
          </div>
        </CustomModal>
        <CustomModal 
          title="Delete Group"
          cancelTxt="No"
          submitTxt={"Yes"} 
          isOpen={confirmOpen} 
          handleClose={() => {setConfirmOpen(false)}}
          handleCancel={() => {setConfirmOpen(false)}}
          handleSubmit={submitDelete}>
          <div className={styles['confirm-content-wrap']}>
            Are you sure you want to delete this group?
          </div>
        </CustomModal>
      </div>
    );
  }
  
  export default GroupInfo;