import React from 'react';
import { FaRegImage } from "react-icons/fa6";
import { MdEventAvailable, MdImage, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import Link from 'next/link';
import { useRouter } from "next/router";


const Navbar = (props) => {
    const router = useRouter();
    
    return (
        <>
            {props.loading ? (  // Check if loading prop is true
               <div className='loader'> <span className="loader2"></span> </div>
            ) : (
                <nav className={props.expand ? 'm-navbar expand' : 'm-navbar unexpand'}>
                    <ul>
                        {/*  Event */}
                        <li>
                            <Link href="/admin/event/addEvent">
                                <span className="icons"><MdEventAvailable /></span>
                                <span className="linklabel">Event</span>
                                <span className="submenuIcon"><MdOutlineKeyboardArrowDown /></span>
                            </Link>
                            <ul>
                                <li><Link href="/admin/event/create-event">Add Event</Link></li>
                                <li><Link href="/admin/event/manageEvent">Manage Event</Link></li>
                            </ul>
                        </li>
                        {/* <li>
                            <Link href="/admin/event/addEvent">
                                <span className="icons"><MdImage /></span>
                                <span className="linklabel">Creatives</span>
                                <span className="submenuIcon"><MdOutlineKeyboardArrowDown /></span>
                            </Link>
                            <ul>
                                <li><Link href="/admin/event/addEvent">Add Creatives</Link></li>
                                <li><Link href="/admin/event/manageEvent">Manage Creatives</Link></li>
                            </ul>
                        </li> */}
                        {/* Users */}
                        <li>
                            <Link href="/admin/event/userlist">
                                <span className="icons"><FaRegUser /></span>
                                <span className="linklabel">Users</span>
                                <span className="submenuIcon"><MdOutlineKeyboardArrowDown /></span>
                            </Link>
                            <ul>
                                <li><Link href="/admin/event/userlist">Users Listing</Link></li>
                            </ul>
                        </li>
                        <li>
                            <Link href="/admin/add-users/">
                                <span className="icons"><RiListSettingsLine /></span>
                                <span className="linklabel">Send Link</span>
                            </Link>
                        </li>
                        {/* Upload Excel */}
                        <li>
                            <Link href="/admin/event/upload">
                                <span className="icons"><RiListSettingsLine /></span>
                                <span className="linklabel">Upload Excel</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            )}
        </>
    );
}

export default Navbar;
