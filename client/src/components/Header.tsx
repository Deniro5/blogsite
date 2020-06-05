import React, { useState, useEffect, Fragment } from "react";
import Hidden from "@material-ui/core/Hidden";
import Drawer from "@material-ui/core/Drawer";
import { Link } from "react-router-dom";
import { Switch, Route } from "react-router-dom";
import Profile from "./Profile";
import CreateArticle from "./CreateArticle";
import DisplayArticle from "./DisplayArticle";
import DisplayArticlePreview from "./DisplayArticlePreviews";
import Footer from "./Footer";
import Error from "./Error";

interface IHeaderProps {
  userImage: string;
}

const linkStyle = {
  textDecoration: "none",
  color: "black",
};

const Header: React.FC<IHeaderProps> = (props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [userImage, setUserImage] = useState(props.userImage);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setUserImage(props.userImage);
  }, [props.userImage]);

  const openMenu = () => {
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const setHeaderImage = (newimage: string) => {
    setUserImage(newimage);
  };

  const mobileMenu = (
    <div id='headerMobileMenu'>
      <h2> Menu </h2>
      <Link to='/' style={linkStyle}>
        <p onClick={closeMenu} className='menuOption'>
          Home
        </p>
      </Link>
      <Link to='/profile' style={linkStyle}>
        <p onClick={closeMenu} className='menuOption'>
          Profile
        </p>
      </Link>
      <Link to='create' style={linkStyle}>
        <p onClick={closeMenu} className='menuOption'>
          New Post
        </p>
      </Link>
      <p id='closeMenu' onClick={closeMenu}>
        Close Menu
      </p>
    </div>
  );

  return (
    <Fragment>
      <div id='headerContainer'>
        <Hidden xsDown>
          <Link to={"/"}>
            <img alt='logo' id='headerLogo' src='/img/logo.png' />
          </Link>
        </Hidden>
        <Hidden smUp>
          <img alt='menu' onClick={openMenu} id='headerMenu' src='/img/menu.png' />
          <Drawer anchor={"top"} open={showMenu} onClose={closeMenu}>
            {mobileMenu}
          </Drawer>
        </Hidden>
        <div id='searchBarContainer'>
          <input
            id='searchBar'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            type='text'
            placeholder='Search...'
          />
          <Link to={"/search/" + search}>
            <div onClick={() => setSearch("")} id='searchBarBtn'>
              <img alt='search' id='searchBarBtn' src='/img/search.png' />
            </div>
          </Link>
        </div>
        <Hidden xsDown>
          <Link to='/profile'>
            <img alt='profile' id='headerProfileBtn' src={userImage} />
          </Link>
          <Link to='/create'>
            <button id='newPostBtn'> New Post </button>
          </Link>
        </Hidden>
      </div>

      <Switch>
        <Route exact path='/'>
          <DisplayArticlePreview />
        </Route>
        <Route exact path='/search/:searchterm'>
          <DisplayArticlePreview />
        </Route>
        <Route
          exact
          path='/profile'
          render={(props) => <Profile {...props} setHeaderImage={setHeaderImage} />}
        />
        <Route
          exact
          path='/profile/:user'
          render={(props) => <Profile {...props} setHeaderImage={setHeaderImage} />}
        />
        <Route exact path='/create'>
          <CreateArticle />
        </Route>
        <Route exact path='/article/:articleId'>
          <DisplayArticle />
        </Route>
        <Route path='*'>
          <Error />
        </Route>
      </Switch>
      <Footer />
    </Fragment>
  );
};

export default Header;
