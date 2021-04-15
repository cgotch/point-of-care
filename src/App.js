import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import {withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react';
import Amplify from '@aws-amplify/core';
import {AppBar, Button, Container, Grid, Icon, IconButton, Input, makeStyles, Paper, TextField, Toolbar, Typography} from '@material-ui/core';
import {API, Storage} from 'aws-amplify';
import MenuIcon from '@material-ui/icons/Menu';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import clsx from 'clsx';
import { Email, Search } from '@material-ui/icons';
import {DataGrid} from '@material-ui/data-grid';
import {listRecords} from './graphql/queries';
import {createRecord as createRecordMutation, deleteRecord as deleteRecordMutation} from './graphql/mutations';
import {v4 as uuidv4} from 'uuid';

const ADMIN_USER = "cgotch@colostate.edu";
const columns = [
  {field: 'name', headerName: 'Name', width: 250},
  {field: 'description', headerName: 'Description', flex: 1},
];
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
  userText: {
    color: theme.palette.text.secondary,
  },
}));

function App() {
  const classes = useStyles();
  const [admin, setAdmin] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const fixedHeightPaper = clsx(classes.paper,classes.fixedHeight);
  const [email, setEmail] = useState('');
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [image, setImage] = useState('');
  const [currentImage, setCurrentImage] = useState(false);

  //my effects
  useEffect(() => {
    authorizeUser();
  },[]);

  useEffect(() => {
    fetchRecords();
  },[]);

  //async functions
  async function authorizeUser(){
    const userInfo = await API.Auth.currentUserInfo();
    setAdmin(userInfo.attributes.email === ADMIN_USER);
    setEmail(userInfo.attributes.email);
  }

  async function createRecord(){
    if (!formData.name || !formData.description) {
      return;
    }
    formData.owner = email;
    await API.graphql({query: createRecordMutation, variables: {input: formData}});
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    if (!formData.id) {
      formData.id = uuidv4();
    }
    formData.owner = email;
    setRecords([...records, formData]);
    setFormData(initialFormState);
    fetchRecords();
    setImage(false);
  }

  async function handleFileLoad(e){
    if (!e.target.files[0]) {
      return;
    }
    const file = e.target.files[0];
    setFormData({...formData, image: file.name});
    await Storage.put(file.name, file);
    fetchRecords();
  }

  async function fetchRecords(){
    let userMail = email;
    let isAdmin = admin;
    let userInfo;
    if (userMail === ''){
      userInfo = await API.Auth.currentUserInfo();
      userMail = userInfo.attributes.email;
    }
    if (isAdmin === false) {
      isAdmin = userInfo.attributes.email === ADMIN_USER;
    }
    const apiData = await API.graphql({query: listRecords});
    if (apiData.data.listRecords.items.length !== 0) {
      const recordsFromAPI = apiData.data.listRecords.items;
      await Promise.all(recordsFromAPI.map(async record => {
        if (record.image) {
          const image = await Storage.get(record.image);
          record.image = image;
        }
        return record;
      }))
      //filter the records for non admins
      if (isAdmin) {
        if (search !== '') {
          setRecords(apiData.data.listRecords.items.filter(x => x.name.includes(search)));
        }
        else {
          setRecords(apiData.data.listRecords.items);
        }
      }
      else {
        const filteredRecords = apiData.data.listRecords.items.filter(x => x.owner === userMail);
        setRecords(filteredRecords);
      }
    }
  }

  function onRowClick(rowData){
    if (rowData.row.image !== '') {
      setCurrentImage(true);
      setImage(rowData.row.image);
    }
  }

  function searchRecords(filter){
    setSearch(filter);
    fetchRecords();
  }

  return (
    <div className="classes.root">
      { admin === true && 
        <div>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" className={classes.menuButton} color="inherit">
                <MenuIcon/>
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Point of Care Admin Portal: {email}
              </Typography>
              <IconButton color="inherit">
                <Badge badgeContent={0} color="secondary">
                  <NotificationsIcon/>
                </Badge>
              </IconButton>
            </Toolbar>
          </AppBar>
          <main className={classes.content}>
            <div className={classes.appBarSpacer}/>
            <Container maxWidth="lg" className={classes.container}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined" 
                    onChange={e => searchRecords(e.target.value)}
                    placeholder="Search"
                    value={search}
                    style={{width: 300, marginRight: 10}}
                  />
                  <Button variant="contained" color="primary" className={classes.button} onClick={e => searchRecords(e.target.value)}>
                    Search
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    <div style={{height: 250, width: '100%'}}>
                      <DataGrid
                        rows={records}
                        columns={columns}
                        pageSize={5}
                        disableSelectionOnClick={true}
                        onRowClick={(rowData) => onRowClick(rowData)}
                      />
                    </div>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    {currentImage && <img src={image}/>}
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </main>
        </div>
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
                <Grid item xs={12} md={4} lg={3}>
                  <Paper className={fixedHeightPaper}>
                    <Typography component="h2" variant="h6" color="primary" gutterBottom>
                      Portal User
                    </Typography>
                    <div>
                      <Typography component="p" variant="h6">
                        Username:
                      </Typography>
                    </div>
                    <div>
                    <Typography className={classes.userText} component="p">
                        {email}
                    </Typography>
                    </div>
                    <div>
                      <Typography component="p" variant="h6">
                        Email:
                      </Typography>
                    </div>
                    <div>
                    <Typography className={classes.userText} component="p">
                        {email}
                    </Typography>
                    </div>
                    <div style={{marginTop: 10, width: 50}}>
                      <AmplifySignOut/>
                    </div>
                  </Paper>
                </Grid>
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
                      style={{width: 300, marginBottom: 10}}
                    />
                    <Button variant="contained" color="primary" onClick={createRecord} className={classes.button}>
                      Create
                    </Button>
                    <Input type="file" onChange={handleFileLoad} color="primary"/>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    <div style={{height: 250, width: '100%'}}>
                      <DataGrid 
                        rows={records}
                        columns={columns}
                        pageSize={5}
                        disableSelectionOnClick={true}
                        onRowClick={(rowData) => onRowClick(rowData)}/>
                    </div>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    {currentImage && <img src={image}/>}
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
