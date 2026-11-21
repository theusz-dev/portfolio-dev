import s from "./reading.module.css";

export function HorizonStrip() {
  return (
    <div className={s.horizonArt} aria-hidden="true">
      <span className={s.smallMoon} />
      <span className={s.farRidge} />
      <span className={s.nearRidge} />
    </div>
  );
}

export function MoonPlate() {
  return (
    <div className={s.moonPlate} aria-hidden="true">
      <div className={s.orbitalPlane}><i className={s.satellite} /></div>
    </div>
  );
}
