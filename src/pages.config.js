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
import BatchDetail from './pages/BatchDetail';
import BatchProcessing from './pages/BatchProcessing';
import BatchUpload from './pages/BatchUpload';
import ForgotPassword from './pages/ForgotPassword';
import JobDetail from './pages/JobDetail';
import Jobs from './pages/Jobs';
import Landing from './pages/Landing';
import NewJob from './pages/NewJob';
import ReferenceDetail from './pages/ReferenceDetail';
import ReferenceMixAssistant from './pages/ReferenceMixAssistant';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import AdminAnalytics from './pages/AdminAnalytics';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "BatchDetail": BatchDetail,
    "BatchProcessing": BatchProcessing,
    "BatchUpload": BatchUpload,
    "ForgotPassword": ForgotPassword,
    "JobDetail": JobDetail,
    "Jobs": Jobs,
    "Landing": Landing,
    "NewJob": NewJob,
    "ReferenceDetail": ReferenceDetail,
    "ReferenceMixAssistant": ReferenceMixAssistant,
    "ResetPassword": ResetPassword,
    "Settings": Settings,
    "Dashboard": Dashboard,
    "Pricing": Pricing,
    "AdminAnalytics": AdminAnalytics,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};