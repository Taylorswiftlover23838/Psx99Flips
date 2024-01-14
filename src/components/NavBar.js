import { toast } from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { IoChatboxOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import diamondImage from './diamonds.png'
import logo from './logo.png'
import socket from './socket';

function NavBar() {
  const serverbase = 'http://localhost:8080';
  const [showLoginButton, setShowLoginButton] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [code, setCode] = useState(''); 
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [showChat, setIsShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false)
  const [showChatButton, setShowChatLogin] = useState(true)
  const [inventory, setInventory] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const chatWindowRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleChat = () => setIsShowChat(!showChat);
  const toggleLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);
  const closeVerifyModal = () => setShowVerifyModal(false);
  const openMessageInput = () => setShowMessageInput(true);
  const closeChatLogin = () => setShowChatLogin(false);
  const toggleInventoryModal = () => setShowInventoryModal(true);
  const closeInventoryModal = () => setShowInventoryModal(false);
  const openDepositModal = () => setShowDepositModal(true);
  const closeDepositModal = () => setShowDepositModal(false)
  const handleModalClick = (event) => event.stopPropagation();


  useEffect(() => {
    const handleIncomingMessage = (data) => {
      const newMessage = {
        user: data.user,
        message: data.message,
        profileImage: data.profileImage,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on('message', handleIncomingMessage);

    return () => {
      socket.off('message', handleIncomingMessage);
    };
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e) => {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user.username;
  const profileImageUrl = user.thumbnail; 

  if (messageInput.trim() !== '') {
    socket.emit('message', { message: messageInput, user: username, profileImage: profileImageUrl });
    setMessageInput('');
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }
};

  const handleMessageChange = (e) => {
    if (e.target.value.length <= 140) {
      setMessageInput(e.target.value);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLoginButton(true);
    setProfileImageUrl('');
    toast.error('Logged out successfully');
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setShowLoginButton(false);
      setIsLoggedIn(true);
      closeVerifyModal();
      openMessageInput();
      closeChatLogin()
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.thumbnail) {
        setProfileImageUrl(user.thumbnail);
      }
    }
  }, []);

    const inventoryResponse = async () => {
        try {
          const inventoryData = await fetch(`${serverbase}/inventory`);
          const body = await inventoryData.json();
          setInventory(body.inventory || [])
          console.log('Inventory Data:', body.inventory); 
         
      } catch (error) {
          console.error('Error fetching inventoryData', error);
      }
    };

    const handleVerify = async () => {
      try {
          const verifyResponse = await fetch(`${serverbase}/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }), 
          })
  
          if (verifyResponse.ok) {
            const body = await verifyResponse.json()
            console.log(body)
            window.location.reload();
            toast.success(body.isNew ? "Created account" : "Welcome back")
            localStorage.setItem("token", body.token)
            localStorage.setItem("user", JSON.stringify({thumbnail: body.pfpUrl, userid: body.robloxId, username: body.username}))
          } else {
            toast.error('Code doesnt match')
          }
      } catch (error) {
        console.error('Error while verifying:', error);
      }
    };
    
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messageResponse = await fetch(`${serverbase}/messages`);
        if (messageResponse.ok) {
          const messagesData = await messageResponse.json();
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Error fetching messages', error);
      }
    };

    fetchMessages(); // Call fetchMessages on component mount
  }, []);



    const performLogin = async () => {
      try {
        const userInfoResponse = await fetch(`${serverbase}/userInfo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });
        const userInfoData = await userInfoResponse.json();
        console.log('Received userInfoData:', userInfoData);
  
        if (userInfoData.userId === undefined) {
          toast.error('Login Failed: Undefined User');
        }
  
        const codeResponse = await fetch(`${serverbase}/code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });
        const codeData = await codeResponse.json();
        console.log('Code:', codeData);
        setCode(codeData.code);
  
        if (userInfoData.userId !== undefined ) {
          setShowLoginModal(false);
          setShowVerifyModal(true);
        }
      } catch (error) {
        console.error('Error fetching userInfo:', error);
      }
    };
    return (
        <>
         <div className="navbar">
            <img src={logo} className='logo' alt='logo'/>

         <div className='container'>
              <div className="chatbar">
                <IoChatboxOutline onClick={toggleChat} className='chat-icon' />
                  <div className={`chat-window ${showChat ? 'show' : ''}`}>
                  <div>
                  {showChatButton && showLoginButton && (
                      <button className='chat-button' onClick={toggleLoginModal}>Login to Chat</button>
                    )}
                    <form onSubmit={sendMessage}>
                    <div className='chat-input-div'>
                    {showMessageInput && (
                     <input
                      type="text"
                      placeholder="Enter message"
                      className='chat-input'
                      value={messageInput}
                      onChange={handleMessageChange}
                     />
                    )}
                    </div>
                    </form>
                    <div className="message-container" ref={chatWindowRef}>
                      {messages.map((message, index) => (
                        <div key={index} className="message-box">
                        <img src={message.profileImage} className='chat-image' alt="Profile" />
                        <div className="message">
                        <div>{message.user}: {message.message}</div> 
                        </div>
                    </div>
                    ))}
                    </div>
                  </div>
                </div>
              </div>
             </div>
          {isLoggedIn &&  (
            <>
            <div className='balance'>
              <img src={diamondImage} alt='balance' className='diamondImage'/>
              <p className='diamonds'></p>
            </div>
            {showInventoryModal && (
              <>
                <div className='inventoryModal' onClick={closeInventoryModal} >
                  <div className='inventoryModalContent' onClick={handleModalClick}>
                  <span className="close-btn-inventory" onClick={closeInventoryModal}>
                  &times;
                  </span>
                  {inventory.length === 0 ? (
                    <>
                      <div className='inventory-box'>
                         <p className='emptyInvText'>No Pets!</p>
                         <div className='input-wrapper'>
                          <IoIosSearch className='search-icon' />
                          <input
                            className='item-search'
                            placeholder='Search' 
                          />
                        </div>
                         <button className='deposit' onClick={openDepositModal}>Deposit</button>
                         {showDepositModal && (
                          <>
                            <div className='modal' onClick={closeDepositModal}>
                              <div className='deposit-content' onClick={handleModalClick}>
                                <span className='close-btn-deposit' onClick={closeDepositModal}>
                                  &times;
                                </span>
                                <p>Depost</p>
                                <div className='deposit-box'>
                                  <div className='psxHolderBox'>
                                    <span className='green-dot'></span>
                                    <p className='psxHolderBoxText'>Psx99HolderBot</p>
                                    <button className='joinButton'>MailBox</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                         )}
                      </div>
                      <button className='withDraw'>Withdraw</button>
                    </>
                  ) : (
                  <>
                    <div className='inventory-box'>
                        <div className='input-wrapper'>
                          <IoIosSearch className='search-icon' />
                          <input
                            className='item-search'
                            placeholder='Search' 
                          />
                        </div>
                         <button className='deposit'>Deposit</button>
                      </div>
                    <button className='withDraw'>Withdraw</button>
                  </>
                )}                  
                  </div>
                </div>
              </>
            )}
            <button onClick={toggleInventoryModal} className='inventory'>Inventory</button>
            <div className="profileContainer">
            <img
                className='profileImage'
                src={profileImageUrl} 
                alt="Profile"
                onClick={toggleDropdown}
            />
            {isDropdownOpen && (
                <div className="dropdownContent">
                    <button onClick={handleLogout} className='logoutButton'>
                        Logout
                    </button>
                    <button className='profileButton'>
                      Profile 
                    </button>
                </div>
            )}
        </div>
            </>
          )}
          {showLoginButton && (
                  <button className="Login" onClick={toggleLoginModal}>
                  Login
                </button>
          )}
          </div>
          {showLoginModal && (
             <div className='modal' onClick={closeLoginModal}>
            <div className="modal-content" onClick={handleModalClick}>
                <h2 className="text">Login</h2>
                <button className="login" onClick={performLogin}>
                  Login
                </button>
                <span className="close-btn" onClick={closeLoginModal}>
                  &times;
                </span>
                <input
                  type="text"
                  className="username-input"
                  placeholder="Username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}
          {showVerifyModal && (
            <div className="modal" onClick={closeVerifyModal}>
              <div className="modal-content" onClick={handleModalClick}>
                <h2 className="text">Code</h2>
                <button className="login" onClick={handleVerify}>
                  Verify
                </button>
                <div className="code">{code}</div>
                <span className="close-btn" onClick={closeVerifyModal}>
                  &times;
                </span>
              </div>
            </div>
          )}
        </>
      );
    };

export default NavBar