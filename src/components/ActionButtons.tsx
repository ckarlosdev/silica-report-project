import { Button, Card, Col } from "react-bootstrap";
import { useContextStore } from "../stores/useContextStore";
import useSilicaReportStore from "../stores/useSilicaReportStore";
import type { PaintHandle } from "./Paint";
import type { SilicaReport } from "../types";
import { useSilica } from "../hooks/useSilica";
import useUser from "../hooks/useUser";
import { useEffect } from "react";

type Props = {
  paintRef: React.RefObject<PaintHandle | null>;
};

function ActionButtons({ paintRef }: Props) {
  const { jobId } = useContextStore();
  const { silicaReport, reset, setFullDailyReport } = useSilicaReportStore();
  const { mutate } = useSilica();
  const { data: currentUser } = useUser();

  const handleSave = () => {
    // validate
    if (!isValidReport()) return;
    // create structure to send to backend
    const payload: SilicaReport = {
      ...silicaReport,
      jobsId: jobId,
      diagramData: paintRef?.current?.getDrawingData() || "",
      createdBy: currentUser?.email || "unknown",
      updatedBy: currentUser?.email || "unknown",
    };
    // const diagramData = paintRef.current?.getDrawingData();
    console.log("Payload to save:", payload);
    // sent new estructure to store
    setFullDailyReport(payload);
    // mutate (save) to backend
    mutate({ silicaReport: payload });
  };

  const isValidReport = () => {
    // foreman
    if (!silicaReport.employeesId) {
      alert("Please select a foreman.");
      return false;
    }
    // Date
    if (!silicaReport.eventDate) {
      alert("Please select an event date.");
      return false;
    }
    // diagram
    if (!silicaReport.diagramData) {
      alert("Please draw the silica hazard diagram.");
      return false;
    }
    return true;
  };

  const handleReset = () => {
    reset();
  };

  return (
    <>
      <Col>
        <Card style={{ marginBottom: "2px" }} className="no-print">
          <Card.Body>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                height: "50px",
              }}
            >
              <Button
                style={{
                  width: "200px",
                  height: "60px",
                  fontWeight: "bold",
                  fontSize: "25px",
                  marginRight: "20px",
                }}
                onClick={() => {
                  handleReset();
                  window.location.href = `https://ckarlosdev.github.io/binder-webapp/#/binder/${jobId}`;
                }}
                variant="outline-primary"
                className="no-print"
              >
                <i className="bi bi-backspace" style={{ margin: "6px" }}></i>
                Back
              </Button>
              <Button
                style={{
                  width: "200px",
                  height: "60px",
                  fontWeight: "bold",
                  fontSize: "25px",
                  marginLeft: "20px",
                }}
                variant="outline-primary"
                onClick={() => {
                  handleSave();
                }}
                // disabled={isSaving}
                className="no-print"
              >
                {/* {isSaving ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      style={{ marginRight: "10px" }}
                    />
                    Saving...
                  </>
                ) : (
                  "Save"
                )} */}
                Save
                <i className="bi bi-floppy" style={{ margin: "6px" }}></i>
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
}

export default ActionButtons;
