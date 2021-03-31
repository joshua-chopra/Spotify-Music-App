import React, {useEffect, useState} from "react";
import {useHistory} from "react-router";
import { Grid, Button, Typography } from "@material-ui/core";


  const Room = (props) => {
      const roomCode = props.match.params.roomCode;
      const [votesToSkip, setVotesToSkip] = useState(2);
      const [guestCanPause, setGuestCanPause] = useState(false);
      const [isHost, setIsHost] = useState(false);
      const history = useHistory();

      useEffect(() => {
          getRoomDetails();
      }, [votesToSkip, guestCanPause, isHost]);


  function getRoomDetails() {
      // pass in room code to template string to call backend api for a given room code and dynamically display since
      // when state is changed we'll re-render.
    fetch(`/api/get-room?code=${roomCode}`)
      .then((response) => {
          // we do not want to render Room.js component if there is no room to display! data will not have attributes
          // that we are looking for (votes to skip, guest can pause, etc.)
          if (!response.ok) {
              // invoke callback function on HomePage.js to clear room code so homepage doesn't attempt to redirect to
              // room we left since user no longer is assigned a room code.
              props.leaveRoomCallBack();
              // redirect back to home.
              history.push('/');
          }
          return response.json()
      })
      .then((data) => {
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);
      });

  }

  function leaveButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      props.leaveRoomCallback();
      history.push("/");
    });
  }

    return (
      <Grid container spacing={1}>
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
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
}
export default Room;