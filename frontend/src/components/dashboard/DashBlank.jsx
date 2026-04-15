import { IconShield } from "./icons";

export default function DashBlank() {
  return (
    <div className="dash-main-blank">
      <div className="dash-main-blank-icon">
        <IconShield size={28} />
      </div>
      <p>← Select an option from the panel</p>
    </div>
  );
}