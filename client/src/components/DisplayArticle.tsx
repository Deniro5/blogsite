import React, { useEffect, useState } from "react";
import Article from "./Article";
import { useParams } from "react-router";
import Error from "./Error";
import devMode from "./devmode";

const DisplayArticle: React.FC = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState<any>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch((devMode ? "http://localhost:8000" : "") + "/articles/" + articleId, {
      method: "get",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          alert("authorization error");
          window.location.reload();
        }
        return res.json();
      })
      .then((json) => {
        let article = json[0];
        if (!article) {
          setError(true);
          setIsLoaded(true);
        } else {
          article.userImage = json.userImage;
          article.isLikedBy = json.isLikedBy;
          setArticle(article);
          setIsLoaded(true);
        }
      });
  }, [articleId]);

  if (!isLoaded) {
    return <p style={{ minHeight: "100vh" }}> </p>;
  } else if (error) {
    return <Error />;
  }
  return <Article {...article} />;
};

export default DisplayArticle;
