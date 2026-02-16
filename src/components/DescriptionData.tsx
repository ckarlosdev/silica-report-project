import { Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import useSilicaReportStore from "../stores/useSilicaReportStore";
import useEmployees from "../hooks/useEmpoyees";

type Props = {};

function DescriptionData({}: Props) {
  const { silicaReport, setSilicaReport } = useSilicaReportStore();
  const { data: employees } = useEmployees();

  const supervisorOptions = employees?.filter(
    (emp) => emp.title === "Supervisor",
  );
  const supervisorSorted = supervisorOptions?.sort((a, b) =>
    a.firstName.localeCompare(b.firstName),
  );

  return (
    <>
      <Card style={{ marginBottom: "2px" }}>
        <Card.Body>
          <Row className="mb-2">
            <Col>
              <FloatingLabel controlId="floatingForeman" label="Foreman">
                <Form.Select
                  aria-label="Default select example"
                  style={{ fontWeight: "bold", textAlign: "center" }}
                  value={silicaReport.employeesId}
                  onChange={(e) =>
                    setSilicaReport("employeesId", Number(e.target.value))
                  }
                >
                  <option value="">Open this select foreman</option>
                  {supervisorSorted?.map((emp) => (
                    <option
                      key={emp.employeesId}
                      value={emp.employeesId}
                      style={{ fontWeight: "bold" }}
                    >
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col>
              <FloatingLabel controlId="floatingDate" label="Date">
                <Form.Control
                  style={{ fontWeight: "bold", textAlign: "center" }}
                  type="date"
                  value={silicaReport.eventDate}
                  onChange={(e) => setSilicaReport("eventDate", e.target.value)}
                />
              </FloatingLabel>
            </Col>
          </Row>
          <Row>
            <Col>
              <FloatingLabel
                controlId="floatingDescription"
                label="Work description"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Leave a comment here"
                  style={{
                    height: "100px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                  value={silicaReport.workDescription}
                  onChange={(e) =>
                    setSilicaReport("workDescription", e.target.value)
                  }
                />
              </FloatingLabel>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}

export default DescriptionData;
