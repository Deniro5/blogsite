import React, { useState, Fragment, useEffect } from "react";
import Comment from "./Comment";
import { Link } from "react-router-dom";
import devMode from "./devmode";

export interface comment {
  author: string;
  date: string;
  content: string;
  userImage: string;
}

export interface IArticleProps {
  title: string;
  author: string;
  description: string;
  date: string;
  blocks: block[];
  comments: comment[];
  likedBy: string[];
  _id: string;
  userImage: string;
  isLikedBy: boolean;
}

export interface block {
  id: number;
  type: string;
  content: string;
  caption?: string;
  isDeletable?: boolean;
  file?: File;
}

const Article: React.FC<IArticleProps> = (props) => {
  const { _id, title, author, date, blocks, userImage } = props;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(props.comments);
  const [likedBy, setLikedBy] = useState(props.likedBy);
  const [isLikedBy, setIsLikedBy] = useState(props.isLikedBy);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const submitComment = () => {
    if (comment.length > 0) {
      const dateobj = new Date();
      fetch((devMode ? "http://localhost:8000" : "") + "/articles/comment/" + _id, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          date: dateobj.toString().substring(4, 15),
        }),
      })
        .then((res) => {
          if (res.status === 401) {
            alert("Authorization Error");
            window.location.reload();
          }
          return res.json();
        })
        .then((json) => {
          if (json) {
            setComments([json.newComment, ...comments]);
            setComment("");
          }
        })
        .catch((error) => alert(error));
    }
  };

  const like = () => {
    fetch((devMode ? "http://localhost:8000" : "") + "/articles/like/" + _id, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Authorization Error");
          window.location.reload();
        }
        return res.json();
      })
      .then((json) => {
        setLikedBy([...likedBy, json.newLike]);
        setIsLikedBy(true);
      })
      .catch((error) => alert(error));
  };

  const convertToJSX = (block: block) => {
    if (block.type === "image") {
      return (
        <Fragment>
          <img
            alt='articleimage'
            id='articleMainImg'
            src={(devMode ? "http://localhost:8000" : "") + "/uploads/" + block.content}
          />
          {block.caption!.length > 0 && <p id='articleImgCaption'>{block.caption}</p>}
        </Fragment>
      );
    } else if (block.type === "subheader") {
      return <h2 id='articleSubTitle'> {block.content} </h2>;
    } else if (block.type === "text") {
      return <p id='articleText' dangerouslySetInnerHTML={{ __html: block.content }} />;
    }
  };

  return (
    <div id='articleContainer'>
      <h1 id='articleTitle'> {title} </h1>
      <div id='articleInfoContainer'>
        <div id='articleLikeContainer'>
          {likedBy.length}
          <img alt='like' src='/img/like.png' />
        </div>
        <Link to={"/profile/" + author}>
          <img
            alt='userimage'
            src={(devMode ? "http://localhost:8000" : "") + "/" + userImage}
          />
        </Link>
        <div style={{ paddingTop: 3 }}>
          <p>
            By:{" "}
            <Link style={{ color: "black" }} to={"/profile/" + author}>
              {author}
            </Link>
          </p>
          <p> Posted on {date} </p>
        </div>
      </div>
      {blocks.map((block) => convertToJSX(block))}
      {!isLikedBy ? (
        <button id='articleLike' onClick={like}>
          Like Article
        </button>
      ) : (
        <button id='articleLiked'>Liked</button>
      )}
      <p id='articleCommentSubTitle'> Comments ({comments.length}): </p>
      <textarea
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
        }}
        id='articleCommentInput'
        placeholder='Write comment here...'
        rows={10}
      />
      <button onClick={submitComment} id='articleCommentSubmit'>
        Submit Comment
      </button>
      {comments.map((comment) => (
        <Comment {...comment} />
      ))}
    </div>
  );
};

export default Article;
