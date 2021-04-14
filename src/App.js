import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react';
import Amplify from '@aws-amplify/core';
import { AppBar, Button, Container, Grid, Icon, IconButton, Input, makeStyles, Paper, TextField, Toolbar, Typography } from '@material-ui/core';
import API from '@aws-amplify/api';
import MenuIcon from '@material-ui/icons/Menu';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import clsx from 'clsx';

const ADMIN_USER = "cgotch@colostate.edu";
const initialFormState = {name: '', description: '', owner: ''};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  appBarSpacer: theme.mixins.toolbar,
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display:'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  button: {
    width: 100,
    marginBottom: 10,
  },
}));

function App() {
  const classes = useStyles();
  const [admin, setAdmin] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const fixedHeightPaper = clsx(classes.paper,classes.fixedHeight);
  
  //my effects
  useEffect(() => {
    authorizeUser();
  },[]);

  //async functions
  async function authorizeUser(){
    const userInfo = await API.Auth.currentUserInfo();
    setAdmin(userInfo.attributes.email !== ADMIN_USER);
  }

  async function createRecord(){

  }

  async function handleFileLoad(e){

  }

  return (
    <div className="classes.root">
      { admin === true && 
        <h1>
          adminUI
        </h1>
      }
      { admin === false && 
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" className="classes.menuButton" color="inherit">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className="classes.title">
              Point of Care Patient Portal
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={0} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          <div className={classes.appBarSpacer}/>
            <Container maxWidth="lg" className="classes.container">
              <Grid container spacing={3}>
                <Grid item xs={12} md={8} lg={9}>
                  <Paper className={fixedHeightPaper}>
                    <TextField
                      required={true}
                      variant="outlined"
                      onChange={e => setFormData({...formData, 'name': e.target.value})}
                      placeholder="Create a new Record"
                      value={formData.name}
                      style={{width: 300, marginBottom: 10}}
                    />
                    <TextField
                      variant="outlined"
                      onChange={e => setFormData({...formData, 'description': e.target.value})}
                      placeholder="Record Description"
                      value={formData.description}
                      style={{width: 400, marginBottom: 10}}
                    />
                    <Button variant="contained" color="primary" onClick={createRecord} className={classes.button}>
                      Create
                    </Button>
                    <Input type="file" onChange={handleFileLoad} color="primary"/>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
        </main>
        </div>
      }
    </div>
  );
}

export default withAuthenticator(App);
