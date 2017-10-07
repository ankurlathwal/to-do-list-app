import React from 'react';
import ReactDOM from 'react-dom';
const queryString = require('query-string');

// The App component - top level react component for the application. 
//This will contain all other React components

class App extends React.Component {
  
  constructor(props){
    super(props);
    this.state = { user:null, visit:null,
    };
    
}

// When the component App has mounted, send a request to api to fetch data and update the state from response data
componentDidMount() {
    const parsed = queryString.parse(location.search);
    var user = parsed.code;
    var xhr = new XMLHttpRequest();
    var status = false;
    var url = "/session?code=" + user;
    var ResData;
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          ResData = (JSON.parse(xhr.responseText));
          this.setState({ user: ResData.user, visit: ResData.visit });
          status = true;
        } else {
          console.error(xhr.statusText);
        }
      }
    }.bind(this);
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);
  }




render(){
    return(
      <div>
          <p className="example">Hi {this.state.user}! This is your visit number: {this.state.visit}</p>
      </div>
    );
}

}

export default App;