import React, { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import devMode from "./devmode";

export interface IArticlePreviewProps {
  title: string;
  author: string;
  description: string;
  date: string;
  likedBy: string[];
  _id: string;
  blocks: string;
  isDeletable?: boolean;
  deleteArticle?: (id: string) => void;
}

const ArticlePreview: React.FC<IArticlePreviewProps> = (props) => {
  const {
    _id,
    title,
    author,
    description,
    date,
    blocks,
    likedBy,
    isDeletable,
    deleteArticle,
  } = props;

  const deleteArticleHandler = (e: SyntheticEvent) => {
    deleteArticle!(_id);
    e.preventDefault();
  };

  return (
    <Link to={"/article/" + _id}>
      <div id='articlePreviewContainer'>
        <div id='articlePreviewImgContainer'>
          <img
            alt='articleimage'
            id='articlePreviewImg'
            src={(devMode ? "http://localhost:8000" : "") + "/uploads/" + blocks}
          />
          <div id='articlePreviewLikeContainer'>
            {likedBy.length}
            <img alt='like' src='/img/like.png' />
          </div>
        </div>
        <div id='articlePreviewContentContainer'>
          {isDeletable && (
            <p
              id='articlePreviewDelete'
              onClick={(e) => {
                deleteArticleHandler(e);
              }}>
              x
            </p>
          )}
          <div id='articlePreviewTextContainer'>
            <h1 id='articlePreviewTitle'>{title}</h1>
            <p id='articlePreviewSummary'>{description}</p>
          </div>
          <p id='articlePreviewDate'>{date}</p>
          <p id='articlePreviewDate' style={{ float: "right" }}>
            By: {author}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ArticlePreview;
