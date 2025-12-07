// src/components/ui/Card.jsx

export default function Card({ 
  children, 
  className = '',
  hover = false,
  onClick = null
}) {
  const hoverClass = hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : '';
  const clickable = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-6 ${hoverClass} ${clickable} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}