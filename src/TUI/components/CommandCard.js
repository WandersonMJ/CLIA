import React from 'react';

export default function CommandCard({ title, description }) {
  return (
    <div className="command-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
