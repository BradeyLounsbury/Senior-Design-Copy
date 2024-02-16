
import routes from '../constants/Routes.js';
import { useNavigate } from "react-router-dom"
import styles from './LandingPage.module.css';
import {ModelessContext} from '../components/ConfirmationModeless';
import React, {useContext} from 'react';

function SignUpTile()
{
    const navigate = useNavigate();

    const handleTileClick = (sender) => {
      console.log("Current sender: ", sender);
      switch(sender) {
        case 'Register': navigate(routes.register); break;
        case 'Login': navigate(routes.login); break;
        default: break;
      }
    }

    return (
        <div className={styles['sign-up-tile']}>
            <span style={{fontSize:'32px', fontWeight:'bolder'}}>Get together</span><br/>
            <span style={{fontSize:'20px', fontWeight:'bold'}}>Plan your next big event, invite your friends</span>
            <div style={{marginTop:'20px'}}>
                <div className={styles['landing-page-btn']} style={{background:'#074F57', color:'white', cursor:"pointer"}} onClick={() => handleTileClick("Register")}>
                    Create an Account</div>
                <div className={styles['landing-page-btn']} style={{background:'white', color:'#074F57', cursor:"pointer"}} onClick={() => handleTileClick("Login")}>
                    Sign in</div>
            </div>
        </div>
    );
}

function FindOutMoreTile()
{
    const navigate = useNavigate();
    return (
        <div className={styles['find-out-more-tile']}>
            <span style={{fontSize:'32px', fontWeight:'bolder'}}>Find out more</span><br/>
            <span style={{fontSize:'20px', fontWeight:'bold'}}>See what features Event Planner has to offer</span>
            <div style={{marginTop:'20px'}}>
                <div className={styles['landing-page-btn']} style={{background:'#074F57', color:'white', cursor:"pointer"}} onClick={() => navigate(routes.moreInfo)}>More Information</div>
            </div>
        </div>
    );
}

function GetStartedTile()
{
    const navigate = useNavigate();

    const handleTileClick = (sender) => {
      console.log("Current sender: ", sender);
      switch(sender) {
        case 'GettingStarted': navigate(routes.gettingStarted); break;
        default: break;
      }
    }

    return (
        <div className={styles['get-started-tile']}>
            <div style={{width:'max-content', marginLeft:'auto'}}>
                <span style={{fontSize:'36px', fontWeight:'bold'}}>Event Planner</span>
                <div style={{fontSize:'16px', fontWeight:'bold', width:'170px'}}>A free and easy tool for organizing events online</div>
            </div>
            <div style={{marginTop:'30px', marginLeft:'auto', width:'max-content'}}>
                <div className={styles['landing-page-btn']} style={{background:'white', color:'#074F57', cursor:"pointer"}} onClick={() => handleTileClick("GettingStarted")}>
                    Get Started</div>
            </div>
        </div>
    );
}

function LandingPage()
{
    const contextType = useContext(ModelessContext);

    return (
        <div className='landing-page'>
            <GetStartedTile/>
            <SignUpTile/>
            <FindOutMoreTile/>
        </div>
    );
}

export default LandingPage;