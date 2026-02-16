import { FloatingLabel, Form } from "react-bootstrap";
import useSilicaReportStore from "../stores/useSilicaReportStore";

type Props = {
  typeElement: string;
  controlName: string;
  controlDescriptionId: number;
};

function ControlInput({
  typeElement,
  controlName,
  controlDescriptionId,
}: Props) {
  const { updateSilicaControl, silicaReport } = useSilicaReportStore();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    let newValue: string;
    if (typeElement === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked.toString(); // Type assertion for checkbox
    } else {
      newValue = e.target.value;
    }
    // console.log(controlDescriptionId, "changed to", newValue.toString());
    updateSilicaControl(controlDescriptionId, newValue);
  };

  const currentControl = silicaReport.silicaControls?.find(
    (c) => c.controlDescriptionId === controlDescriptionId,
  );

  const valueElement2 = currentControl?.controlAnswer || "";

  return (
    <>
      {typeElement != "checkbox" ? (
        <div
          className="row g-3 align-items-center mb-3"
          style={{ margin: "1px", height: "45px" }}
        >
          <FloatingLabel style={{ marginTop: "1px" }} label={controlName}>
            <Form.Control
              type="text"
              value={valueElement2}
              onChange={handleChange}
            />
          </FloatingLabel>
        </div>
      ) : (
        <div
          className="row g-3 align-items-center"
          style={{ margin: "1px", height: "45px" }}
        >
          <div className="d-flex justify-content-center">
            <input
              className="form-check-input me-2"
              type="checkbox"
              checked={valueElement2 === "true" ? true : false}
              onChange={handleChange}
              id={controlName}
            />
            <label className="form-check-label" htmlFor={controlName}>
              {controlName}
            </label>
          </div>
        </div>
      )}
    </>
  );
}

export default ControlInput;
