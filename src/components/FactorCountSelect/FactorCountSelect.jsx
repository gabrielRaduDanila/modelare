import './FactorCountSelect.css';

function FactorCountSelect({ factorCount, setFactorCount }) {
  return (
    <div className='factor-select'>
      <h2>Setare inițială</h2>
      <p>Alege numărul de factori (parametri) pentru design:</p>

      <div className='choices'>
        <button
          className={factorCount === 2 ? 'btn active' : 'btn'}
          onClick={() => setFactorCount(2)}
        >
          2 factori
        </button>

        <button
          className={factorCount === 3 ? 'btn active' : 'btn'}
          onClick={() => setFactorCount(3)}
        >
          3 factori
        </button>
      </div>

      {factorCount === 3 && (
        <div className='note'>
          Pentru 3 factori, CCD va avea mai multe probe (ex: ~19+).
        </div>
      )}
    </div>
  );
}

export default FactorCountSelect;
