import {React, useState} from 'react';
import { NavLink } from 'react-router-dom';
import { IoIosHome } from "react-icons/io";
import { CgMenuRightAlt } from "react-icons/cg";
import { BsCoin } from "react-icons/bs";

function SideBar({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => {
    setIsOpen(!isOpen)
  }

  const menuItem = [
    {
      path: "/",
      name: "Home",
      icon: <IoIosHome />,
    },
    {
      path: "/coinflip",
      name: "CoinFlip",
      icon: <BsCoin />,
    },
  ];

  return (
    <div className="container">
       <div style={{width: isOpen ? "150px" : "50px"}} className="sidebar">
           <div className="top_section" onClick={toggle}>
                <p style={{display: isOpen ? "" : "none"}}  >MENU</p>
               <p style={{display: isOpen ? "block" : "none"}} className="logo"></p>
               <div style={{marginLeft: isOpen ? "90px" : "0px"}} className="bars">
                   <CgMenuRightAlt onClick={toggle}/>
               </div>
           </div>
           
           {
               menuItem.map((item, index)=>(
                   <NavLink to={item.path} key={index} className="link" activeclassname="active">
                       <div className="icon">{item.icon}</div>
                       <div style={{display: isOpen ? "block" : "none"}} className="link_text">{item.name}</div>
                   </NavLink>
               ))
           }
       </div>
       <main>{children}</main>
    </div>
);
};

export default SideBar;