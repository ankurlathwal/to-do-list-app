import React from 'react';
import ReactDOM from 'react-dom';

// The App component - top level react component for the application. 
//This will contain all other React components

class App extends React.Component {
  
  constructor(props){
    super(props);
    this.state = { data:null,
    };

}


componentDidMount() {

    var xhr = new XMLHttpRequest();
    var status = false;
    xhr.open("GET", "/session?code=ankur", true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          this.setState({ data: xhr.responseText });
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
          <p className="example">Hi {this.state.data}! This is your visit number:</p>
      </div>
    );
}

}

ReactDOM.render(<App />, document.getElementById('app'));