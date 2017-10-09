import React from 'react';
import ReactDOM from 'react-dom';
const queryString = require('query-string');

// The App component - top level react component for the application. 
//This will contain all other React components

class App extends React.Component {
  
  constructor(props){
    super(props);
    this.state = { user:null, visit:null, data: [],
    };
    
    this.updateList = this.updateList.bind(this);
}

// When the component App has mounted, send a request to api to fetch data and update the state from response data
componentDidMount() {
    var url;
    const parsed = queryString.parse(location.search);
    if(typeof parsed.code !== 'undefined'){
        url = "/getData?code=" + parsed.code;
        
    }
    else{
        url = "/getData";
    }
    var getUser = new XMLHttpRequest();
    var status = false;
    var ResData;
    getUser.open("GET", url, true);
    getUser.onload = function (e) {
      if (getUser.readyState === 4) {
        if (getUser.status === 200) {
          ResData = (JSON.parse(getUser.responseText));
          if(typeof ResData.data !== 'undefined'){
          var arrayData = ResData.data.split(',');
          var tempArray = this.state.data.slice();
          for(var i=0;i<arrayData.length;i++){
            tempArray.push(arrayData[i]);
          }
          this.setState({ user: ResData.user, visit: ResData.visit, data:tempArray});
        }
        else{
          this.setState({user: ResData.user, visit: ResData.visit});
        }
        //  console.log(this.state.data);
          status = true;
        } else {
          console.error(getUser.statusText);
        }
      }
    }.bind(this);
    getUser.onerror = function (e) {
      console.error(getUser.statusText);
    };
    getUser.send(null);
    

  }

updateList(event){
  event.preventDefault();
  //this.setState({visit:9999});
  var updateData = new XMLHttpRequest();
  var status = false;
  var ResData;
  var url = '/updateData?code=' + this.state.user;
  updateData.open("POST", url, true);
  updateData.setRequestHeader("Content-Type","application/json");
  updateData.send(JSON.stringify({"data" : this.element.value}));
  updateData.onload = function (e) {
    if (updateData.readyState === 4) {
      if (updateData.status === 200) {
        ResData = JSON.parse(updateData.responseText);
        
        var tempArray = this.state.data.slice();
        tempArray.push(ResData.data);
        this.setState({ data:tempArray});
        status = true;
      } else {
        console.error(updateData.statusText);
      }
    }
  }.bind(this);
  updateData.onerror = function (e) {
    console.error(updateData.statusText);
  };
  
  

}


render(){
    return(
      <div>
          <h2 className="example">Hi {this.state.user}!</h2>
          <p>Your list link: <a href={window.location.href.split('?')[0] + "?code=" + this.state.user} target="_blank">
          {this.state.user}</a></p>
          <p className="data">This is your list:</p>
          <ul>
          {this.state.data.map(function(listValue){
            return <li>{listValue}</li>;
          })}
        </ul>
          <form onSubmit={this.updateList} className="form-inline">
          <div className="form-group">
            <input type="text" ref={el => this.element = el} className="form-control"/>
            <button type="submit" value="submit" className="btn btn-success">Add</button>
          </div>  
          </form>
      </div>
    );
}

}

export default App;