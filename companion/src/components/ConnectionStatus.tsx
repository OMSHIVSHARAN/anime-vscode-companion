interface Props {
  connected: boolean;
}

export function ConnectionStatus({ connected }: Props) {
  return (
    <div className={`connection-status ${connected ? 'online' : 'offline'}`}>
      <span className="dot" />
      {connected ? 'VS Code connected' : 'Waiting for VS Code...'}
    </div>
  );
}
