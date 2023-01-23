import { useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PageRender from "./customRouter/PageRender";
import PrivateRouter from "./customRouter/PrivateRouter"

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Alert from "./components/alert/alert";
import Header from "./components/header/Header";
import StatusModal from "./components/StatusModal";
import CallModal from "./components/message/CallModal";

import {useSelector, useDispatch} from 'react-redux';
import {refreshToken } from './redux/actions/authAction';
import { getPosts } from './redux/actions/postAction';
import { getSuggestions } from "./redux/actions/suggestionsAction";
import { getNotifies } from "./redux/actions/notifyAction";
import { GLOBALTYPES } from "./redux/actions/globalTypes";

import io from 'socket.io-client';
import SocketClient from './SocketClient';
import Peer from 'peerjs';


function App() {
  const { auth, status, modal,call} = useSelector(state => state);
  const dispatch = useDispatch();


  //for user auth and realtime render
  useEffect(()=>{
    dispatch(refreshToken());
    const socket = io();
    dispatch({type: GLOBALTYPES.SOCKET, payload: socket});
    return () => socket.close();
  },[dispatch])


  //for loading posts and suggestion on homepage
  useEffect(()=>{
    if(auth.token){
      dispatch(getPosts(auth.token))
      dispatch(getSuggestions(auth.token))
      dispatch(getNotifies(auth.token))
    }
  },[dispatch, auth.token])


  useEffect(()=>{
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }
      else if (Notification.permission === "granted") {}
  
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {}
        });
      }
  },[])

  //peer generating
  useEffect(() =>{
    const newPeer = new Peer(undefined, {
      path:'/', secure:true
    })
    dispatch({ type: GLOBALTYPES.PEER, payload: newPeer});
  },[dispatch])


  return (
    <Router>
      
      <Alert/>

      <input type="checkbox" id="theme" />
        <div className={`App ${(status || modal) && 'mode'}`}>
          <div className="main">
            {auth.token && <Header/>}
            {status && <StatusModal />}
            {auth.token && <SocketClient />}
            {call && <CallModal/>}

            <Route exact path="/" component={auth.token ? Home : Login}/>
            <Route exact path="/register" component={Register}/>
            
            <div className="wrap_page">
              <PrivateRouter exact path="/:page" component={PageRender}/>
              <PrivateRouter exact path="/:page/:id" component={PageRender}/>
            </div>

          </div>
        </div>
        
    </Router>
  );
}

export default App;