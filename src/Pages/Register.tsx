import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../utils/firebase.config";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  function validate() {
    if (!user.name || !user.email || !user.password) {
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

  function register() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    createUserWithEmailAndPassword(auth, user.email, user.password)
      .then(() => {
        addDoc(collection(db, "users"), user);
        navigate("/login");
      })
      .catch((err) => setError(err.message));
  }

  function signinGoogle() {
    signInWithPopup(auth, provider);
    navigate("/login");
  }

  return (
    <div className="card p-3 w-25 mx-auto mt-5">
      <div className="border-bottom border-2 mb-2 text-center">
        <h2>Register</h2>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <input
        placeholder="Name..."
        type="text"
        className="form-control mb-2"
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
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
      <button onClick={register} className="btn btn-dark">
        Save
      </button>
      <p className="mx-auto">or</p>
      <button className="btn btn-dark" onClick={signinGoogle}>
        Register with Google
      </button>
    </div>
  );
};

export default Register;
