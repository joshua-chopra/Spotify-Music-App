import React, { useEffect, useState } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

// functional component HomePage
const HomePage = (props) => {
    const [roomCode, setRoomCode] = useState(null);


    // if roomcode changes, call useEffect to fetch code from backend
    useEffect(() => {
        async function checkUserInRoom() {
            fetch("/api/user-in-room")
                .then((response) => response.json())
                .then((data) => {
                    // console.log(data);
                    // console.log("Got room code... as: " + data.code);
                    setRoomCode(data.code);
                })
            console.log("In homepage, checkUserInRoom completed...");
        }
        checkUserInRoom();
        console.log("In Homepage... room code: " + roomCode);
    }, [roomCode]);

    function clearRoomCode() {
        setRoomCode(null);
    }

    function renderHomePage() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} align="center">
                    <Typography variant="h3" compact="h3">
                        House Party
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color="primary" to="/join" component={Link}>
                            Join a Room
                        </Button>
                        <Button color="secondary" to="/create" component={Link}>
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }

    return (
        <Router>
            <Switch>
                <Route
                    exact
                    path="/"
                    render={() => {
                        return roomCode ? (
                            <Redirect to={`/room/${roomCode}`}/>) : (
                            renderHomePage()
                        );
                    }}
                />
                <Route path="/join" component={RoomJoinPage}/>
                <Route path="/create" component={CreateRoomPage}/>
                <Route
                    path="/room/:roomCode"
                    render={(props) => {
                        console.log("Passing callback in HomePage before returning Room comp...");
                        // pass callback function that will be called in Room.js if user decides to leave the room,
                        // will clear roomcode prop here.
                        return <Room {...props} leaveRoomCallBack={clearRoomCode}/>;
                    }}
                />
            </Switch>
        </Router>
    );
}
export default HomePage;

