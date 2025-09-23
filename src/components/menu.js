import {
  Menu,
  MenuItem,
  MenuButton,
  SubMenu
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import ReactDom from 'react-dom'
export default function MenuModel({direction,userMenu,setCheckMenu,message,copyToClipboard,handleShare,deleteMessage}) {

  return(
    <>
     <Menu direction={direction}
  position="anchor" menuStyle={{ 
      height: 'auto',
      padding:'5px',
      borderRadius:'10px',
      minWidth: '80px',
      maxWidth: '90px',
      overflow: 'auto',
    }} onMenuChange={({ open }) => setCheckMenu(open)} menuButton={<MenuButton  style={{margin:'0px',border:'none',background:'none',padding:'0px',cursor:'pointer',width:'20px', maxHeight:'20px',borderRadius:'5px'}}> 
      <svg viewBox="0 0 20 20" height="100%" width="100%"x
          preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>ic-chevron-down-menu</title><path d="M9.99971 12.1L14.8997
           7.2C15.083 7.01667 15.3164 6.925 15.5997 6.925C15.883 6.925 16.1164 7.01667 16.2997 7.2C16.483 7.38333 16.5747 7.61667 16.5747
            7.9C16.5747 8.18333 16.483 8.41667 16.2997 8.6L10.6997 14.2C10.4997 14.4 10.2664 14.5 9.99971 14.5C9.73304 14.5 9.49971 14.4
             9.29971 14.2L3.69971 8.6C3.51637 8.41667 3.42471 8.18333 3.42471 7.9C3.42471 7.61667 3.51637 7.38333 3.69971 7.2C3.88304 7.01667
              4.11637 6.925 4.39971 6.925C4.68304 6.925 4.91637 7.01667 5.09971 7.2L9.99971 12.1Z" fill="#666666"></path></svg>
              </MenuButton>}>
      <MenuItem  onClick={typeof(message.message)==='string'?()=>copyToClipboard(message.message):'download'}>Copy</MenuItem>
      <MenuItem  onClick={()=>handleShare(message.message)}>Share</MenuItem>
      {userMenu&&
      <MenuItem onClick={()=>deleteMessage(message.message,message.image,message.id)}>Delete</MenuItem>}
    </Menu>
    </>
  );
}
