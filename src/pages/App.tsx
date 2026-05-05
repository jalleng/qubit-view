import { Link, Route, Routes } from "react-router-dom";
import { BlochSpherePage } from "./BlochSpherePage";
import HomePage from "./HomePage";
import classes from "./App.module.css";

export default function App() {
  return (
    <div className={classes.root}>
      <nav className={classes.nav}>
        <Link to="/" className={classes.navTitle}>QbitView</Link>
        <Link to="/bloch-sphere" className={classes.navLink}>Bloch Sphere</Link>
      </nav>
      <div className={classes.pageWrapper}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bloch-sphere" element={<BlochSpherePage />} />
        </Routes>
      </div>
    </div>
  );
}
