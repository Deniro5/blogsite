import React, { useEffect, useState, Fragment, useRef } from "react";
import ArticlePreview from "./ArticlePreview";
import { withRouter, useParams, RouteComponentProps } from "react-router";
import Modal from "@material-ui/core/Modal";
import UserList from "./UserList";
import Error from "./Error";
import devMode from "./devmode";

export interface IProfileProps extends RouteComponentProps<any> {
  history: any;
  setHeaderImage: (newimage: string) => void;
}

interface user {
  _id: string;
  username: string;
  userImage: string;
}

const Profile: React.FC<IProfileProps> = (props) => {
  const { history } = props;
  const { user } = useParams();
  const [username, setUsername] = useState("");
  const [articles, setArticles] = useState<any>([]);
  const [followers, setFollowers] = useState<user[]>([]);
  const [following, setFollowing] = useState<user[]>([]);
  const [userImage, setUserImage] = useState("/img/default.jpg");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUserProfile, setIsUserProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [error, setError] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPath = user || "userprofile"; // if user isnt defined we show the current users profile
    fetch((devMode ? "http://localhost:8000" : "") + "/users/" + fetchPath, {
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
        const user = json.user;
        if (!user) {
          setError(true);
          setIsLoaded(true);
        } else {
          setUsername(user.username);
          setArticles(json.articles);
          setFollowers(json.followerInfo);
          setFollowing(json.followingInfo);
          setUserImage("" + user.userImage);
          setIsLoaded(true);
          setIsUserProfile(json.isUserProfile);
          setIsFollowing(json.isFollowing);
        }
      });
  }, [user]);

  const logout = () => {
    const choice = window.confirm("Are you sure you want to log out?");
    if (choice) {
      fetch((devMode ? "http://localhost:8000" : "") + "/users/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }).then((res) => {
        history.replace("/");
        window.location.reload();
      });
    }
  };

  const follow = () => {
    if (!isFollowing) {
      fetch((devMode ? "http://localhost:8000" : "") + "/users/follow", {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
        }),
      })
        .then((res) => {
          if (res.status === 401) {
            alert("authorization error");
            window.location.reload();
          } else {
            return res.json();
          }
        })
        .then((json) => {
          if (json) {
            const newUser: user = {
              _id: json._id,
              username: json.username,
              userImage: json.userImage,
            };
            setFollowers([...followers, newUser]);
            setIsFollowing(true);
          }
        })
        .catch((error) => alert(error));
    }
  };

  const unfollow = () => {
    if (isFollowing) {
      fetch((devMode ? "http://localhost:8000" : "") + "/users/unfollow", {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
        }),
      })
        .then((res) => {
          if (res.status === 401) {
            alert("authorization error");
            window.location.reload();
          } else {
            return res.json();
          }
        })
        .then((json) => {
          if (json) {
            setFollowers([
              ...followers.filter((follower) => {
                return follower._id !== json._id;
              }),
            ]);
            setIsFollowing(false);
          }
        })
        .catch((error) => alert(error));
    }
  };

  const deleteArticle = (id: string) => {
    if (devMode) {
      const choice = window.confirm("Are you sure you want to delete this article?");
      if (choice) {
        fetch((devMode ? "http://localhost:8000" : "") + "/articles/" + id, {
          method: "DELETE",
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
            //for this and like we gotta check if theyre good
            let newArticles = articles.filter((article: any) => {
              return article._id !== id;
            });
            setArticles(newArticles);
          });
      }
    } else {
      alert("Cannot perform this action in the demo version");
    }
  };

  const onImageChangeHandler = () => {
    if (devMode) {
      var reader = new FileReader();
      reader.onload = () => {
        setUserImage(reader.result!.toString());
        props.setHeaderImage(reader.result!.toString());
      };
      reader.readAsDataURL(uploadRef.current!.files![0]!);
      var formData = new FormData();
      formData.append("userImage", uploadRef.current!.files![0]);
      fetch((devMode ? "http://localhost:8000" : "") + "/users/changeimage", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      })
        .then((res) => {
          if (res.status === 401) {
            alert("authorization error");
            window.location.reload();
          } else if (res.status === 403) {
            alert("You are not authorized to perform this action.");
          } else {
            return res.json();
          }
        })
        .then((json) => {
          if (!json) {
            setUserImage("uploads/defaultUser.png");
            props.setHeaderImage("uploads/defaultUser.png");
          }
        })
        .catch((error) => alert(error));
    } else {
      alert("Cannot perform this action in the demo version");
    }
  };

  const closeModal = () => {
    setShowFollowing(false);
    setShowFollowers(false);
  };

  if (!isLoaded) {
    return <p id='loading'> Loading </p>;
  } else if (error) {
    return <Error />;
  }

  return (
    <div id='profileContainer'>
      <img
        alt='profilepic'
        id='profileImage'
        src={(devMode ? "http://localhost:8000/" : "/") + userImage}
      />
      {isUserProfile && (
        <Fragment>
          <input
            onChange={() => {
              onImageChangeHandler();
            }}
            ref={uploadRef}
            type='file'
            name='pic'
            accept='image/*'
            id='profileImageChange'
          />
          <p style={{ fontSize: "12px" }}> (Click profile image to change) </p>
        </Fragment>
      )}
      <h2 id='profileName'> {username} </h2>
      <p className='profileInfo'>
        <b
          onClick={() => {
            setShowFollowers(true);
          }}>
          Followers:
        </b>
        {followers.length}
      </p>
      <p className='profileInfo'>
        <b
          onClick={() => {
            setShowFollowing(true);
          }}>
          Following:
        </b>
        {following.length}
      </p>
      {isUserProfile ? (
        <button id='logOutButton' onClick={logout}>
          Log Out
        </button>
      ) : (
        <Fragment>
          {isFollowing ? (
            <button id='followButton' onClick={unfollow}>
              Unfollow
            </button>
          ) : (
            <button id='followButton' onClick={follow}>
              Follow
            </button>
          )}
        </Fragment>
      )}
      <div id='profileArticleContainer'>
        <p id='profileContainerSubTitle'> Posts ({articles.length}) : </p>
        {articles.map((article: any) => (
          <ArticlePreview
            isDeletable={isUserProfile}
            deleteArticle={deleteArticle}
            {...article}
          />
        ))}
        {articles.length === 0 && (
          <p style={{ marginTop: "35px" }}> No articles to show </p>
        )}
      </div>
      <Modal
        aria-labelledby='simple-modal-title'
        aria-describedby='simple-modal-description'
        open={showFollowers || showFollowing}
        onClose={closeModal}>
        <div className='userListModal'>
          <img
            alt='placeholder'
            onClick={closeModal}
            src='/img/close.png'
            id='userListModalClose'
          />
          {showFollowing ? (
            <UserList users={following} title={"Following"} closeModal={closeModal} />
          ) : (
            <UserList users={followers} title={"Followers"} closeModal={closeModal} />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default withRouter(React.memo(Profile));
