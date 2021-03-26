import React, {Component} from "react";
import {render} from "react-dom";
import HomePage from "./HomePage";

const App = (props) => {
    return (
        <div className="center">
            <HomePage/>
        </div>
    )
}

// in index.html template have a div w/ id="app" and this component is rendered there.
const appDiv = document.getElementById("app");
// take component, place in 'app' div on index.html page. passing name as one of the props
render(<App/>, appDiv);