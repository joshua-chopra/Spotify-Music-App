import React, {useState} from 'react'
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import {
    BrowserRouter as Router,
    Switch,
    Route} from "react-router-dom";

// functional component HomePage
const HomePage = (props) => {
    return (
        <Router>
            <Switch>
                {/*use exact for only showing this html on root page*/}
                {/* case 1 */}
                <Route exact path="/">
                    <p>This is the home page.</p>
                </Route>
                {/* case 2 */}
                <Route path="/join" component={RoomJoinPage}/>
                {/* case 3 */}
                <Route path="/create" component={CreateRoomPage}/>
                {/* case 4 go to already created room, with params in URL */}
                <Route path="/room/:roomCode" component={Room}/>
            </Switch>
        </Router>
    );
}
export default HomePage;