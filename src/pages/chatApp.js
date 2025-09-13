// Package Block
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "@szhsin/react-menu/dist/index.css";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import * as linkify from "linkifyjs";
import ReactMarkdown from "react-markdown";

//Component Block
import Navbar from "../components/navbar";
import { ChatContext } from "../Context API/Context";
import MenuModel from "../components/menu";
import { useListMenuPosition } from "./../components/useListMenuPosition";

// Socket Connect
const socket = io.connect("http://localhost:5000", {
  auth: { serverOffset: 0 },
});

function ChatApp() {
  const [message, setMessage] = useState("");
  const [imageChunks, setImageChunks] = useState([]);
  const [Search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [FriendName, setFriendName] = useState("");
  const [chat, setChats] = useState([]);
  const [Users, setUsers] = useState([]);
  const [SearchUser, setSearchUsers] = useState([]);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { active, setActive } = useContext(ChatContext);
  const { bot, setbot } = useContext(ChatContext);
  const [menuOpen, setMenuOpen] = useState("false");
  const anchorRef = useRef([null]);
  const scrollContainerRef = useRef();
  const position = useListMenuPosition(anchorRef, scrollContainerRef);
  const [result, setresult] = useState({});
  console.log("chatbot", message);
  const action = async () => {
    const res = await fetch("http://localhost:5000/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: message }),
    });
    const data = await res.json();
    const content = data.content
      .replace(/^(analysis\s*&assistantfinal\l*)/, "")
      .trim();
    const reasoning = data.reasoning;
    const reasoning_details = data.reasoning_details;

    setresult({
      content: content,
      reasoning: reasoning,
      reasoning_details: reasoning_details,
    });
    setMessage("");
    console.log(data);
  };
  const user = sessionStorage.getItem("username");
  console.log(user);
  const navigate = useNavigate();

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const preventScroll = (e) => e.preventDefault();

    if (menuOpen) {
      el.addEventListener("wheel", preventScroll, { passive: false });
      el.addEventListener("touchmove", preventScroll, { passive: false });
    }

    return () => {
      el.removeEventListener("wheel", preventScroll);
      el.removeEventListener("touchmove", preventScroll);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!user) {
      return navigate(`./Login`);
    }

    (async () => {
      const res = await fetch(`http://localhost:5000/Friend?username=${user}`);
      const data = await res.json();

      if (res.status === 200) {
        console.log(data);
        setUsers(() => [...data.friends]);
      }
    })();

    socket.on(
      "message",
      (username, friendName, message, imageUrls, serverOffset) => {
        console.log(username, friendName, message, imageUrls);
        setChats((prev) => [
          ...prev,
          { from: username, message: message, image: imageUrls },
        ]);
        socket.auth.serverOffset = serverOffset;
      }
    );
    socket.on("uploadStarted", (fileName) => {
      console.log(`Uploading ${fileName}...`);
      setUploading(true);
    });

    socket.on("uploadComplete", (image) => {
      console.log("Upload finished:", image);
      setUploading(false);
      setImageChunks(() => []);
    });

    // 🧹 Clean up on unmount
    return () => {
      socket.off();
    };
  }, [user]);

  const handleSubmit = async (friendName) => {
    if (message || imageChunks.length) {
      console.log(message);
      socket.emit("sendMessage", {
        username: user,
        friendName,
        message,
        imageChunks,
      });

      setMessage("");
      inputRef.current.value = "";
    }
  };

  const SearchUsers = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/Friend?search=${Search}`);
    const data = await res.json();
    console.log(data);
    setSearchUsers(() => [...data]);
  };

  const getMessages = async (friendName) => {
    if (chat.length > 0) setChats(() => []);
    const res = await fetch(
      `http://localhost:5000/Friend/messages?username=${user}&friendName=${friendName}`
    );
    const data = await res.json();

    setFriendName(friendName);
    if (!active) setActive(true);
    if (bot) setbot(false);
    if (res.status === 200) {
      console.log(data);
      setChats(() => [...data.chatList]);
    }
  };

  const addFriend = async (friendName) => {
    const res = await fetch(`http://localhost:5000/Friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user, friendName }),
    });
    const data = await res.json();
    console.log(data);

    setUsers(() => [...data.friends]);
  };

  const deleteMessage = async (message, image) => {
    const res = await fetch(`http://localhost:5000/messages`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: user, FriendName, message, image }),
    });
    const data = await res.json();
    console.log(data);

    setChats(() => [...data.messageList]);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async (message) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shared from Chat App",
          text: message,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  function testlink(message) {
    const test = linkify.find(message);
    if (test[0]?.isLink) {
      return test[0]?.value;
    }
    console.log(test[0]?.isLink, message, chat);
    return test[0]?.isLink;
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const CHUNK_SIZE = 1024 * 512; // 1MB
    const chunks = [];
    let offset = 0;

      function sendChunk() {
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const reader = new FileReader();

        reader.onloadend = () => {
          chunks.push({
            chunk: reader.result,
            fileName: file.name,
            mimeType: file.type,
            offset,
            isLast: offset + CHUNK_SIZE >= file.size,
          });

          offset += CHUNK_SIZE;
          if (offset < file.size) {
            sendChunk();
          } else {
            setImageChunks(chunks); // Store all chunks in state
          }
        };

        reader.readAsArrayBuffer(chunk);
      }

    sendChunk();
    setImageChunks();
  };

  const Spinner = () => (
    <div className="wrapper">
      <div className="loader">Uploading...</div>
    </div>
  );

  console.log(chat);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        overflow: "hidden",
        width: "100%",
        color: "white",
      }}
    >
      <div style={{ width: "75px" }}>
        <Navbar />
      </div>
      <div
        style={{
          listStyle: "none",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          color: "black",
        }}
      >
        {!Search ? (
          <>
            <div
              style={{
                borderLeft: "1px solid #E5E5E5",
                padding: "5px",
                borderRight: "1px solid #E5E5E5",
                color: "black",
                backgroundColor: "#ffffff",
                overflowY: "auto",
                minWidth: "320px",
              }}
            >
              <h2 style={{ color: "steelblue" }}>Chat Room</h2>
              <div
                style={{
                  display: "flex",
                  padding: "4px",
                  flexDirection: "row",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              >
                <input
                  style={{ border: "none", outline: "none" }}
                  type="search"
                  name="search"
                  value={Search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                />
                <span
                  aria-hidden="false"
                  style={{ cursor: "pointer", marginLeft: "auto" }}
                  onClick={SearchUsers}
                  data-icon="search-refreshed-thin"
                  class=""
                >
                  <svg
                    viewBox="0 0 20 20"
                    height="20"
                    width="20"
                    preserveAspectRatio="xMidYMid meet"
                    class=""
                    fill="none"
                  >
                    <title>search-refreshed-thin</title>
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M4.36653 4.3664C5.36341 3.36953 6.57714 2.87
              8.00012 2.87C9.42309 2.87 10.6368 3.36953 11.6337 4.3664C12.6306 5.36329 13.1301 6.57724 13.1301 8.00062C13.1301 8.57523 13.0412 9.11883 12.8624
              9.63057C12.6972 10.1038 12.4733 10.5419 12.1909 10.9444L16.5712 15.3247C16.7454 15.4989 16.8385 15.7046 16.8385 15.9375C16.8385 16.1704 16.7454
              16.3761 16.5712 16.5503C16.396 16.7254 16.1866 16.8175 15.948 16.8175C15.7095 16.8175 15.5001 16.7254 15.3249 16.5503L10.9448 12.1906C10.5421 12.4731
              10.104 12.697 9.63069 12.8623C9.11895 13.041 8.57535 13.13 8.00074 13.13C6.57736 13.13 5.36341 12.6305 4.36653 11.6336C3.36965 10.6367 2.87012 9.42297
              2.87012 8C2.87012 6.57702 3.36965 5.36328 4.36653 4.3664ZM8.00012 4.63C7.06198 4.63 6.26877 4.95685 5.61287 5.61275C4.95698 6.26865 4.63012 7.06186
              4.63012 8C4.63012 8.93813 4.95698 9.73134 5.61287 10.3872C6.26877 11.0431 7.06198 11.37 8.00012 11.37C8.93826 11.37 9.73146 11.0431 10.3874
              10.3872C11.0433 9.73134 11.3701 8.93813 11.3701 8C11.3701 7.06186 11.0433 6.26865 10.3874 5.61275C9.73146 4.95685 8.93826 4.63 8.00012 4.63Z"
                      fill="#626262"
                    ></path>
                  </svg>
                </span>
              </div>
              <ul
                style={{
                  margin: "0px",
                  justifyItems: "left",
                  padding: "10px",
                  listStyleType: "none",
                }}
              >
                {Users.map((user, index) => (
                  <li
                    key={index}
                    style={{
                      width: "100%",
                      padding: "3px",
                      rowGap: "50px",
                      height: "100%",
                    }}
                  >
                    <button
                      onClick={() => getMessages(user.friendName)}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        outline: "none",
                        width: "100%",
                        padding: "5px",
                        backgroundColor: "#EAEAEA",
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        data-icon="account-circle"
                        class=""
                      >
                        <svg
                          viewBox="0 0 24 24"
                          height="42"
                          width="42"
                          preserveAspectRatio="xMidYMid meet"
                          class="x1vef352 x1rg5ohu"
                          fill="none"
                        >
                          <title>{user.friendName}</title>
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22
              12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6
               15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                            fill="grey"
                          ></path>
                        </svg>
                      </span>
                      <p
                        style={{
                          fontSize: "medium",
                          width: "auto",
                          marginRight: "auto",
                          borderRadius: "5px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {user.friendName.toUpperCase()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {active ? (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "auto",
                  flexDirection: "column",
                  margin: "0px",
                  color: "black",
                  backgroundColor: "#F2ECE5",
                }}
              >
                <div
                  style={{
                    padding: "5px",
                    backgroundColor: "steelblue",
                    fontSize: "x-large",
                    fontStyle: "italic",
                    color: "white",
                  }}
                >
                  {bot ? "ChatGPT" : FriendName.toUpperCase()}
                </div>
                <div style={{ flex: "1" }} />
                <ul
                  ref={scrollContainerRef}
                  style={{
                    listStyle: "none",
                    margin: "0px",
                    padding: "0px",
                    overflowY: "auto",
                  }}
                >
                  {bot ? (
                    <li style={{ position: "relative" }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {result.content}
                      </ReactMarkdown>
                      <ReactMarkdown>{result.reasoning}</ReactMarkdown>
                      <>
                        {result.reasoning_details > 0 &&
                          result.reasoning_details.map((res) => (
                            <ReactMarkdown>{res.text}</ReactMarkdown>
                          ))}
                      </>
                    </li>
                  ) : (
                    // Scroll

                    Array.isArray(chat) &&
                    chat.length > 0 &&
                    chat?.map((message, index) => (
                      <>
                        {message.from === user ? (
                          <li
                            key={index}
                            ref={anchorRef}
                            style={{
                              borderBottom: "1px solid #eee",
                              textAlign: "end",
                              padding: "5px",
                              width: "fit-content",
                              marginLeft: "auto",
                              position: "relative",
                            }}
                          >
                            <div className="chatCard">
                              {testlink(message.message) ? (
                                <div
                                  style={{
                                    maxWidth: "250px",
                                    wordWrap: "break-word",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  <a
                                    href={testlink(message.message)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {message.message}
                                  </a>
                                </div>
                              ) : (
                                <>
                                  {message.image?.length > 0 &&
                                  message.message ? (
                                    <div>
                                      <img
                                        src={message.image}
                                        alt="uploaded"
                                        width={300}
                                      />
                                      <div
                                        style={{
                                          maxWidth: "200px",
                                          wordWrap: "break-word",
                                          whiteSpace: "normal",
                                        }}
                                      >
                                        {message.message}
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {message.image?.length > 0 ? (
                                        <img
                                          src={message.image}
                                          alt="uploaded"
                                          width={300}
                                        />
                                      ) : (
                                        <div
                                          style={{
                                            maxWidth: "200px",
                                            wordWrap: "break-word",
                                            whiteSpace: "normal",
                                          }}
                                        >
                                          {message.message}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              <MenuModel
                                direction="left"
                                userMenu="userMenu"
                                position={position}
                                anchorRef={anchorRef?.current[index]}
                                setCheckMenu={setMenuOpen}
                                CheckMenu={menuOpen}
                                index={index}
                                message={message}
                                copyToClipboard={copyToClipboard}
                                handleShare={handleShare}
                                deleteMessage={deleteMessage}
                              />
                            </div>
                          </li>
                        ) : (
                          <li
                            key={index}
                            ref={anchorRef}
                            style={{
                              borderBottom: "1px solid #eee",
                              textAlign: "start",
                              padding: "5px",
                              width: "fit-content",
                            }}
                          >
                            <div
                              style={{ backgroundColor: "silver" }}
                              className="chatCard"
                            >
                              {testlink(message.message) ? (
                                <div
                                  style={{
                                    maxWidth: "250px",
                                    wordWrap: "break-word",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  <a
                                    href={testlink(message.message)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {message.message}
                                  </a>
                                </div>
                              ) : (
                                <>
                                  {message.image?.length > 0 &&
                                  message.message ? (
                                    <div>
                                      <img
                                        src={message.image}
                                        alt="uploaded"
                                        width={300}
                                      />
                                      <div
                                        style={{
                                          maxWidth: "200px",
                                          wordWrap: "break-word",
                                          whiteSpace: "normal",
                                        }}
                                      >
                                        {message.message}
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {message.image?.length > 0 ? (
                                        <img
                                          src={message.image}
                                          alt="uploaded"
                                          width={300}
                                        />
                                      ) : (
                                        <div
                                          style={{
                                            maxWidth: "200px",
                                            wordWrap: "break-word",
                                            whiteSpace: "normal",
                                          }}
                                        >
                                          {message.message}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </>
                              )}

                              <MenuModel
                                direction="right"
                                userMenu=""
                                position={position}
                                anchorRef={anchorRef?.current[index]}
                                setCheckMenu={setMenuOpen}
                                CheckMenu={menuOpen}
                                index={index}
                                message={message}
                                copyToClipboard={copyToClipboard}
                                handleShare={handleShare}
                                deleteMessage={deleteMessage}
                              />
                            </div>
                          </li>
                        )}
                      </>
                    ))
                  )}
                </ul>
                <div>{uploading && <Spinner />}</div>
                <div style={{ padding: "10px", paddingTop: "0px" }}>
                  <div
                    style={{
                      display: "flex",
                      cursor: "pointer",
                      flexDirection: "row",
                      backgroundColor: "#ffffff",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      padding: "5px",
                    }}
                  >
                    <label for="fileUpload" className="custom-upload">
                      +
                    </label>
                    <input
                      id="fileUpload"
                      style={{ marginRight: "auto", display: "none" }}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={inputRef}
                    />
                    <input
                      style={{
                        border: "none",
                        outline: "none",
                        fontSize: "medium",
                        width: "100%",
                      }}
                      type="text"
                      value={message}
                      placeholder="Your message"
                      onChange={(event) => setMessage(event.target.value)}
                    />
                    <button
                      style={{
                        border: "none",
                        borderRadius: "5px",
                        backgroundColor: "#007bff",
                        outline: "none",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        bot ? action() : handleSubmit(FriendName)
                      }
                    >
                      <span
                        aria-hidden="true"
                        data-icon="wds-ic-send-filled"
                        class=""
                      >
                        <svg
                          viewBox="0 0 24 24"
                          height="24"
                          width="24"
                          preserveAspectRatio="xMidYMid meet"
                          class=""
                          fill="none"
                        >
                          <title>wds-ic-send-filled</title>
                          <path
                            d="M5.4 19.425C5.06667 19.5583 4.75 19.5291 4.45 19.3375C4.15 19.1458 4 18.8666 4 18.5V14L12 12L4 9.99997V5.49997C4 5.1333 4.15 4.85414
           4.45 4.66247C4.75 4.4708 5.06667 4.44164 5.4 4.57497L20.8 11.075C21.2167 11.2583 21.425 11.5666 21.425 12C21.425 12.4333 21.2167 12.7416 20.8
            12.925L5.4 19.425Z"
                            fill="white"
                          ></path>
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <h1
                style={{
                  width: "100%",
                  height: "100vh",
                  backgroundColor: "#F2ECE5",
                  color: "black",
                  margin: "0",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                Chat Room
              </h1>
            )}
          </>
        ) : (
          <>
            <div
              style={{
                borderLeft: "1px solid #E5E5E5",
                padding: "5px",
                borderRight: "1px solid #E5E5E5",
                color: "black",
                backgroundColor: "#ffffff",
                overflowY: "auto",
                width: "20%",
              }}
            >
              <h2 style={{ color: "steelblue" }}>Chat Room</h2>
              <div
                style={{
                  display: "flex",
                  padding: "4x",
                  flexDirection: "row",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              >
                <input
                  style={{ border: "none", outline: "none" }}
                  type="search"
                  name="search"
                  value={Search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                />
                <span
                  aria-hidden="false"
                  style={{ cursor: "pointer" }}
                  onClick={SearchUsers}
                  data-icon="search-refreshed-thin"
                  class=""
                >
                  <svg
                    viewBox="0 0 20 20"
                    height="20"
                    width="20"
                    preserveAspectRatio="xMidYMid meet"
                    class=""
                    fill="none"
                  >
                    <title>search-refreshed-thin</title>
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M4.36653 4.3664C5.36341 3.36953 6.57714 2.87
              8.00012 2.87C9.42309 2.87 10.6368 3.36953 11.6337 4.3664C12.6306 5.36329 13.1301 6.57724 13.1301 8.00062C13.1301 8.57523 13.0412 9.11883 12.8624
              9.63057C12.6972 10.1038 12.4733 10.5419 12.1909 10.9444L16.5712 15.3247C16.7454 15.4989 16.8385 15.7046 16.8385 15.9375C16.8385 16.1704 16.7454
              16.3761 16.5712 16.5503C16.396 16.7254 16.1866 16.8175 15.948 16.8175C15.7095 16.8175 15.5001 16.7254 15.3249 16.5503L10.9448 12.1906C10.5421 12.4731
              10.104 12.697 9.63069 12.8623C9.11895 13.041 8.57535 13.13 8.00074 13.13C6.57736 13.13 5.36341 12.6305 4.36653 11.6336C3.36965 10.6367 2.87012 9.42297
              2.87012 8C2.87012 6.57702 3.36965 5.36328 4.36653 4.3664ZM8.00012 4.63C7.06198 4.63 6.26877 4.95685 5.61287 5.61275C4.95698 6.26865 4.63012 7.06186
              4.63012 8C4.63012 8.93813 4.95698 9.73134 5.61287 10.3872C6.26877 11.0431 7.06198 11.37 8.00012 11.37C8.93826 11.37 9.73146 11.0431 10.3874
              10.3872C11.0433 9.73134 11.3701 8.93813 11.3701 8C11.3701 7.06186 11.0433 6.26865 10.3874 5.61275C9.73146 4.95685 8.93826 4.63 8.00012 4.63Z"
                      fill="#626262"
                    ></path>
                  </svg>
                </span>
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  backgroundColor: "tomato",
                  color: "black",
                }}
              >
                {SearchUser.map((user, index) => (
                  <li
                    key={index}
                    style={{
                      border: "1px solid",
                      padding: "5px",
                      gap: "10px",
                      borderColor: "blueviolet",
                      borderRadius: "5px",
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <div>{user.username}</div>
                    <button onClick={() => addFriend(user.username)}>
                      AddFriend
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatApp;