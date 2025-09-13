import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  // Define a component state to store user data
  const [user, setUser] = useState({
    email: "",
    username: "",
    password: "",
  });

  // To show or hide password
  const [showPassword, setShowPassword] = useState(false);
  const pressShow = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  // To handle password validation on real time
  const [password, setPassword] = useState("");
  const [errorP, setErrorP] = useState("");
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length > 0 && newPassword.length < 8) {
      setErrorP("Password atleast be 8 characters");
    } else {
      setErrorP("");
    }
  };

  // To handle Email validation on real time
  const [email, setEmail] = useState("");
  const [errorE, setErrorE] = useState("");
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (
      newEmail.includes("@gmail.com") ||
      newEmail.includes("@yahoo.com") ||
      newEmail.includes("@hotmail.com") ||
      newEmail.includes("@outlook.com")
    ) {
      setErrorE("");
    } else {
      setErrorE("Invalid Email");
    }
  };

  const [errorU, setErrorU] = useState("");
  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    if (newUsername.length > 2 && newUsername.length < 12) {
      setErrorU("");
    } else {
      if (newUsername.length > 12) {
        setErrorU("Username is too long!");
      } else if (newUsername.length < 3) {
        setErrorU("Username is too short!");
      }
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:5000/Register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // credentials: "include", // ✅ Ensures cookies are sent/received
      body: JSON.stringify(user),
    });
    console.log("Status Code:", response.status); // Example: 200, 400, 500
    console.log("Response OK?", response.ok); // true if 2xx, false otherwise

    console.log("Response JSON:", await response.json());

    // check  response
    if (response.ok) {
      // login successful, redirect to the application page
      e.preventDefault();
      navigate("/Login");
      toast.success("Registration Successful");
      console.log(response);
    } else {
      // login failed, display an error message
      toast.error("Registration Error!");
      console.log(response);
    }
  };

  return (
    <main
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={onSignup}
        style={{
          backgroundColor: "steelblue",
          borderRadius: "5px",
          padding: "5px",
          height: "35%",
          width: "17%",
        }}
      >
        <h2>Register</h2>
        <input
          style={{
            border: "none",
            outline: "none",
            borderRadius: "5px",
            fontSize: "large",
            width: "95%",
          }}
          required
          onChangeCapture={handleUsernameChange}
          value={user?.username}
          onChange={(e) =>
            setUser({ ...user, [e.target.name]: e.target.value })
          }
          placeholder="Username"
          name="username"
          type="text"
        />
        {errorU && <p>{errorU}</p>}
        <div style={{ height: "10px" }}>
          <br />
        </div>

        <input
          style={{
            border: "none",
            outline: "none",
            borderRadius: "5px",
            fontSize: "large",
            width: "95%",
          }}
          required
          onChangeCapture={handleEmailChange}
          value={user?.email}
          onChange={(e) =>
            setUser({ ...user, [e.target.name]: e.target.value })
          }
          placeholder="Email"
          name="email"
          type="text"
        />
        {errorE && <p>{errorE}</p>}
        <div style={{ height: "10px" }}>
          <br />
        </div>

        <div
          style={{
            display: "flex",
            padding: "1px",
            flexDirection: "row",
            width: "95%",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <input
            style={{
              margin: "0px",
              border: "none",
              outline: "none",
              borderRadius: "5px",
              fontSize: "large",
            }}
            required
            value={user?.password}
            onChangeCapture={handlePasswordChange}
            onChange={(e) =>
              setUser({ ...user, [e.target.name]: e.target.value })
            }
            placeholder="Password"
            name="password"
            type={showPassword ? "text" : "password"}
          />

          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              onClick={(e) => pressShow(e)}
              width="18"
              height="18"
              fill="skyblue"
              viewBox="0 0 16 16"
            >
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              onClick={(e) => pressShow(e)}
              width="18"
              height="18"
              fill="skyblue"
              viewBox="0 0 16 16"
            >
              <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
              <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
              <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
            </svg>
          )}
        </div>
        {errorP && <p>{errorP}</p>}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <button type="submit" className="btn">
            Register
            <Toaster />
          </button>
          <div style={{ flex: "1" }} />
          <div style={{ display: "flex", alignItems: "center" }}>
            <p>Back to ChatRoom!</p>
            <Link to="/Login">
              <button
                type="button"
                style={{ fontSize: "x-small" }}
                className="btn"
              >
                Login
              </button>
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
}