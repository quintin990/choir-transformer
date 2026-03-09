/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import AdminAnalytics from './pages/AdminAnalytics';
import ApiDocs from './pages/ApiDocs';
import AudioEnhancement from './pages/AudioEnhancement';
import BatchDetail from './pages/BatchDetail';
import BatchProcessing from './pages/BatchProcessing';
import BatchUpload from './pages/BatchUpload';
import BillingCancel from './pages/BillingCancel';
import BillingSuccess from './pages/BillingSuccess';
import Choir from './pages/Choir';
import ChoirAdmin from './pages/ChoirAdmin';
import ChoirAdminMembers from './pages/ChoirAdminMembers';
import ChoirAdminSong from './pages/ChoirAdminSong';
import ChoirCreate from './pages/ChoirCreate';
import ChoirHub from './pages/ChoirHub';
import ChoirJoin from './pages/ChoirJoin';
import ChoirMemberDashboard from './pages/ChoirMemberDashboard';
import ChoirPart from './pages/ChoirPart';
import ChoirSetlists from './pages/ChoirSetlists';
import ChoirSongDetail from './pages/ChoirSongDetail';
import ChoirSongs from './pages/ChoirSongs';
import ForgotPassword from './pages/ForgotPassword';
import JobDetail from './pages/JobDetail';
import Jobs from './pages/Jobs';
import Landing from './pages/Landing';
import Match from './pages/Match';
import Pricing from './pages/Pricing';
import ProjectDetail from './pages/ProjectDetail';
import ProjectNew from './pages/ProjectNew';
import ProjectsList from './pages/ProjectsList';
import QueueManager from './pages/QueueManager';
import ReferenceDetail from './pages/ReferenceDetail';
import ReferenceNew from './pages/ReferenceNew';
import ResetPassword from './pages/ResetPassword';
import SetlistManager from './pages/SetlistManager';
import Settings from './pages/Settings';
import StemsNew from './pages/StemsNew';
import StemsNewV2 from './pages/StemsNewV2';
import Workspaces from './pages/Workspaces';
import ChoirDashboard from './pages/ChoirDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminAnalytics": AdminAnalytics,
    "ApiDocs": ApiDocs,
    "AudioEnhancement": AudioEnhancement,
    "BatchDetail": BatchDetail,
    "BatchProcessing": BatchProcessing,
    "BatchUpload": BatchUpload,
    "BillingCancel": BillingCancel,
    "BillingSuccess": BillingSuccess,
    "Choir": Choir,
    "ChoirAdmin": ChoirAdmin,
    "ChoirAdminMembers": ChoirAdminMembers,
    "ChoirAdminSong": ChoirAdminSong,
    "ChoirCreate": ChoirCreate,
    "ChoirHub": ChoirHub,
    "ChoirJoin": ChoirJoin,
    "ChoirMemberDashboard": ChoirMemberDashboard,
    "ChoirPart": ChoirPart,
    "ChoirSetlists": ChoirSetlists,
    "ChoirSongDetail": ChoirSongDetail,
    "ChoirSongs": ChoirSongs,
    "ForgotPassword": ForgotPassword,
    "JobDetail": JobDetail,
    "Jobs": Jobs,
    "Landing": Landing,
    "Match": Match,
    "Pricing": Pricing,
    "ProjectDetail": ProjectDetail,
    "ProjectNew": ProjectNew,
    "ProjectsList": ProjectsList,
    "QueueManager": QueueManager,
    "ReferenceDetail": ReferenceDetail,
    "ReferenceNew": ReferenceNew,
    "ResetPassword": ResetPassword,
    "SetlistManager": SetlistManager,
    "Settings": Settings,
    "StemsNew": StemsNew,
    "StemsNewV2": StemsNewV2,
    "Workspaces": Workspaces,
    "ChoirDashboard": ChoirDashboard,
}

export const pagesConfig = {
    mainPage: "AdminAnalytics",
    Pages: PAGES,
    Layout: __Layout,
};