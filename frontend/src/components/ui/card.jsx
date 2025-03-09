import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`border rounded-lg shadow p-4 bg-white ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children }) => {
  return <div>{children}</div>;
};

export { Card, CardContent };
