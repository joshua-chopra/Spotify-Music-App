import React, {useState} from "react";
import {
    Button,
    Grid,
    Typography,
    TextField,
    FormHelperText,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio, Collapse
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {useHistory} from "react-router-dom";
import {Alert} from "@material-ui/lab";

// rewrote into functional component
const CreateRoomPage = props => {

    // these also basically act as default props since we pass these as props from Room.js to display the settings page
    // in Room.js by reusing this component, but check for props passed in at return () or use these values.
    const [guestCanPause, setGuestCanPause] = useState("true");
    const [votesToSkip, setVotesToSkip] = useState(2);
    const[successMsg, setSuccessMsg] = useState("");
    const[errorMsg, setErrorMsg] = useState("");
    // call hook at top level and use it within the functions we need, should call hooks at top level of component.
    const history = useHistory();

    function handleRoomButtonPressed(event) {
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
                    history.push(`/room/${data.code}`)
                    console.log(data)
                }
            );
    }

    function handleUpdateButtonPressed(event) {
        const requestOptions = {
            // making an update at UpdateRoom View (api/update-room)
            method: "PATCH",
            // content type indicates request body format below is in JSON, (sending a JSON object key:value pairs), so
            // we let server know we're sending JSON object.
            headers: {"Content-Type": "application/json"},
            // pass current state of component to backend to create room with the current state of the component, i.e.
            // what the user wants to create room with (# of votes to skip and if guest can pause)
            body: JSON.stringify({
                // need to make sure these names match what we look for in CreateRoomView on backend.
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
                // will pass code as props from HomePage.
                code: props.roomCode
            }),
        };
        // call REST backend api for creating room, pass necessary content (votes, guest can pause) and for now just log
        // the data, later we will redirect to the created room with associated page.
        fetch("/api/update-room", requestOptions).then((response) => {
              if (response.ok) {
                  setSuccessMsg("Room updated successfully!");
                  console.log("setting success message............");
              } else {
                  setErrorMsg("Error updating room...");
              }
              console.log("Before callback, set success message to: " + successMsg);
              // removed callback function, causing parent child issues w/ re-rendering, just re-render room on
            // settings page close button clicked to update view on room settings for user.
              // props.updateCallback();
            });
          }

    const Messages = () => {
        return (
            <Grid container spacing={1}>
                {console.log("messages component being displayed......")}
                {console.log("do we have an error msg?: [ " + errorMsg + " ]")}
                {console.log("do we have a success msg?: [ " + successMsg + " ]")}
                {console.log("What is value of update?: " + props.update )}
                <Grid item xs={12} align="center">
                    <Collapse in={errorMsg !== "" || successMsg !== ""}>
                        {successMsg !== "" ? (
                            <Alert severity="success" onClose={() => {setSuccessMsg("");}}>
                                {successMsg}
                            </Alert>
                            )
                            :
                            (<Alert severity="error" onClose={() => {setErrorMsg("");}}>
                                    {errorMsg}
                            </Alert>
                            )
                        }
                    </Collapse>
                </Grid>
            </Grid>);
    }



    const Title = () => {
        return (
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">
                    {props.update ? "Update Room" : "Create a Room"}
                </Typography>
            </Grid>
        );
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
                        defaultValue={props.guestCanPause ? props.guestCanPause.toString() : guestCanPause.toString()}
                        onChange={(e) => setGuestCanPause(e.target.value === "true")}
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

    const VotesToSkip = () => {
        return (
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField
                        required={true}
                        type="number"
                        onChange={(e) =>
                            setVotesToSkip(e.target.value)}
                        defaultValue={votesToSkip}
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

    const CreateRoomButtons = () => {
        return (
            // use react fragment to avoid adding parent node to dom to wrap returning multiple elements
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

    const UpdateRoomButtons = () => {
        return (
            <Grid item xs={12} align="center">
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleUpdateButtonPressed}
                >
                    Update Room
                </Button>
            </Grid>
        );
    }


    return (
        <Grid container spacing={2}>
            <Messages/>
            <Title/>
            <ControlRoom/>
            <VotesToSkip/>
            {props.update ? <UpdateRoomButtons/> : <CreateRoomButtons/>}
        </Grid>
    );
}
export default CreateRoomPage;