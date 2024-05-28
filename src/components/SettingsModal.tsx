import React, {useState} from 'react';
import Modal from 'react-modal';
import './SettingsModal.css';
import {useSettings} from './providers/SettingsProvider';
import Cross from '../assets/x.svg';
import Monitor from '../assets/monitor.svg';
import Button from './Button';
import OutputSettingsTab from './settings/OutputSettingsTab';
import InputSettingsTab from './settings/InputSettingsTab';
import GeneralSettingsTab from './settings/GeneralSettingsTab';

interface SettingsTab {
  label: string;
  icon?: string;
  content: React.ComponentType<any>
}

const TABS: SettingsTab[] = [
  { label: 'General', content: GeneralSettingsTab},
  { label: 'Output', icon: Monitor, content: OutputSettingsTab},
  { label: 'Input', icon: Monitor, content: InputSettingsTab}
];


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
  const [activeTab, setActiveTab] = useState<string>('General');

  function closeModal() {
    if (setSettingsOpen)
      setSettingsOpen(false);
  }

  function onTabClick(tab: SettingsTab) {
    setActiveTab(tab.label);
  }

  const ActiveTabContent = TABS.find(tab => tab.label === activeTab)?.content;

  return (
    <Modal
      isOpen={isSettingsOpen}
      onRequestClose={closeModal}
      contentLabel="Settings"
      style={settingsModalStyle}
    >
      <div className="header">
        <Button onClick={() => setSettingsOpen?.(false)}>
          <img src={Cross} style={{filter: 'invert(1)'}}></img>
        </Button>
      </div>
      <div className="navbar">
        {TABS.map(tab => (
          <div className={`menu-item ${tab.label === activeTab ? 'selected' : ''}`} onClick={() => onTabClick(tab)}>
            {tab.icon
              ? (<div className="menu-icon"><img src={tab.icon} style={{filter: 'invert(1)'}}></img></div>)
              : null
            }
            <div className='menu-title'>
              {tab.label}
            </div>
          </div>
        ))}
      </div>
      <div className="content">
        {ActiveTabContent && <ActiveTabContent/>}
      </div>      
    </Modal>
  );
};

export default SettingsModal;