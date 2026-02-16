import { Button } from "react-bootstrap";
import hmbLogo from "../assets/hmbLogo.png";
import "../styles/buttons.css";
import LogoutButton from "./LogoutButton";

type Props = {
  onPrint: () => void;
};

function Title({ onPrint }: Props) {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "20px",
        marginBottom: "10px",
      }}
    >
      <div>
        <img style={{ width: "250px" }} src={hmbLogo} alt="" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: " 200px 1fr 200px" }}>
        <div>
          <Button
            variant="outline-danger"
            onClick={() => onPrint()}
            className="no-print"
            style={{ fontWeight: "bold" }}
          >
            Print Report (PDF)
          </Button>
        </div>
        <div>
          <h2
            style={{
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Silica Report
          </h2>
        </div>
        <div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default Title;
