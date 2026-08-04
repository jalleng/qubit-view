import classes from "./App.module.css";
import EulerUnitCircle from "../components/EulerUnitCircle";

export const EulerCirclePage = () => {
  return (
    <div className={classes.content}>
      <EulerUnitCircle />
    </div>
  );
};
