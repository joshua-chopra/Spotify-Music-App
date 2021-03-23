import React, {Component} from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import {Link} from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

export default class CreateRoomPage extends Component {
    defaultVotes = 2;

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: true,
            votesToSkip: this.defaultVotes,
        };
        // bind these methods to class so we can refer to "this" within method to set state
        // this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
        // this.handleVotesChange = this.handleVotesChange.bind(this);
        // this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
    }

    // Use ES7 arrow functions since handleVotesChange = () => is equivalent to this.handleVotesChange i.e., once we
    // initialize the component the method becomes binded to the class
    handleVotesChange = (event) => {
        this.setState({votesToSkip: event.target.value});
    }

    //  if guest can pause was set to true we want to allow pausing, else we'll set false.
    handleGuestCanPauseChange = (event) => {
        this.setState({ guestCanPause: event.target.value === "true" });
    }

    handleRoomButtonPressed = () => {
        const requestOptions = {
            method: "POST",
            // content type indicates request body format below is in JSON, (sending a JSON object key:value pairs), so
            // we let server know we're sending JSON object.
            headers: {"Content-Type": "application/json"},
            // pass current state of component to backend to create room with the current state of the component, i.e.
            // what the user wants to create room with (# of votes to skip and if guest can pause)
            body: JSON.stringify({
                // need to make sure these names match what we look for in CreateRoomView on backend.
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
            }),
        };
        // call REST backend api for creating room, pass necessary content (votes, guest can pause) and for now just log
        // the data, later we will redirect to the created room with associated page.
        fetch("/api/create-room", requestOptions)
            .then( (response) => response.json())
            .then( (data) => console.log(data));
    }

    render() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        Create A Room
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl component="fieldset">
                        <FormHelperText>
                            <div align="center">Guest Control of Playback State</div>
                        </FormHelperText>
                        <RadioGroup
                            row
                            defaultValue="true"
                            onChange={this.handleGuestCanPauseChange}
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
                <Grid item xs={12} align="center">
                    <FormControl>
                        <TextField
                            required={true}
                            type="number"
                            onChange={this.handleVotesChange}
                            defaultValue={this.defaultVotes}
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
                {/* allow user to create a room with specified votes, guest can pause. */}
                <Grid item xs={12} align="center">
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={this.handleRoomButtonPressed}
                    >
                        Create A Room
                    </Button>
                </Grid>
                {/* send user back home... */}
                <Grid item xs={12} align="center">
                    <Button color="secondary" variant="contained" to="/" component={Link}>
                        Back
                    </Button>
                </Grid>
            </Grid>
        );
    }
}