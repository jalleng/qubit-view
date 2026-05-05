import { Link } from "react-router-dom";
import classes from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={classes.root}>
      <div className={classes.hero}>
        <h2 className={classes.title}>Bloch Sphere Visualizer</h2>
        <p className={classes.subtitle}>
          Explore qubit states interactively on the Bloch sphere. Apply rotation
          gates, set state presets, and watch the state vector animate in 3D.
        </p>
        <Link to="/bloch-sphere" className={classes.cta}>
          Open Bloch Sphere
        </Link>
      </div>
    </div>
  );
}
