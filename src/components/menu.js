import {
  Menu,
  MenuItem,
  MenuButton,
  SubMenu
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import ReactDom from 'react-dom'
export default function MenuModel({position,active,index,message,copyToClipboard,handleShare,deleteMessage}) {
 
  return ReactDom.createPortal(
    <>
     <Menu direction="left"
  position="anchor" menuStyle={{ height: '100px',
      position: 'absolute',
       top: position.top,
        left: position.left,

      zIndex: 1000,
    minWidth: '80px',
    maxWidth: '120px',
     overflow: 'auto',
    }}  menuButton={<MenuButton onClick={()=>active(index)} style={{width:'20px', minHeight:'10px',maxHeight:'30px',borderRadius:'5px',alignItems:'center'}}>▾</MenuButton>}>
      <MenuItem onClick={typeof(message.message)==='string'?()=>copyToClipboard(message.message):'download'}>Copy</MenuItem>
      <MenuItem onClick={()=>handleShare(message.message)}>Share</MenuItem>
      <MenuItem onClick={()=>deleteMessage(message.message,message.image)}>Delete</MenuItem>
    </Menu>
    </>,
    document.getElementById('portal')
  );
}
