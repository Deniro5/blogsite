import React, { useState } from "react";
import devMode from "./devmode";

const Login = (props: any) => {
  const [signIn, setSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const isValid = (username: string) => {
    const letterNumber = /^[0-9a-zA-Z]+$/;
    if (username.match(letterNumber) && username.length > 0 && username.length < 15) {
      return true;
    }
    return false;
  };

  const login = (user: String, pass: String) => {
    fetch((devMode ? "http://localhost:8000" : "") + "/users/login", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user,
        password: pass,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          alert("Incorrect Username or Password");
        } else {
          props.setAuth(true);
          props.setUserImage("" + json.userImage);
        }
      });
  };

  const submit = () => {
    if (signIn) {
      login(username, password);
    } else {
      if (true) {
        alert("Registration unavailable in demo version. Please log in as a guest.");
        return;
      }
      if (isValid(username)) {
        if (password === confirm && password.length > 0) {
          fetch("users/signup", {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: username,
              password: password,
            }),
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.error) {
                alert(json.error);
              } else {
                props.setAuth(true);
                props.setUserImage("" + json.userImage);
              }
            });
        } else {
          alert("Passwords don't match or they are blank");
        }
      } else {
        alert(
          "Invalid username. Username must be between 0 and 15 characters and should contain only numbers/letters."
        );
      }
    }
  };

  const guestLogin = () => {
    login("guest", "guest");
  };

  return (
    <div className='loginContainer'>
      <div className='loginControls'>
        <div className='loginControlsTabContainer'>
          <div
            onClick={() => {
              setSignIn(true);
              setUsername("");
              setPassword("");
            }}
            className={"loginControlsTab " + (signIn ? " " : "unselected")}>
            <p> Sign In </p>
          </div>
          <div
            onClick={() => {
              setSignIn(false);
              setUsername("");
              setPassword("");
            }}
            className={"loginControlsTab " + (signIn ? "unselected" : " ")}>
            <p> Register </p>
          </div>
          <div
            className='loginFieldContainer'
            style={{ marginTop: (signIn ? 40 : 30) + "px" }}>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder='Username'
            />
          </div>
          <div className='loginFieldContainer'>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type='password'
              placeholder='Password'
            />
          </div>
          <div className={"loginFieldContainer " + (signIn ? "loginHidden" : " ")}>
            <input
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
              }}
              type='password'
              placeholder='Confirm Password'
            />
          </div>
          <button onClick={submit}> Submit </button>
          <p id='guestLogin' onClick={guestLogin} className={signIn ? "" : "loginHidden"}>
            Log in as guest
          </p>
        </div>
      </div>
      <div id='loginFooter'>
        <p> Terms of Use</p>
        <span>-</span>
        <p> Help</p>
        <span>-</span>
        <p> Privacy Policy</p>
      </div>
    </div>
  );
};

export default Login;
