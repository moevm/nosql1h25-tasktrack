// Dashboard.jsx
import React, { useState } from "react";
import Graph from "./Graph"; // Импортируем компонент с графом

export default function Dashboard() {
  const [showGraph, setShowGraph] = useState(false);

  return (
    <div className="main-content">
      <h1>Личный Кабинет</h1>
      <button
        className="btn btn-primary"
        onClick={() => setShowGraph(!showGraph)}
      >
        {showGraph ? "Скрыть граф" : "Показать граф"}
      </button>

      {showGraph && <Graph />} {/* Показать граф по нажатию */}
    </div>
  );
}
