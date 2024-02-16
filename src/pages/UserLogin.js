import {ArrowLeftOutlined, CheckOutlined, CloseOutlined} from '@ant-design/icons';
import styles from './UserLogin.module.css';
import React, { useState, useContext } from 'react';
import { AccountContext } from '../components/Account.js';
import routes from '../constants/Routes';
import CustomModal from '../components/CustomModal'
import { useNavigate } from 'react-router-dom';
import Pool from '../UserPool';
import { CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from '../UserPool';
import TagsInput from 'react-tagsinput';
import Axios from 'axios';
import {EyeInvisibleOutlined, EyeOutlined} from '@ant-design/icons';
import {Input} from 'antd';

function UserLogin() {
  const navigate = useNavigate();
  const [resetStage, setResetStage] = useState(1);
  const [setupStage, setSetupStage] = useState(1);
  const [VerifCode, setVerifCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [errorTxt, setErrorTxt] = useState("Something has failed!");
  const [IsPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [IsSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("Optional");
  const [phoneNum, setPhoneNum] = useState("");
  const [bio, setBio] = useState("");
  const [favorites, setUserFavorites] = useState({tags: []});
  const [userPass, setUserPass] = useState("");
  const [fieldWarnings, setFieldWarnings] = useState({
    email: false,
    pass: false
  });
  

  const { authenticate } = useContext(AccountContext);

  const getUser = () => {
    return new CognitoUser({
      Username: resetEmail.toLowerCase(),
      Pool
    });
  };

  const sendVerifCode = () => {
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
  };

  const resetPass = () => {
    if (newPass === confirmPass){
      getUser().confirmPassword(VerifCode, confirmPass, {
        onSuccess: data => {
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
  };

  const handleVerifSubmit = () => {
    console.log("Sending verification code to: ", resetEmail);
    sendVerifCode();
  }

  const handleResetSubmit = () => {
    console.log("Resetting Password");
    resetPass();
  }

  const handleModalCancel = () => {
    setResetEmail("");
    setResetStage(1);
    setIsPasswordModalOpen(false);
  }

  const submitUserInfo = (e) => {
    setFieldWarnings({
      email: userEmail === "",
      pass: userPass === "",
    })

    authenticate(userEmail, userPass) 
    .then((data) => {
      Axios.post('/api/getProfile', {
        email: userEmail.toLowerCase(),
      })
      .then((response) => {
        if (response.data === "user not in db") {
          openSetupModal();
        } else {
          console.log("logged in: ", data);
          if (response.data.isBanned){
            const user = Pool.getCurrentUser();
            if (user) { user.signOut() };
            navigate(routes.landing);
          } 
          else navigate(routes.dashboard);
        }
      })
      .catch((err) => {
        console.error(err);
      })
    })
    .catch((err) => {
      console.error("Login failed", err);
    });
      
  }

  const submitUserToDB = () => {
    Axios.post("/api/createProfile", {
      email: userEmail.toLowerCase(),
      age: age,
      bio: bio,
      favorites: favorites,
      gender: gender,
      firstName: firstName,
      lastName: lastName,
      phone: phoneNum,
      username: username,
    })
    .then((response) => {
      console.log(response.data);
      navigate(routes.dashboard);
    })
    .catch((err) => {
      console.error("Failed to add user to db", err);
    });
  }

  const openSetupModal = () => {
    setSetupStage(1);
    setIsSetupModalOpen(true);
    setIsPasswordModalOpen(false);
  }

  const [outlineCapital, setOutlineCapital] = useState();
  const [outlineLowercase, setOutlineLowercase] = useState();
  const [outlineNumber, setOutlineNumber] = useState();
  const [outlineSpecial, setOutlineSpecial] = useState();
  const [outlineLength, setOutlineLength] = useState();
  const [fontLength, setfontLength] = useState("correct-check");
  const [fontCapital, setfontCapital] = useState("correct-check");
  const [fontLowercase, setfontLowercase] = useState("correct-check");
  const [fontNumber, setfontNumber] = useState("correct-check");
  const [fontSpecial, setfontSpecial] = useState("correct-check");
  const [eyeOutline, setEyeOutline] = useState(<EyeInvisibleOutlined></EyeInvisibleOutlined>);
  const [switcha, setSwitch] = useState(false);
  const [isPassword, setPasswordValue] = useState(false)

  const clickOutline = () => {
    if(switcha){
      setPasswordValue(false)
      setSwitch(false);
      setEyeOutline((<EyeInvisibleOutlined></EyeInvisibleOutlined>))
    }
    else{
      setSwitch(true);
      setPasswordValue(true);
      setEyeOutline(<EyeOutlined></EyeOutlined>)
    }
    return eyeOutline
  }
  const checkPassword = (e) => {
    var bool = true;
    //checks capitals
    if(Boolean(e.match(/[A-Z]/)) === true){
      setOutlineCapital(<CheckOutlined/>)
      setfontCapital("")
    }
    else{
      setOutlineCapital(<CloseOutlined/>)
      setfontCapital("incorrect-check")
      bool = false
    }
    //Checks numbers
    if(Boolean(e.match(/[0-9]/)) === true){
      setOutlineNumber(<CheckOutlined/>)
      setfontNumber("")
    }
    else{
      setOutlineNumber(<CloseOutlined/>)
      setfontNumber("incorrect-check")
      bool = false
    }
    //Checks lowercase
    if(Boolean(e.match(/[a-z]/)) === true){
      setOutlineLowercase(<CheckOutlined/>)
      setfontLowercase("")
    }
    else{
      setOutlineLowercase(<CloseOutlined/>)
      setfontLowercase("incorrect-check")
      bool = false
    }
    //Checks length
    if(e.length >= 8 ){
      setOutlineLength(<CheckOutlined/>)
      setfontLength("")
    }
    else{
      setOutlineLength(<CloseOutlined/>)
      setfontLength("incorrect-check")
      bool = false
    }
    //Checks special characters
    if(Boolean(e.match(/[!@#$%^&*()_=+`~\-{}[\]\|;:'"/,.<>?\\]/)) === true){
      setOutlineSpecial(<CheckOutlined/>)
      setfontSpecial("")
    }
    else{
      setOutlineSpecial(<CloseOutlined/>)
      setfontSpecial("incorrect-check")
      bool = false
    }
    return bool
  }

  const updateFirstName = (e) => {setFirstName(e.target.value); console.log("Current Name: ", e.target.value);}
  const updateLastName = (e) => {setLastName(e.target.value); console.log("Current Name: ", e.target.value);}
  const updateUserBio = (e) => {setBio(e.target.value); console.log("Current Bio: ", e.target.value);}
  const updateUsername = (e) => {setUsername(e.target.value); console.log("Current Username: ", e.target.value);}
  const updateUserPhoneNum = (e) => {setPhoneNum(e.target.value); console.log("Current Phone Number: ", e.target.value);}
  const updateUserAge = (e) => {setAge(e.target.value); console.log("Current Age: ", e.target.value);}
  const updateUserGender = (e) => {setGender(e.target.value); console.log("Current Gender: ", e.target.value);}
  const updateUserFavorite = (tags) => { 
    setUserFavorites({tags: tags});
  }
  return (
    <div className={styles["page-wrap"]}>
      <div className={styles["btn-top"]}>
      <div style={{ cursor:"pointer" }} onClick={() => navigate(routes.landing)}>
        <ArrowLeftOutlined className={styles['back-btn']}/>
        </div>
      </div>
      <div className={styles["center-body"]}>
        <div className={styles["body-title"]}>Log In</div>
        <div className={styles["body-entry-field"]}>
          <div className={styles["body-entry-box"]}>
            <div className={styles["entry-label"]}>
              Email
              <div className={fieldWarnings.email ? styles['field-warning'] : styles['field-warning-hidden']}>
                Email is required
              </div>
            </div>
            <input className={styles["email-input"]} type="text" id="email" onChange={(e) => setUserEmail(e.target.value)}/>
          </div>
          <div className={styles["body-entry-box"]}>
            <div className={styles["entry-label"]}>
              Password
              <div className={fieldWarnings.pass ? styles['field-warning'] : styles['field-warning-hidden']}>
                Password is required
              </div>
            </div>
            <div className={styles['input-password']}> 
            <input className={styles["password-input"]}  type={isPassword ? "text" : "password"} onChange={(e) => setUserPass(e.target.value)}/>
            <div className={styles['modal-input-eyeOutline']} onClick ={() => clickOutline()}>
            {eyeOutline}
            </div>
            </div>
          </div>
          <div className={styles["forgot-pass-link"]} onClick={() => setIsPasswordModalOpen(true)}>Forgot Password?</div>
          <button className={styles["btn-login"]} onClick={submitUserInfo}>LOG IN</button>
          <div className={styles["body-links"]}>
            <a href={routes.register} style={{ cursor:"pointer" }}>Don't have an account?</a>
          </div>
        </div>
      </div>
      {resetStage !== 3 ? 
        <CustomModal 
        title="Reset Password"
        cancelTxt="Cancel" 
        submitTxt={resetStage === 1 ? "Send" : "Submit"} 
        isOpen={IsPasswordModalOpen} 
        handleClose={handleModalCancel}
        handleCancel={handleModalCancel}
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
            {/* <div className={styles['modal-input-password']}> */}
            <input className={styles['modal-input']} type = "password" maxLength="30" onChange={(e) => {setNewPass(e.target.value); {checkPassword(e.target.value)}}} />
            {/* <div className={styles['modal-input-eyeOutline']}> */}
            {/* <EyeInvisibleOutlined></EyeInvisibleOutlined> {eyeOutline}
            </div>
            </div>  */}
            <div className={styles["password-check-container"]}>
                <div className={styles[fontCapital]}>{outlineCapital}Must contain 1 uppercase letter</div>
                <div className={styles[fontLowercase]}>{outlineLowercase}Must contain 1 lowercase letter</div>
                <div className={styles[fontNumber]}>{outlineNumber}Must contain 1 number</div>
                <div className={styles[fontSpecial]}>{outlineSpecial}Must contain 1 special character</div>
                <div className={styles[fontLength]}>{outlineLength}Must be at least 8 characters long</div>
              </div>
            <div className={styles['modal-input-title']}>
              Confirm New Password
              <div className={newPass !== confirmPass ? styles['field-warning'] : styles['field-warning-hidden']}></div>
            </div>
            {/* <div className={styles['modal-input-password']}> */}
            <input className={styles['modal-input']} type = "password" maxLength="30" onChange={(e) => setConfirmPass(e.target.value)}/>
            {/* <div className={styles['modal-input-eyeOutline']}>
            <EyeInvisibleOutlined></EyeInvisibleOutlined>
            </div>
            </div> */}
          </div> 
        }
      </CustomModal>
      :
      <CustomModal 
        title="Error"
        cancelTxt="Close" 
        isOpen={IsPasswordModalOpen} 
        handleClose={handleModalCancel}
        handleCancel={handleModalCancel}>
          <div className={styles['modal-input-frame']}>
            <div className={styles['error-txt']}>{errorTxt}</div>
          </div> 
      </CustomModal>
      }
      {/* Setup User  */}
    {setupStage === 1 && 
      <CustomModal 
        title="Profile Setup"
        cancelTxt="Cancel" 
        submitTxt= "Continue"
        isOpen={IsSetupModalOpen} 
        //Closes Modal window
        handleClose= {() => {
          setIsSetupModalOpen(false);
          }
        }
        handleCancel= {() => {
          setIsSetupModalOpen(false);
          }
        }
        //Next Modal Window
        handleSubmit={() => {
          if(firstName.length > 0 && lastName.length>0);
          setSetupStage(2);
          }
        }>
        <div className={styles['modal-input-frame']}>
            <div className={styles['modal-input-title']}>First Name</div>
            <input className={styles['modal-input']}  placeholder = "Required" maxLength="30" onChange={(e) => setFirstName(e.target.value)}/>
            
            <div className={styles['modal-input-title']}>Last Name</div>
            <input className={styles['modal-input']} id="LastName" name="LastName" placeholder = "Required" maxLength="30" onChange={(e) => setLastName(e.target.value)}/>
          </div> 
    </CustomModal>
    }
    {setupStage === 2 && 
      <CustomModal 
      title="Profile Setup Part 2"
      cancelTxt="Go Back" 
      submitTxt= "Continue"
      isOpen={IsSetupModalOpen} 
      //Closes Modal window
      handleClose= {() => {
        setIsSetupModalOpen(false);
        }
      }
      handleCancel= {() => {
        setSetupStage(1);
        }
      }
      //Next Modal Window
      handleSubmit={() => {
        setSetupStage(3)
        }
      }>
        <div className={styles['modal-input-frame']}>
            <div className={styles['modal-input-title']}>Username</div>
            <input className={styles['modal-input']} placeholder = "Optional" maxLength="30" onChange={(e) => setUsername(e.target.value)}/>
          </div> 
    </CustomModal>
    }
    {setupStage === 3 && 
      <CustomModal 
      title="Profile Setup Part 3"
      cancelTxt="Go Back" 
      submitTxt= "Submit"
      isOpen={IsSetupModalOpen} 
      //Closes Modal window
      handleClose= {() => {
        setIsSetupModalOpen(false);
        }
      }
      handleCancel= {() => {
        setSetupStage(2);
        }
      }
      //
      handleSubmit={() => {
        submitUserToDB();
        }
      }>
        <div className={styles['modal-input-frame']}>
            <div className={styles['modal-input-title']}>Gender</div>
            <input className={styles['modal-input']} placeholder = "Optional" maxLength="30" onChange={(e) => setGender(e.target.value)}/>
            <div className={styles['modal-input-title']}>Age</div>
            <input className={styles['modal-input']} placeholder = "Optional" maxLength="30" onChange={(e) => setAge(e.target.value)}/>
            <div className={styles['modal-input-title']}>Phone Number</div>
            <input className={styles['modal-input']} placeholder = "Optional" maxLength="10" onChange={(e) => setPhoneNum(e.target.value)}/>
            <div className={styles['modal-input-title']}>Bio</div>
            <textarea className={styles['modal-input-bio']} placeholder = "Optional" maxLength="500" onChange={(e) => setBio(e.target.value)}/>
            <div className={styles['modal-input-title']}>Favorites</div>
            <div className={styles['input-frame']}>
            <TagsInput  className={styles['input-tags']} value={favorites.tags} onChange={(tags) => setUserFavorites({tags: tags})}/>
            </div>
        </div> 
    </CustomModal>
    }
    </div>
  );
}

export default UserLogin;