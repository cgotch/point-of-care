import React from 'react';
import logo from './logo.svg';
import './App.css';
import {withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react';
import Amplify from '@aws-amplify/core';

function App() {
  return (
    <div className="App">
      <header>
        <img src={logo} className="App-logo" alt="logo"/>
        <h1>
          Now with Authentication
        </h1>
      </header>
      <AmplifySignOut>
      </AmplifySignOut>
    </div>
  );
}

export default withAuthenticator(App);
