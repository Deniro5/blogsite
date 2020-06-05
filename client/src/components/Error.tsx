import React from "react";
import { Link } from "react-router-dom";

const Error: React.FC = () => {
  return (
    <div style={{ marginTop: "150px", height: "100vh" }}>
      <h1> 404 </h1>
      <h2> Page not found </h2>
      <p>
        Click <Link to='/'> here </Link> to go back
      </p>
    </div>
  );
};

export default Error;
