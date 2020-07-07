import React from "react";
import { Link } from "react-router-dom";
import devMode from "./devmode";

export interface ICommentProps {
  author: string;
  date: string;
  content: string;
  userImage: string;
}

const Comment: React.FC<ICommentProps> = (props) => {
  const { author, date, content, userImage } = props;

  return (
    <div id='commentContainer'>
      <div id='commentInfoContainer'>
        <Link style={{ color: "black" }} to={"/profile/" + author}>
          <img
            alt='userimage'
            src={(devMode ? "http://localhost:8000" : "") + "/" + userImage}
          />
          <p> {author}</p>
        </Link>
        <p> {date} </p>
      </div>
      <div id='commentContentContainer'>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Comment;
