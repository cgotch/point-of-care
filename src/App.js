import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react';
import Amplify from '@aws-amplify/core';
import { makeStyles } from '@material-ui/core';
import API from '@aws-amplify/api';

const ADMIN_USER = "cgotch@colostate.edu";
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
}));

function App() {
  const classes = useStyles();
  const [admin, setAdmin] = useState(false);
  
  //my effects
  useEffect(() => {
    authorizeUser();
  },[]);

  //async functions
  async function authorizeUser(){
    const userInfo = await API.Auth.currentUserInfo();
    setAdmin(userInfo.attributes.email === ADMIN_USER);
  }

  return (
    <div className="classes.root">
      { admin === true && 
        <h1>
          adminUI
        </h1>
      }
      { admin === false && 
        <h1>
          patientUI
        </h1>
      }
    </div>
  );
}

export default withAuthenticator(App);
