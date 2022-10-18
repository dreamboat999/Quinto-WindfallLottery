import style from './connectionStatus.module.scss';

const ConnectionStatus = ({ readyState }) => {
  const state = ['Connecting', 'Connected', 'Closing', 'Closed'];
  return (
    <div className={style.connectionStatus}>
      <span className={readyState === 1 ? 'dot green' : 'dot red'} />
      <span>{state[readyState]}</span>
    </div>
  );
};

export default ConnectionStatus;
