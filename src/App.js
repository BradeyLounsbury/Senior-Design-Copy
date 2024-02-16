import UserRegister from './pages/UserRegister.js';
import LandingPage from './pages/LandingPage.js';
import UserLogin from './pages/UserLogin.js';
import AboutUs from './pages/AboutUs.js';
import FAQ from './pages/FAQ.js';
import Dashboard from './pages/Dashboard.js';
import Events from './pages/Events.js';
import Groups from './pages/Groups.js';
import Profile from './pages/Profile.js';
import GettingStarted from './pages/GettingStarted';
import routes from './constants/Routes.js';
import { Route, Routes, Navigate } from 'react-router-dom';
import ChatsList from './pages/ChatsList.js';
import SingleChat from './pages/SingleChat.js';
import FindEvents from './pages/FindEvents.js';
import GroupInfo from './pages/GroupInfo.js';
import EventInfo from './pages/EventInfo.js';
import CreateEvent from './pages/CreateEvent.js';
import CreateGroup from './pages/CreateGroup.js';
import Calendar from './pages/Calendar';
import MoreInfo from './pages/MoreInfo';
import NotFound from './pages/NotFound.js';
import PrivacyPolicy from './pages/PrivacyPolicy.js';
import Search from './pages/Search.js';
// import PrivateRoutes from './components/PrivateRoutes.js';
import Layout from './components/Layout.js';

function App() {

  return (
      <Routes>
        <Route path='/' element={<Layout />}>
          {/* <Route element={<PrivateRoutes />}> */}
            <Route path={routes.groupInfo} element={<GroupInfo />} />
            <Route path={routes.eventInfo} element={<EventInfo />} />
            <Route path={routes.dashboard} element={<Dashboard />} />
            <Route path={routes.calendar} element={<Calendar />} />
            <Route path={routes.events} element={<Events />} />
            <Route path={routes.groups} element={<Groups />} />
            <Route path={routes.findEvents} element={<FindEvents />} />
            <Route path={routes.profile} element={<Profile />} />
            <Route path={routes.messages} element={<ChatsList/>} />
            <Route path={routes.chat} element={<SingleChat/>} />
            <Route path={routes.createEvent} element={<CreateEvent />} />
            <Route path={routes.createGroup} element={<CreateGroup />} />
            <Route path={routes.user} element={<Profile />} />
            <Route path={routes.search} element={<Search />} />
          {/* </Route> */}

          <Route path={routes.about} element={<AboutUs />} />
          <Route path={routes.contact} element={<AboutUs />} />
          <Route path={routes.moreInfo} element={<MoreInfo />} />
          <Route path={routes.faq} element={<FAQ />} />
          <Route path={routes.landing} element={<LandingPage/>}/>
          <Route path={routes.notFound} element={<NotFound />} />
          <Route path={routes.privacyPolicy} element={<PrivacyPolicy />} />
        </Route>
        <Route path={routes.register} element={<UserRegister />} />
        <Route path={routes.login} element={<UserLogin />} />
        <Route path={routes.gettingStarted} element={<GettingStarted />} />
        <Route path="*" element={<Navigate to={routes.notFound} />} />
        {/*
        Route is set up but the actual page for a public facing profile is not.
        The page will request a specific user's info based on the URL.
        <Route path={routes.user} element={<PublicProfile />} />
        */}
      </Routes>
  );
}

export default App;