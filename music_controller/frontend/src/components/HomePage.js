import React, {Component} from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
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
            // respective component(s). Uses regex greedy matching, so for "/" we need exact path because technically
            // for "/about" or any url like "/something" we have a match for "/" and switch statement ensures that
            // only the first matching child element (Route in this case) is rendered.
            <Router>
                <Switch>
                     {/*use exact for only showing this html on root page*/}
                    {/* case 1 */}
                    <Route exact path="/">
                        <p>This is the home page.</p>
                    </Route>
                    {/* case 2 */}
                    <Route path="/join" component={RoomJoinPage} />
                    {/* case 3 */}
                    <Route path="/create" component={CreateRoomPage} />
                    {/* case 4 go to already created room */}
                    <Route path="/room" component={Room}/>
                </Switch>
            </Router>
        )
    }
}