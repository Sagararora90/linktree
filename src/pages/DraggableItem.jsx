import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function DraggableItem({ item, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const tx = transform ? transform.x : 0;
  const ty = transform ? transform.y : 0;

  const baseStyle = {
    position: 'absolute',
    left: `${item.x ?? 50}px`,
    top: `${item.y ?? 100}px`,
    transform: `translate3d(${tx}px, ${ty}px, 0)`,
    zIndex: isSelected ? 20 : 1,
    cursor: 'grab',
    userSelect: 'none',
    transition: transform ? 'none' : 'box-shadow 0.2s, border-color 0.2s',
  };

  const typeStyles = {
    link: {
      fontFamily: item.font || "'Inter', sans-serif",
      color: item.color || 'var(--text-primary)',
      backgroundColor: item.bgColor || 'var(--bg-elevated)',
      padding: '14px 24px',
      borderRadius: 'var(--radius)',
      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
      boxShadow: isSelected ? '0 0 0 3px var(--accent-soft)' : 'var(--shadow)',
      fontWeight: 600,
      fontSize: '0.95rem',
      textAlign: 'center',
      minWidth: '120px',
    },
    text: {
      fontFamily: item.font || "'Inter', sans-serif",
      color: item.color || 'var(--text-primary)',
      backgroundColor: item.bgColor || 'transparent',
      padding: '8px 12px',
      borderRadius: '8px',
      border: isSelected ? '2px solid var(--accent)' : '1px dashed transparent',
      fontWeight: 500,
      fontSize: '1rem',
    },
    sticker: {
      padding: 0,
      background: 'transparent',
      borderRadius: '8px',
      border: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
      boxShadow: isSelected ? '0 0 0 3px var(--accent-soft)' : 'none',
      overflow: 'hidden',
    },
  };

  const style = { ...baseStyle, ...(typeStyles[item.type] || typeStyles.text) };

  const renderContent = () => {
    if (item.type === 'sticker') {
      return (
        <img
          src={item.url}
          alt="uploaded"
          draggable={false}
          style={{ width: `${item.width || 120}px`, height: 'auto', display: 'block', pointerEvents: 'none' }}
        />
      );
    }
    return <span>{item.content || 'Empty'}</span>;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        // Forward to dnd-kit for dragging
        if (listeners?.onPointerDown) listeners.onPointerDown(e);
      }}
      onClick={(e) => {
        // Stop bubbling so the parent doesn't deselect immediately
        e.stopPropagation();
        onSelect(item.id);
      }}
    >
      {renderContent()}
    </div>
  );
}
