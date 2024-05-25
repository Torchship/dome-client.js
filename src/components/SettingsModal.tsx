import React, {useState} from 'react';
import Modal from 'react-modal';
import './SettingsModal.css';
import {useSettings} from './providers/SettingsProvider';
import BackArrow from '../assets/arrow-left.svg';

const settingsModalStyle = {
  overlay: {
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  },
  content: {
    borderRadius: '0',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '60vw',
    height: '60vh',
    marginRight: '-50%',
    padding: '0',
    margin: '0',
    border: 'none',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'var(--background-color)'
  },
};

export const SettingsModal: React.FC = () => {
  const {isSettingsOpen, setSettingsOpen} = useSettings();

  function closeModal() {
    if (setSettingsOpen)
      setSettingsOpen(false);
  }

  return (
    <Modal
      isOpen={isSettingsOpen}
      onRequestClose={closeModal}
      contentLabel="Settings"
      style={settingsModalStyle}
    >
      <div className="header">
        <button id='back-button'>
        <img src={BackArrow}></img>
        Close
        </button>
      </div>
      <div className="navbar">
        <div className='menu-item'>
          <div className='menu-title'>
            General
          </div>
        </div>
        <div className='menu-item'>
          <div className='menu-title'>
            Main Display
          </div>
        </div>
        <div className='menu-item'>
          <div className='menu-title'>
            Input Display
          </div>
        </div>
      </div>
      <div className="content">
        Meow
      </div>      
    </Modal>
  );
};

export default SettingsModal;