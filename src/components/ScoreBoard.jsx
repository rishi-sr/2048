import React from 'react';

export const ScoreBoard = ({ score, bestScore, scoreAddition }) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  return (
    <div className="scoreboard-container">
      <div className="score-card current-score">
        <span className="score-label">SCORE</span>
        <span className="score-value">{formatNumber(score)}</span>
        {scoreAddition && (
          <span key={scoreAddition.id} className="score-addition">
            +{formatNumber(scoreAddition.amount)}
          </span>
        )}
      </div>

      <div className="score-card best-score">
        <span className="score-label">BEST</span>
        <span className="score-value">{formatNumber(bestScore)}</span>
      </div>
    </div>
  );
};
