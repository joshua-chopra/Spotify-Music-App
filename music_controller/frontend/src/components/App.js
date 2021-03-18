import React, {Component} from "react";
import {render} from "react-dom";
import HomePage from "./HomePage";

export default class App extends Component {
    constructor(props) {
        super(props);
        // whenever the state is modified, (we can just modify state) the component ITSELF is re-rendered (nothing else)
        this.state = {
            // put stuff here.
        }
    }

    render() {
        // if we were reusing this, we would want to use name property to change something. just need { } for js code
        // within <> html code.
        // return <h1>{this.props.name}</h1>;
        // component(s) NEED a parent element (container essentially), and cannot be returned alone.
        return (
            <div>
                <HomePage/>
            </div>
        );
    }
}

// in index.html template have a div w/ id="app" and this component is rendered there.
const appDiv = document.getElementById("app");
// take component, place in 'app' div on index.html page. passing name as one of the props
render(<App/>, appDiv);