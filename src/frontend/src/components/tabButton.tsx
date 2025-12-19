import React from 'react';

interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ElementType;
  count: number;
  activeTab: string;
  darkMode: boolean;
  onClick: (id: string) => void;
}

export const TabButton: React.FC<TabButtonProps> = ({
  id,
  label,
  icon: Icon,
  count,
  activeTab,
  darkMode,
  onClick
}) => {
  const isActive = activeTab === id;
  
  return (
    <button
      onClick={() => onClick(id)}
      className={`tab-button ${
        isActive
          ? 'tab-button-active'
          : darkMode
            ? 'tab-button-inactive-dark'
            : 'tab-button-inactive-light'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      <span
        className={`tab-count ${
          isActive
            ? 'tab-count-active'
            : darkMode
              ? 'tab-count-inactive-dark'
              : 'tab-count-inactive-light'
        }`}
      >
        {count}
      </span>
    </button>
  );
};