# Event Planner

## **Client** - Nasseef Abukamail

## **Team Name** - "Click to Add Title"

## **Team Members & Roles**
* Justin Murray - Team Leader
* Bradey Lounsbury - Release Manager
* Gyver Blessing - Quality Assurance
* Justin Adie - Documentation Manager

## Description

The Event Planner is a webapp that allows for users to coordinate events with other users.

## Technologies Used  
* ReactJS 

## Current Features  
* Events listing page ( interactive )
* Groups listing page ( interactive )
* Dashboard ( interactive )
* Landing Page / FAQ / About Us

## Upcoming Features  
* Database integration
* User authentication
* Functional redirects
* New pages ( Find events, Direct messages )

## Setup Guide

1. ) Clone / Pull Repository  

2. ) Download additional assets and place them into the assets folder ( link found in 'assets/info.txt' )  

3. ) Navigate to the root directory and run the following command: 'npm install'

4. ) Then run: 'npm start' (you should only have to do this step once you've done 1-3 to start it again)

5. ) Open a new terminal and cd into ./server directory and run 'npm run dev'

## Changelog

#Sprint 1
* Initial creation of app
* Added UI for all logged out pages
* Static page routing

#Sprint 2
* Added UI for some logged in pages
* Created components/pages for groups and events
* Added dynamic page routing ( without any user authentication )
* Creation of node backend running an Express server
* Misc test API calls

#Sprint 3
* Created DynamoDB and connected to express server
* Integrated user authentication for registration and sign in
* More logged in UI for various user pages
* Created some basic API calls for creating new events / groups
* Misc code cleanup

#Winter Break
* Added event / group creation page
* Added event / group creation link as additional drop-down items into the existing header

#Sprint 4
* Added working user sessions ( post log-in )
* Integrated user authentication for registration and sign in
* Added back-end functionality to adding events / groups to DB
* Added back-end functionality to query events from DB and display them on events / groups pages
* Added custom modal component to be used for various purposes throughout the site
* Added 2-stage password reset mdoals and link to account login page
* Added functionality to filters and pagination to events page
* Updated thumbnail for "Find Events" tab on dashboard
* Added calendar page
* Added notifications to global navigation bar
* Added name as requirement for signing up on registration page

#Sprint 5
* Added Profile Setup upon registration 
* General UI cleanup
* Added ability to join events and groups
* Added ability to leave events and groups 
* Updated email verification to require verification code
* Added EULA to sign up
* Connect browser notifications to AWS
* Added ownership to events and groups
* Added a more information page

#Sprint 6
* App is now publicly hosted and deployed on AWS
* Added owner controls to events & groups
* Added front-end for admin controls
* Added chat message functionality 
* Added ability to delete events & groups
* Find Events connected to backend and functional
* Added pagination functionality to groups page
* Added placeholder animations to make app look nicer
* Increased Error Checking
* General Server Architecture Cleanup

#Sprint 7
* Ability to upload profile pictures for users
* Ability to upload banners for groups and events
* Added functional report button to profiles
* Added password reset to profile page
* Made listed participant usernames clickable links that redirect to user profiles
* Made password obfuscated for sign-on
* Added visual feedback for creating passwords
* UI improvements for mobile calendar
* Improved error checking through the app in general
* Added ability to request to join groups and associated private events

#Sprint 8
* Admin controls functionality added
* Profile pics added to groups page
* Stage life for event listings added
* Added profile pics to chats
* General UI Improvements for desktop and mobile
* Updated FAQ information
* Added privacy policy page
* Added search for events, groups, users
* General bug fixes
