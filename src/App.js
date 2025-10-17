import React, { useState, useEffect } from "react";

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function Square({value, onClick, highlight}) {
  return (
    <button
      className={`square ${highlight ? "highlight" : ""}`}
      onClick={onClick}
      aria-label={value ? `Square ${value}` : 'Empty square'}
    >
      {value}
    </button>
  );
}

function calculateWinner(board) {
  for (let i=0;i<LINES.length;i++){
    const [a,b,c] = LINES[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  return { winner: null, line: [] };
}

function minimax(newBoard, player, aiPlayer, huPlayer) {
  const { winner } = calculateWinner(newBoard);
  if (winner === huPlayer) return { score: -10 };
  if (winner === aiPlayer) return { score: 10 };
  if (newBoard.every(Boolean)) return { score: 0 };

  const avail = newBoard.map((v,i) => v ? null : i).filter(v=>v!==null);
  const moves = [];

  for (let i=0;i<avail.length;i++){
    const idx = avail[i];
    const move = {};
    move.index = idx;
    newBoard[idx] = player;

    const result = minimax(newBoard, player === huPlayer ? aiPlayer : huPlayer, aiPlayer, huPlayer);
    move.score = result.score;

    newBoard[idx] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    moves.forEach(m => { if (m.score > bestScore) { bestScore = m.score; bestMove = m; }});
  } else {
    let bestScore = Infinity;
    moves.forEach(m => { if (m.score < bestScore) { bestScore = m.score; bestMove = m; }});
  }
  return bestMove;
}

export default function App(){
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState('1p');
  const [difficulty, setDifficulty] = useState('hard');
  const [winnerInfo, setWinnerInfo] = useState({winner:null, line:[]});
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({X:0, O:0});
  const [thinking, setThinking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    const info = calculateWinner(board);
    if (info.winner) {
      setWinnerInfo(info);
      setIsDraw(false);
      setScores(prev => ({...prev, [info.winner]: prev[info.winner] + 1}));

      // Determine message
      if (mode === "1p") {
        const msg = info.winner === 'X' ? "🎉 You Win!" : "😞 You Lose!";
        setResultMessage(msg);
      } else {
        setResultMessage(`🎉 Player ${info.winner} Wins!`);
      }
      setTimeout(() => setShowResult(true), 400);

    } else if (board.every(Boolean)) {
      setIsDraw(true);
      setWinnerInfo({winner:null,line:[]});
      setResultMessage("😐 It's a Draw!");
      setTimeout(() => setShowResult(true), 400);
    } else {
      setIsDraw(false);
      setWinnerInfo({winner:null,line:[]});
    }
  }, [board]);

  useEffect(() => {
    if (mode === '1p') {
      const humanIsX = true;
      const humanTurn = (xIsNext && humanIsX) || (!xIsNext && !humanIsX);
      const info = calculateWinner(board);
      if (!humanTurn && !info.winner && !board.every(Boolean)) {
        computerMove();
      }
    }
    // eslint-disable-next-line
  }, [xIsNext, mode, difficulty]);

  function handleClick(i){
    if (board[i] || winnerInfo.winner || thinking) return;
    if (mode === '1p') {
      const humanIsX = true;
      const humanTurn = (xIsNext && humanIsX) || (!xIsNext && !humanIsX);
      if (!humanTurn) return;
    }
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function computerMove(){
    setThinking(true);
    setTimeout(() => {
      const aiPlayer = xIsNext ? 'X' : 'O';
      const huPlayer = aiPlayer === 'X' ? 'O' : 'X';
      const newBoard = board.slice();

      let moveIndex = null;

      if (difficulty === 'easy') {
        const avail = newBoard.map((v,i)=> v ? null : i).filter(v=>v!==null);
        moveIndex = avail[Math.floor(Math.random() * avail.length)];
      } else {
        const best = minimax(newBoard, aiPlayer, aiPlayer, huPlayer);
        moveIndex = best ? best.index : null;
      }

      if (moveIndex !== null && !newBoard[moveIndex]) {
        newBoard[moveIndex] = aiPlayer;
        setBoard(newBoard);
        setXIsNext(!xIsNext);
      }
      setThinking(false);
    }, difficulty === 'easy' ? 250 : 450);
  }

  function handleRestart(){
    setBoard(Array(9).fill(null));
    setWinnerInfo({winner:null,line:[]});
    setIsDraw(false);
    setXIsNext(true);
    setThinking(false);
    setShowResult(false);
    setResultMessage("");
  }

  function handleResetScores(){
    handleRestart();
    setScores({X:0,O:0});
  }

  function handleChangeMode(newMode){
    setMode(newMode);
    handleRestart();
  }

  const status = winnerInfo.winner ? `Winner: ${winnerInfo.winner}` : (isDraw ? 'Draw' : `${xIsNext ? 'X' : 'O'}'s turn`);

  return (
    <div className="app-root">
      <div className="card">
        <h1 className="title">Tic Tac Toe — Gaming</h1>

        <div className="controls-top">
          <div className="modes">
            <button className={`chip ${mode==='1p' ? 'active' : ''}`} onClick={()=>handleChangeMode('1p')}>1 Player</button>
            <button className={`chip ${mode==='2p' ? 'active' : ''}`} onClick={()=>handleChangeMode('2p')}>2 Players</button>
          </div>

          {mode === '1p' && (
            <div className="difficulty">
              <label>Difficulty:</label>
              <select value={difficulty} onChange={(e)=>{ setDifficulty(e.target.value); handleRestart(); }}>
                <option value="easy">Easy</option>
                <option value="hard">Hard (Unbeatable)</option>
              </select>
            </div>
          )}
        </div>

        <div className="top-row">
          <div className="status">{status}{thinking ? " — Computer thinking..." : ""}</div>
          <div className="scores">
            <div className="score">X: <strong>{scores.X}</strong></div>
            <div className="score">O: <strong>{scores.O}</strong></div>
          </div>
        </div>

        <div className="board" role="grid">
          {board.map((v,i)=>(
            <Square key={i} value={v} onClick={() => handleClick(i)} highlight={winnerInfo.line.includes(i)} />
          ))}
        </div>

        <div className="controls">
          <button className="btn" onClick={handleRestart}>Restart</button>
          <button className="btn outline" onClick={handleResetScores}>Reset Scores</button>
        </div>

        <div className="howto">
          <p>Tap a cell to place. In 1-player mode you are <strong>X</strong> and start first.</p>
          <p className="muted">Tip: Hard mode uses Minimax — impossible to beat if played perfectly.</p>
        </div>
      </div>

      {/* 🔥 Popup Overlay for Win / Lose / Draw */}
      {showResult && (
        <div className="overlay">
          <div className="popup">
            <h2>{resultMessage}</h2>
            <button className="btn neon" onClick={handleRestart}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
