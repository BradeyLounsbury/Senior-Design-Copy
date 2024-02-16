import {ArrowLeftOutlined, CheckOutlined, CloseOutlined, EyeInvisibleOutlined, EyeOutlined} from '@ant-design/icons';
import React, { useState, useContext } from 'react';
import UserPool from '../UserPool';
import styles from './UserRegister.module.css';
import routes from '../constants/Routes';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../components/CustomModal';
import TagsInput from 'react-tagsinput';
import EULA from '../components/EULA';
import Pool from '../UserPool';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { AccountContext } from '../components/Account.js';
import Axios from 'axios';
import {Input} from 'antd';
import { wait } from '@testing-library/user-event/dist/utils';


function UserRegister() {
  const navigate = useNavigate();
  //Modal Window Compenents
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("N/A");
  const [lastName, setLastName] = useState("N/A");
  const [username, setUsername] = useState("N/A");
  const [gender, setGender] = useState("N/A");
  const [age, setAge] = useState("N/A");
  const [phoneNum, setPhoneNum] = useState("N/A");
  const [bio, setBio] = useState("N/A");
  const [favorites, setFavorites] = useState({tags: []});
  const [userEmail, setUserEmail] = useState("");
  const [userPass, setUserPass] = useState("");
  const [fieldWarnings, setFieldWarnings] = useState({
    email: false,
    pass: false
  });
  const [modalStage, setModalStage] = useState(0);
  const [isEULAModalOpen, setIsEULAModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [expiredCode, setExpiredCode] = useState(false);
  const [hasAgreed, sethasAgreed] = useState(false);

  const getUser = () => {
    return new CognitoUser({
      Username: userEmail.toLowerCase(),
      Pool: Pool
    });
  };

  const updateUserEmail = (e) => {
    setUserEmail(e.target.value)
    console.log("Current Email: ", e.target.value);
  }

  const updateUserPass = (e) => {
    setUserPass(e.target.value)
    checkPassword(e.target.value)
    console.log("Current Pass: ", e.target.value);
  }

    //Possible Modal Window Stuff
    const updateFirstName = (e) => {setFirstName(e.target.value); console.log("Current Name: ", e.target.value);}
    const updateLastName = (e) => {setLastName(e.target.value); console.log("Current Name: ", e.target.value);}
    const updateUserBio = (e) => {setBio(e.target.value); console.log("Current Bio: ", e.target.value);}
    const updateUsername = (e) => {setUsername(e.target.value); console.log("Current Username: ", e.target.value);}
    const updateUserPhoneNum = (e) => {setPhoneNum(e.target.value); console.log("Current Phone Number: ", e.target.value);}
    const updateUserAge = (e) => {setAge(e.target.value); console.log("Current Age: ", e.target.value);}
    const updateUserGender = (e) => {setGender(e.target.value); console.log("Current Gender: ", e.target.value);}
    const updateUserFavorite = (tags) => { 
      setFavorites({tags: tags});
    }  
    
  const handleHasAgreed = (e) => {
    sethasAgreed(e.target.checked)
  };

  const signUp = (e) => {
    if (hasAgreed){
      setFieldWarnings({
        email: userEmail === "",
        pass: userPass === "",
      })
  
      let attributeList = [];
      UserPool.signUp(userEmail, userPass, attributeList, null, (err, data) => {
        if (err.name === 'UsernameExistsException') {
            console.error(err.message);
        }
        else {
            setIsEULAModalOpen(false);
            setModalStage(1);
            setIsCodeModalOpen(true);
        }
      });
    }
  }

  const resendCode = () => {
    getUser().resendConfirmationCode((err, data) => {
      if (data) {
        console.log("confirmation code sent");
      } else {
        console.error(err);
      }
    })
  }

  const submitCode = (e) => {
    if (code === "") {
      return;
    }
    getUser().confirmRegistration(code, false, (err, data) => {
      if (err.name === 'ExpiredCodeException') {
        setExpiredCode(true);
        console.error(err);
      }
      else {
        console.log("User verified successfully");
        setIsCodeModalOpen(false);
        setModalStage(2);
        setIsSetupModalOpen(true);
      }
    })
  }

  const { authenticate } = useContext(AccountContext);

  const submitUserInfo = () => {
    authenticate(userEmail, userPass) 
      .then((data) => {
        console.log("Logged in", data);
        Axios.post("/api/createProfile", {
          email: userEmail,
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
      })
      .catch((err) => {
        console.error("Login failed", err);
      });
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
  const doEula = (e) => {
    if( Boolean(checkPassword(userPass)) == true){
    return setIsEULAModalOpen(true)
    }
    else{

    }
  }
  return (
    <div className={styles["page-wrap"]}>
      <div className={styles["btn-top"]}>
      <div style={{ cursor:"pointer" }} onClick={() => navigate(routes.landing)}>
        <ArrowLeftOutlined className={styles['back-btn']}/>
      </div>
        
      </div>
      <div className={styles["center-body"]}>
        <div className={styles["body-title"]}>Register</div>
        <div className={styles["body-entry-field"]}>
            {/* Email */}
            <div className={styles["body-entry-box"]}>
              <div className={styles["entry-label"]}>
                Email
                <div className={fieldWarnings.email ? styles['field-warning'] : styles['field-warning-hidden']}>
                  Email is required
                </div>
              </div>
              <input className={styles["input-box"]}  type="text" id="email" onChange={updateUserEmail}/>
            </div>
          {/* Password */}
            <div className={styles["body-entry-box"]}>
              <div className={styles["entry-label"]}>
                Password
                <div className={fieldWarnings.pass ? styles['field-warning'] : styles['field-warning-hidden']}>
                  Password is required 
                </div>
                </div>
                <div className={styles['input-password']}>
                  <input className={styles["password-input"]} value =  {userPass}  type={isPassword ? "text" : "password"} id="password" onChange={updateUserPass}/>
                  <div className={styles['modal-input-eyeOutline']} onClick ={() => clickOutline()}>
                    {eyeOutline}
                </div>
                </div>
              <div className={styles["password-check-container"]}>
                <div className={styles[fontCapital]}>{outlineCapital}Must contain 1 uppercase letter</div>
                <div className={styles[fontLowercase]}>{outlineLowercase}Must contain 1 lowercase letter</div>
                <div className={styles[fontNumber]}>{outlineNumber}Must contain 1 number</div>
                <div className={styles[fontSpecial]}>{outlineSpecial}Must contain 1 special character</div>
                <div className={styles[fontLength]}>{outlineLength}Must be at least 8 characters long</div>
              </div>
            </div>
            
        </div>
          <button className={styles["btn-sign-up"]} onClick={() => doEula()}>SIGN UP</button>
          <div className={styles["body-links"]}>
            Have an account?
            <a href={routes.login} style={{ cursor:"pointer" }}>Sign in</a>
          </div>
          <div className={styles["body-links"]}>
            Need a new code?
            <a className={styles["code-link"]} onClick={() => {setIsCodeModalOpen(true); setModalStage(1); resendCode();}} style={{ cursor:"pointer" }}>Resend</a>
          </div>
      </div>
      {/* EULA */}
      {modalStage === 0 &&
        <CustomModal 
          title="Terms & Conditions"
          cancelTxt="Cancel" 
          submitTxt="Continue"
          isOpen={isEULAModalOpen} 
          handleClose={() => {setIsEULAModalOpen(false); sethasAgreed(false);}}
          handleCancel={() => {setIsEULAModalOpen(false); sethasAgreed(false);}}
          handleSubmit={signUp}>
            <div className={styles['eula-wrap']}>
              <EULA/>
            </div>
            <div className={styles['eula-checkbox']}>
              <input type="checkbox" id="eula" onClick={handleHasAgreed}/>
              <div className={!hasAgreed ? styles['field-warning'] : styles['field-warning-hidden']}></div>
              <label for="eula">I agree to the Terms and Conditions</label>
            </div> 
        </CustomModal>
      }
      
      {/* Code Verification */}
      {modalStage === 1 &&
        <CustomModal
          title={ (expiredCode) ? "That code is incorrect or has expired. Check your email and try again below"
          : "A verification code has been sent to your email. Please enter it below"
          }
          cancelTxt="Cancel" 
          submitTxt="Verify"
          isOpen={isCodeModalOpen}
          handleClose={() => {setIsCodeModalOpen(false); setExpiredCode(false);}}
          handleCancel={() => {setIsCodeModalOpen(false); setExpiredCode(false);}}
          handleSubmit={submitCode}>
            <div className={styles['code-wrap']}>
              <div className={styles['code-title']}>Code</div>
              <input className={styles['code-input']} maxLength="6" onChange={(e) => setCode(e.target.value)}/>
            </div>
        </CustomModal>
      }

      {/* UserSetup */}
      {modalStage === 2 && 
      <CustomModal 
        title="Profile Setup"
        cancelTxt="Cancel" 
        submitTxt= "Continue"
        isOpen={isSetupModalOpen} 
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
          if(firstName.length > 0 && lastName.length > 0) {
            setModalStage(3);
          }}
        }>
        <div className={styles['modal-input-frame']}>
          
            <div className={styles['modal-input-title']}>First Name</div>
            <input className={styles['modal-input']}  placeholder = "Required" maxLength="30" onChange={(e) => setFirstName(e.target.value)}/>
            
            <div className={styles['modal-input-title']}>Last Name</div>
            <input className={styles['modal-input']} id="LastName" name="LastName" placeholder = "Required" maxLength="30" onChange={(e) => setLastName(e.target.value)}/>
          </div> 
    </CustomModal>
    }
    {modalStage === 3 && 
      <CustomModal 
      title="Profile Setup Part 2"
      cancelTxt="Go Back" 
      submitTxt= "Continue"
      isOpen={isSetupModalOpen} 
      //Closes Modal window
      handleClose= {() => {
        setIsSetupModalOpen(false);
        }
      }
      handleCancel= {() => {
        setModalStage(2);
        }
      }
      //Next Modal Window
      handleSubmit={() => {
        setModalStage(4)
        }
      }>
        <div className={styles['modal-input-frame']}>
            <div className={styles['modal-input-title']}>Username</div>
            <input className={styles['modal-input']} placeholder = "Optional" maxLength="30" onChange={(e) => setUsername(e.target.value)}/>
          </div> 
    </CustomModal>
    }
    {modalStage === 4 && 
      <CustomModal 
      title="Profile Setup Part 3"
      cancelTxt="Go Back" 
      submitTxt= "Submit"
      isOpen={isSetupModalOpen} 
      //Closes Modal window
      handleClose= {() => {
        setIsSetupModalOpen(false);
        }
      }
      handleCancel= {() => {
        setModalStage(3);
        }
      }
      //
      handleSubmit={() => {
        submitUserInfo();
        }
      }>
        <div className={styles['modal-input-frame']}>
            <div className={styles['modal-input-title']}>Gender</div>
            <input className={styles['modal-input']} placeholder = "Optional" maxLength="30" onChange={(e) => setGender(e.target.value)}/>
            <div className={styles['modal-input-title']}>Age</div>
            <input className={styles['modal-input']} placeholder = "Optional" maxLength="2" onChange={(e) => setAge(e.target.value)}/>
            <div className={styles['modal-input-title']}>Phone Number</div>
            <input className={styles['modal-input']} placeholder = "Optional" maxLength="10" onChange={(e) => setPhoneNum(e.target.value)}/>
            <div className={styles['modal-input-title']}>Bio</div>
            <textarea className={styles['modal-input-bio']} placeholder = "Optional" maxLength="500" onChange={(e) => setBio(e.target.value)}/>
            <div className={styles['modal-input-title']}>Favorites</div>
            <div className={styles['input-frame']}>
            <TagsInput  className={styles['input-tags']} value={favorites.tags} onChange={(tags) => setFavorites({tags: tags})}/>
            </div>
        </div> 
    </CustomModal>
    }
    </div>
  );
}

export default UserRegister;
