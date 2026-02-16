import { Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import useSilicaReportStore from "../stores/useSilicaReportStore";

type Props = {};

const PlanData = ({}: Props) => {
  const { silicaReport, setSilicaReport } = useSilicaReportStore();
  return (
    <>
      <Card style={{ marginBottom: "2px" }}>
        <Card.Body>
          <Card.Title style={{ textAlign: "center", fontWeight: "bold" }}>
            Plan data
          </Card.Title>
          <Row className="g-2">
            <Col md>
              <FloatingLabel
                // controlId="ventilationArea"
                label="Area or location in building of ventilation plan"
                className="mb-2"
              >
                <Form.Control
                  type="text"
                  onChange={(e) =>
                    setSilicaReport("ventilationArea", e.target.value)
                  }
                  value={silicaReport.ventilationArea}
                  style={{ fontWeight: "bold", textAlign: "center" }}
                />
              </FloatingLabel>
            </Col>
            <Col>
              <FloatingLabel
                // controlId="datePlan"
                label="Date plan was plan reviwed by workers"
                className="mb-2"
              >
                <Form.Control
                  type="date"
                  onChange={(e) => setSilicaReport("datePlan", e.target.value)}
                  value={silicaReport.datePlan}
                  style={{ fontWeight: "bold", textAlign: "center" }}
                />
              </FloatingLabel>
            </Col>
          </Row>
          <Row className="justify-content-md-center">
            <Col xs lg="12" md="auto">
              <FloatingLabel
                // controlId="equipmentDescription"
                label="Types of neg. air fans & no"
              >
                <Form.Control
                  type="text"
                  onChange={(e) =>
                    setSilicaReport("equipmentDescription", e.target.value)
                  }
                  value={silicaReport.equipmentDescription}
                  style={{ fontWeight: "bold", textAlign: "center" }}
                />
              </FloatingLabel>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default PlanData;
