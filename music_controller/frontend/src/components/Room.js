import React, { Component } from "react";

export default class Room extends Component {
  constructor(props) {
    super(props);
    // initial state of a room
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
    };
    // Router passes match as a prop so we can access parameters of the URL matched from HomePage.js, grab parameters out of URL to send to api to get
    // room with associated code, since on front end the path to display Room.js is room/:roomCode
    this.roomCode = this.props.match.params.roomCode;
    // forces re-render since getRoomDetails sets state using info from API it gets.
    this.getRoomDetails();
  }

  getRoomDetails() {
      // pass in room code to template string to call backend api for a given room code and dynamically display since
      // when state is changed we'll re-render.
    fetch(`/api/get-room?code=${this.roomCode}`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
      });
  }

  render() {
    return (
      <div>
        <h3>{this.roomCode}</h3>
        <p>Votes: {this.state.votesToSkip}</p>
        {/*  set to string to ensure that it renders text since false won't show up as anything. */}
        <p>Guest Can Pause: {this.state.guestCanPause.toString()}</p>
        <p>Host: {this.state.isHost.toString()}</p>
      </div>
    );
  }
}