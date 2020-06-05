import React, { useEffect, useState } from "react";
import ArticlePreview from "./ArticlePreview";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useParams } from "react-router";

const DisplayArticlePreviews: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [articles, setArticles] = useState<any>([]);
  const [sortShow, setSortShow] = useState(false);
  const [typeOfSort, setTypeOfSort] = useState("Date posted");
  const [display, setDisplay] = useState("All Articles");
  const [displayShow, setDisplayShow] = useState(false);
  const [maxArticles, setMaxArticles] = useState(15);
  const [limit, setLimit] = useState(0);
  const { searchterm } = useParams();

  const fetchPreview = (oldArticles: any[]) => {
    fetch(
      "/articles/previews/" +
        (display === "Custom feed") +
        "/" +
        maxArticles +
        "/" +
        typeOfSort.substring(0, 4) +
        (searchterm ? "/" + searchterm : ""),
      {
        method: "get",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (res.status === 401) {
          window.location.reload();
        }
        return res.json();
      })
      .then((json) => {
        if (json.articles) {
          const newArticles = [...oldArticles, ...json.articles];
          setArticles(newArticles);
          setIsLoaded(true);
          setLimit(json.count);
          if (limit !== 0) {
            window.addEventListener("scroll", handleScroll);
          }
        }
      })
      .catch((error) => alert(error));
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      maxArticles < limit // we need to get the max from the server
    ) {
      window.removeEventListener("scroll", handleScroll);
      setMaxArticles(maxArticles + 15);
    }
  };

  useEffect(() => {
    fetchPreview(articles);
  }, [maxArticles]);

  useEffect(() => {
    if (maxArticles === 15) {
      //if we are already showing minimal articles we just need to change the 15 articles
      fetchPreview([]);
    } else {
      //otherwise we have to completely reset
      setArticles([]);
      setMaxArticles(15);
    }
  }, [display, searchterm, typeOfSort]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
  }, [limit]);

  if (!isLoaded) {
    return <p id='loading'>Loading </p>;
  }

  return (
    <div
      style={{
        marginTop: "100px",
        minHeight: "100vh",
      }}>
      {searchterm && (
        <p style={{ fontWeight: 500 }}>
          Showing search results for '<b>{searchterm}</b>':
        </p>
      )}
      <div>
        <div className='shopMenuContainer'>
          <p className='shopMenuLabel'> Sort By: </p>
          <div
            className='sortmenu menu-root'
            onClick={() => {
              setSortShow(!sortShow);
            }}
            onMouseLeave={() => {
              setSortShow(false);
            }}>
            <p className='maintext'> {typeOfSort}</p>
            <ExpandMoreIcon className={"dropDownIcon " + (sortShow ? "rotate" : "")} />
            <div hidden={!sortShow}>
              <div className='shopmenu-items'>
                <div
                  onClick={() => {
                    setTypeOfSort("Date posted");
                  }}>
                  {"Date posted"}
                </div>
                <div
                  onClick={() => {
                    setTypeOfSort("Likes");
                  }}>
                  {"Likes"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='shopMenuContainer'>
          <p className='shopMenuLabel'> Show: </p>
          <div
            className='sortmenu menu-root'
            onClick={() => {
              setDisplayShow(!displayShow);
            }}
            onMouseLeave={() => {
              setDisplayShow(false);
            }}>
            <p className='maintext'> {display}</p>
            <ExpandMoreIcon className={"dropDownIcon " + (displayShow ? "rotate" : "")} />
            <div hidden={!displayShow}>
              <div className='shopmenu-items'>
                <div
                  onClick={() => {
                    setDisplay("All articles");
                  }}>
                  {"All articles"}
                </div>
                <div
                  onClick={() => {
                    setDisplay("Custom feed");
                  }}>
                  {"Custom feed"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {articles.length === 0 ? (
        <p style={{ fontSize: "16px", marginTop: "-50px", marginBottom: "40px" }}>
          No articles to show
        </p>
      ) : (
        <p style={{ fontSize: "16px", marginTop: "-50px", marginBottom: "40px" }}>
          Showing {articles.length} results of {limit}
        </p>
      )}
      {articles.map((article: any) => (
        <ArticlePreview key={article._id} {...article} />
      ))}
      {articles.length > 0 && (
        <button
          id='toTopBtn'
          onClick={() => {
            window.scrollTo(0, 0);
          }}>
          Back to Top
        </button>
      )}
    </div>
  );
};

export default DisplayArticlePreviews;
