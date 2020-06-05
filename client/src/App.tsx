import React from "react";
import "./scss/App.scss";
import Login from "./components/Login";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import { HashRouter as Router, Route, Redirect, Switch } from "react-router-dom";

const App = () => {
  const [userImage, setUserImage] = useState("");
  const [auth, setAuth] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    //Check if the user is already authenticated
    fetch("users/checkauth", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          setAuth(true);
        }
        return res.json();
      })
      .then((json) => {
        setUserImage(json.userImage);
        setIsLoaded(true);
      });
  }, []);

  if (!isLoaded) {
    return <p> Loading... </p>;
  }

  return (
    <div className='App'>
      <Router>
        {auth ? (
          <Header userImage={userImage} />
        ) : (
          <Switch>
            <Route exact path='/'>
              <Login setUserImage={setUserImage} setAuth={setAuth} />
            </Route>
            <Route path='*'>
              <Redirect to='/' />
            </Route>
          </Switch>
        )}
      </Router>
    </div>
  );
};

export default App;
