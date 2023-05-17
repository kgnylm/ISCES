import React, { useState, useEffect } from "react";

const AuthContext = React.createContext({
  isLoggedIn: false,

  isClickedLogInButton: false,

  //chefId: null,
  onLogout: () => {},
  onLogin: () => {},
  handleLogin: () => {},
});

export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClickedLogInButton, setIsClickedLogInButton] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("sid");
    if (uid !== undefined && uid !== null) {
      setIsLoggedIn(true);
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("sid");
    localStorage.removeItem("studentInfo");
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsClickedLogInButton((prevState) => !prevState);
  };

  const loginHandler = () => {
    console.log("a");
    setIsLoggedIn(true);
  };
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isLoggedIn,

        isClickedLogInButton: isClickedLogInButton,

        onLogout: logoutHandler,
        onLogin: loginHandler,
        handleLogin: handleLogin,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
export default AuthContext;