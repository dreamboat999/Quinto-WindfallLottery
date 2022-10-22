import style from './connectionStatus.module.scss';

const ConnectionStatus = ({ readyState }) => {
  const state = ['Connecting', 'Connected', 'Closing', 'Closed'];
  return (
    <div className={style.connectionStatus}>
      <span className={`dot ${readyState === 1 ? 'green' : 'red'}`} />
      <span>{state[readyState]}</span>
    </div>
  );
};

export default ConnectionStatus;
