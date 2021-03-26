// functional component design
import React, {useState} from 'react'

// take in properties (we'll use them later)

// note on ES6 arrow functions,
// const b = () => { return 'hello' }; //arrow Fn /w braces needs a return statement to return anything
// const c = () => 'hello';            //shorthand arrow Fn w/o braces returns whatever the arrow points to

// so here, arrow function will return JSX and RoomJoinPage is called in HomePage.js and the JSX is rendered.
const RoomJoinPage = (props) => {
    // ensure to return JSX from component
    return(
        <div> <p> This is the room join page..</p> </div>

    )
}
export default RoomJoinPage;