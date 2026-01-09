import useSign from "../hooks/useSign";

function App() {
  const sign = useSign();

  return (
    <div>
      <h1>Hand Avatar AI</h1>

      {sign && (
        <h2>
          ✋ Sign: {sign.letter} ({(sign.confidence * 100).toFixed(1)}%)
        </h2>
      )}
    </div>
  );
}

export default App;
