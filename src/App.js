import React, { useState, useEffect } from "react";

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function Square({ value, onClick, highlight, darkMode }) {
  return (
    <button className={`square ${highlight ? "highlight" : ""}`} onClick={onClick}>
      {value}
    </button>
  );
}

function calculateWinner(board) {
  for (let line of LINES) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: [] };
}

function minimax(board, player, ai, human) {
  const { winner } = calculateWinner(board);
  if (winner === human) return { score: -10 };
  if (winner === ai) return { score: 10 };
  if (board.every(Boolean)) return { score: 0 };

  const moves = [];
  board.forEach((v, i) => {
    if (!v) {
      const move = {};
      move.index = i;
      board[i] = player;
      const result = minimax(board, player === ai ? human : ai, ai, human);
      move.score = result.score;
      board[i] = null;
      moves.push(move);
    }
  });

  let best;
  if (player === ai) {
    let max = -Infinity;
    moves.forEach(m => { if (m.score > max) { max = m.score; best = m; }});
  } else {
    let min = Infinity;
    moves.forEach(m => { if (m.score < min) { min = m.score; best = m; }});
  }
  return best;
}

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState("1p");
  const [difficulty, setDifficulty] = useState("hard");
  const [winnerInfo, setWinnerInfo] = useState({ winner: null, line: [] });
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const info = calculateWinner(board);
    if (info.winner) {
      setWinnerInfo(info);
      setScores(p => ({ ...p, [info.winner]: p[info.winner] + 1 }));
    } else if (board.every(Boolean)) {
      setIsDraw(true);
    }
  }, [board]);

  useEffect(() => {
    if (mode === "1p" && !xIsNext && !winnerInfo.winner && !board.every(Boolean)) {
      setTimeout(() => {
        const ai = "O", human = "X";
        const copy = board.slice();
        const move = difficulty === "easy"
          ? copy.map((v,i)=>v?null:i).filter(v=>v!==null)[Math.floor(Math.random()*copy.filter(v=>!v).length)]
          : minimax(copy, ai, ai, human).index;
        copy[move] = ai;
        setBoard(copy);
        setXIsNext(true);
      }, 300);
    }
  }, [xIsNext, mode]);

  function handleClick(i) {
    if (board[i] || winnerInfo.winner) return;
    if (mode === "1p" && !xIsNext) return;
    const copy = board.slice();
    copy[i] = xIsNext ? "X" : "O";
    setBoard(copy);
    setXIsNext(!xIsNext);
  }

  function restart() {
    setBoard(Array(9).fill(null));
    setWinnerInfo({ winner: null, line: [] });
    setIsDraw(false);
    setXIsNext(true);
  }

  const gameOver = winnerInfo.winner || isDraw;

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="card">
        <div className="top-row">
          <h1>Tic Tac Toe</h1>
          <div className="theme-switch">
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="slider"></span>
            </label>
            <span className="theme-label">{darkMode ? "Dark" : "Light"}</span>
          </div>
        </div>

        <div className="controls-row">
          <div className="mode-btns">
            <button className={`mode-btn ${mode==="1p"?"active":""}`} 
                    onClick={()=>{setMode("1p");restart();}}>1 Player</button>
            <button className={`mode-btn ${mode==="2p"?"active":""}`} 
                    onClick={()=>{setMode("2p");restart();}}>2 Players</button>
          </div>
          
          {mode==="1p" && (
            <select value={difficulty} onChange={e=>{setDifficulty(e.target.value);restart();}}>
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
            </select>
          )}
        </div>

        <div className="score-row">
          <div className="score">X: {scores.X}</div>
          <div className="score">O: {scores.O}</div>
        </div>

        <div className="game-area">
          <div className="board">
            {board.map((v,i)=>(
              <Square key={i} value={v} onClick={()=>handleClick(i)} 
                      highlight={winnerInfo.line.includes(i)} darkMode={darkMode}/>
            ))}
          </div>
          
          {gameOver && (
            <div className="center-popup">
              <h2>{winnerInfo.winner ? 
                   (mode==="1p" && winnerInfo.winner==="X" ? "🎉 You Win!" : "🏆 Winner!") : 
                   "🤝 Draw!"}</h2>
              <button className="play-again-btn" onClick={restart}>Play Again</button>
            </div>
          )}
        </div>

        <div className="status-row">
          {winnerInfo.winner ? 
           (mode==="1p" ? (winnerInfo.winner==="X" ? "You Win!" : "AI Wins!") : `${winnerInfo.winner} Wins!`) : 
           isDraw ? "Game Draw!" : 
           `${xIsNext?"X":"O"}'s Turn`}
        </div>

        <button className="restart-btn" onClick={restart}>Restart Game</button>
      </div>
    </div>
  );
}