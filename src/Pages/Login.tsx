import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase.config";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [user, setUser] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  function validate(): string {
    if (!user.email || !user.password) {
      return "All fields are required.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      return "Invalid email format.";
    }
    if (user.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return "";
  }

  function login() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);

      return;
    }

    signInWithEmailAndPassword(auth, user.email, user.password)
      .then((res) => {
        localStorage.setItem("token", res.user.accessToken);
        navigate("/");
      })
      .catch((err) => {
        setError(err.message);
      });
  }

  return (
    <div className="card p-3 w-25 mx-auto mt-5">
      <div className="border-bottom border-2 mb-2 text-center">
        <h2>Login</h2>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <input
        placeholder="Email..."
        type="email"
        className="form-control mb-2"
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />
      <div className="input-group mb-2">
        <input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          className="form-control"
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <Eye /> : <EyeOff />}
        </button>
      </div>
      <button onClick={login} className="btn btn-dark">
        Save
      </button>
    </div>
  );
};

export default Login;
