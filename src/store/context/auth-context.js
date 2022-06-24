import { createContext, useCallback, useEffect, useState } from 'react';

let logoutTimer;

export const AuthContext = createContext({
  token: '',
  isLoggedIn: false,
  user: {},
  login: () => {},
  logout: () => {},
});

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  return adjExpirationTime - currentTime;
};

const retrieveStoredToken = () => {
  // TODO
};

export const AuthContextProvider = (props) => {
  const { children } = props;

  const tokenData = retrieveStoredToken();
  let initialUser;
  let initialToken;
  if (tokenData) {
    initialUser = tokenData.user;
    initialToken = tokenData.token;
  }

  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);

  const userIsLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    setUser({});
    // TODO remove token from mobile memory
  }, []);

  const loginHandler = (newToken, newUser, expirationTime) => {
    setToken(newToken);
    setUser(newUser);
    // TODO set user/token/expirationTime in memory

    const remainingTime = calculateRemainingTime(expirationTime);

    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token,
    user,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
