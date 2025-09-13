// Package Block
import { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
   const [active, setActive] = useState(false);
   const [bot, setbot] = useState(false);
 

  return (
    <ChatContext.Provider value={{ active, setActive, bot, setbot}}>
      {children}
    </ChatContext.Provider>
  );
};
