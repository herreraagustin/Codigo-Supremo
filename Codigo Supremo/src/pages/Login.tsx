type LoginProps = {
  onLogin: () => void;
};

export const Login = ({ onLogin }: LoginProps) => {
  return (
    <div>
      Login
      <button onClick={onLogin}>Ingresar</button>
    </div>
  );
};