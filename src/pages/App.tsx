import { Link, Route, Routes } from "react-router-dom";
import { BlochSpherePage } from "./BlochSpherePage";
import HomePage from "./HomePage";
import classes from "./App.module.css";
import { EulerCirclePage } from "./EulerCirclePage";

export default function App() {
  return (
    <div className={classes.root}>
      <nav className={classes.nav}>
        <Link to="/" className={classes.navTitle}>
          QbitView
        </Link>
        <Link to="/bloch-sphere" className={classes.navLink}>
          Bloch Sphere
        </Link>
        <Link to="/euler-circle" className={classes.navLink}>
          Euler Circle
        </Link>
      </nav>
      <div className={classes.pageWrapper}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bloch-sphere" element={<BlochSpherePage />} />
          <Route path="/euler-circle" element={<EulerCirclePage />} />
        </Routes>
      </div>
    </div>
  );
}
