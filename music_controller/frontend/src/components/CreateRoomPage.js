import React, {Component, useEffect, useState} from "react";
import {
    Button,
    Grid,
    Typography,
    TextField,
    FormHelperText,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {useHistory} from "react-router-dom";

// rewrote into functional component
const CreateRoomPage = (props) => {
    const defaultVotes = 2;
    const [guestCanPause, setGuestCanPause] = useState(true);
    const [votesToSkip, setVotesToSkip] = useState(defaultVotes);
    // call hook at top level and use it within the functions we need, should call hooks at top level of component.
    const history = useHistory();

    function handleVotesChange(event) {
        setVotesToSkip(event.target.value);
    }

    //  if guest can pause was set to true we want to allow pausing, else we'll set false.
    function handleGuestCanPauseChange(event) {
        setGuestCanPause(event.target.value === "true");
    }

    function handleRoomButtonPressed(event) {
        // can't use hook in this function for some reason... probably because isn't a react function.
        // let history = useHistory();
        // console.log(history)
        const requestOptions = {
            method: "POST",
            // content type indicates request body format below is in JSON, (sending a JSON object key:value pairs), so
            // we let server know we're sending JSON object.
            headers: {"Content-Type": "application/json"},
            // pass current state of component to backend to create room with the current state of the component, i.e.
            // what the user wants to create room with (# of votes to skip and if guest can pause)
            body: JSON.stringify({
                // need to make sure these names match what we look for in CreateRoomView on backend.
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
            }),
        };
        // call REST backend api for creating room, pass necessary content (votes, guest can pause) and for now just log
        // the data, later we will redirect to the created room with associated page.
        fetch("/api/create-room", requestOptions)
            .then((response) => response.json())
            // after creating a room we'll get the code back in response from server API, so redirect to room/code, i.e.
            // display the page associated with the room just created by pushing link to top of history stack for this
            // component which forces a redirect.
            .then((data) => {
                    // get history object from router.
                    history.push("/room/" + data.code)
                    console.log(data)
                }
            );
    }

    const CreateARoom = () => {
        return (
            <React.Fragment>
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                    Create A Room
                </Typography>
            </Grid>
                </React.Fragment>
        )
    }

    const ControlRoom = () => {
        return (
            <Grid item xs={12} align="center">
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align="center">Guest Control of Playback State</div>
                    </FormHelperText>
                    <RadioGroup
                        row
                        defaultValue="true"
                        onChange={handleGuestCanPauseChange}
                    >
                        <FormControlLabel
                            value="true"
                            control={<Radio color="primary"/>}
                            label="Play/Pause"
                            labelPlacement="bottom"
                        />
                        <FormControlLabel
                            value="false"
                            control={<Radio color="secondary"/>}
                            label="No Control"
                            labelPlacement="bottom"
                        />
                    </RadioGroup>
                </FormControl>
            </Grid>
        )
    }

    const RoomButtons = () => {
        return (
            // use react fragment to avoid adding div node to dom to wrap returning multiple elements
            <React.Fragment>
            <Grid item xs={12} align="center">
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleRoomButtonPressed}
                >
                    Create A Room
                </Button>
            </Grid>
            <Grid item xs={12} align="center">
                <Button color="secondary" variant="contained" to="/" component={Link}>
                    Back
                </Button>
            </Grid>
                </React.Fragment>
        )
    }


    const VotesToSkip = () => {
        return (
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField
                        required={true}
                        type="number"
                        onChange={handleVotesChange}
                        defaultValue={defaultVotes}
                        inputProps={{
                            min: 1,
                            style: {textAlign: "center"},
                        }}
                    />
                    <FormHelperText>
                        <div align="center">Votes Required To Skip Song</div>
                    </FormHelperText>
                </FormControl>
            </Grid>
        )
    }


    return (
        <Grid container spacing={2}>
            {/* each grid item is separated into components*/}
            <CreateARoom/>
            <ControlRoom/>
            <VotesToSkip/>
            <RoomButtons/>
        </Grid>
    );
}
export default CreateRoomPage;