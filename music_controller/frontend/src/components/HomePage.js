import React, {Component} from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
}
    from "react-router-dom";


export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            // use BrowserRouter to render relevant component (App Renders HomePage since in App.js we return HomePage
            // and then BrowserRouter uses route its passed to jump to relevant case in switch statement and displays
            // respective component. Uses greedy matching, so for "/" we need exact path because technically for
            // "/about" we have a match for "/"
            <Router>
                <Switch>
                     {/*use exact for only showing this html on root page*/}
                    <Route exact path="/">
                        <p>This is the home page.</p>
                    </Route>
                    <Route path="/join" component={RoomJoinPage} />
                    <Route path="/create" component={CreateRoomPage} />
                </Switch>
            </Router>
        )
    }
}