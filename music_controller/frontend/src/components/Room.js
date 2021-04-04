import React, {useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router";
import {Grid, Button, Typography} from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";


const Room = (props) => {
    const roomCode = props.match.params.roomCode;
    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    const history = useHistory();


    useEffect(() => {
        getRoomDetails();
    }, []);

    function renderSettingsButton() {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => setShowSettings(true)}>
                Settings
                </Button>
            </Grid>
        );
    }

    // we display settings page instead of usual Room page in the event that we have set "showSettings" state to true
    // when user clicks settings button, that only shows up when they are the host.
    const SettingsPage = () => {
        return (
          <Grid container spacing={1}>
            <Grid item xs={12} align="center">
              {/*  currently using template of CreateRoomPage to allow user to edit room details. removed callback */}
              <CreateRoomPage
                update={true}
                votesToSkip={votesToSkip}
                guestCanPause={guestCanPause}
                roomCode={roomCode}
              />
            </Grid>
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="secondary"
                // once user closes settings page, re-fetch room details to display and don't show settings page (re-render)
                onClick={() => {
                    getRoomDetails();
                    setShowSettings(false);
                }}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        );
  }

    function getRoomDetails() {
        // pass in room code to template string to call backend api for a given room code and dynamically display since
        // when state is changed we'll re-render.
        fetch(`/api/get-room?code=${roomCode}`)
            .then((response) => {
                console.log("In Room.js called getRoomDetails....");
                // we do not want to render Room.js component if there is no room to display! data will not have attributes
                // that we are looking for (votes to skip, guest can pause, etc.)
                if (!response.ok) {
                    // invoke callback function on HomePage.js to clear room code so homepage doesn't attempt to redirect to
                    // room we left since user no longer is assigned a room code.
                    props.leaveRoomCallBack();
                    // redirect back to home.
                    history.push('/');
                }
                return response.json();
            })
            .then((data) => {
                setVotesToSkip(data.votes_to_skip);
                setGuestCanPause(data.guest_can_pause);
                setIsHost(data.is_host);
                console.log("Is the person host..?  [ " + data.is_host + "]");
                if (data.is_host) {
                    authenticateSpotify();
                }
            });


    }

    function authenticateSpotify() {
        console.log("Calling authenticate spotify....");
        fetch("/spotify/is-authenticated")
          .then((response) => response.json())
          .then((data) => {
            setSpotifyAuthenticated(data.status);
            console.log(data.status);
            if (!data.status) {
              fetch("/spotify/get-auth-url")
                .then((response) => response.json())
                .then((data) => {
                  window.location.replace(data.url);
                });
            }
          });
      }

    function leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
        };
        fetch("/api/leave-room", requestOptions).then((_response) => {
            props.leaveRoomCallBack();
            history.push("/");
        });
    }

    const RoomView = () => {
        return (
            <React.Fragment>
                <Grid item xs={12} align="center">
                <Typography variant="h4" component="h4">
                    Code: {roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Votes: {votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Guest Can Pause: {guestCanPause.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Host: {isHost.toString()}
                </Typography>
            </Grid>
            </React.Fragment>
        );
    }

    const LeaveButton = () => {
        return (
            <Grid item xs={12} align="center">
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={leaveButtonPressed}
                >
                    Leave Room
                </Button>
            </Grid>
        );
    }

    if (showSettings) {
        return (
            <SettingsPage/>
        );
    }
    return (
        <Grid container spacing={1}>
            <RoomView/>
            {/* if user is host we'll show button, otherwise we won't.*/}
            {isHost ? renderSettingsButton() : null}
            <LeaveButton/>
        </Grid>
    );
}
export default Room;