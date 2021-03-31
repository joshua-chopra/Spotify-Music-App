import React, {Component, useEffect, useState} from "react";
import {
    Button,
    Grid,
    Typography,
    TextField,
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {useHistory} from "react-router-dom";

// take in properties (we'll use them later)

// note on ES6 arrow functions,
// const b = () => { return 'hello' }; //arrow Fn /w braces needs a return statement to return anything
// const c = () => 'hello';            //shorthand arrow Fn w/o braces returns whatever the arrow points to

// so here, arrow function will return JSX and RoomJoinPage is called in HomePage.js and the JSX is rendered.
const RoomJoinPage = (props) => {
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("");

  function roomButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: roomCode
      }),
    };
    fetch("/api/join-room", requestOptions)
      .then((response) => {
        if (response.ok) {
          props.history.push(`/room/${roomCode}`);
        } else {
          setError("Room not found." );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }


    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Join a Room
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <TextField
            error={error}
            label="Code"
            placeholder="Enter a Room Code"
            value={roomCode}
            helperText={error}
            variant="outlined"
            onChange={(e) => setRoomCode(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="primary"
            onClick={roomButtonPressed}
          >
            Enter Room
          </Button>
        </Grid>
        <Grid item xs={12} align="center">
          {/* when button is pressed, acts like a link and takes us back to "/" the homepage. */}
          <Button variant="contained" color="secondary" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );

}
export default RoomJoinPage;