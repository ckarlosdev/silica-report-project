import { Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { useContextStore } from "../stores/useContextStore";
import useJob from "../hooks/useJob";

type Props = {};

function JobData({}: Props) {
  const { jobId } = useContextStore();
  const { data: job, isLoading, isError } = useJob(jobId ? Number(jobId) : 0);

  if (isLoading) return <div>Loading Job data {jobId}...</div>;
  if (isError) return <div>Error loading Job data.</div>;

  return (
    <>
      <Card style={{ marginBottom: "2px" }}>
        <Card.Body>
          <Card.Title style={{ textAlign: "center", fontWeight: "bold" }}>
            Job data
          </Card.Title>
          <Row>
            <Col>
              <FloatingLabel
                controlId="floatingInputJobNumber"
                label="Job Number"
                className="mb-3"
              >
                <Form.Control
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "25px",
                  }}
                  readOnly
                  value={job?.number ?? ""}
                  type="text"
                  placeholder="#"
                />
              </FloatingLabel>

              <FloatingLabel
                controlId="floatingInputJobAddress"
                label="Job Address"
                className="mb-1"
              >
                <Form.Control
                  type="text"
                  placeholder="#"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                  readOnly
                  value={job?.address ?? ""}
                />
              </FloatingLabel>
            </Col>

            <Col>
              <FloatingLabel
                controlId="floatingInputJobName"
                label="Job Name"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="#"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "25px",
                  }}
                  readOnly
                  value={job?.name ?? ""}
                />
              </FloatingLabel>

              <FloatingLabel
                controlId="floatingInputContractor"
                label="Contractor"
                className="mb-1"
              >
                <Form.Control
                  type="text"
                  placeholder="#"
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                  readOnly
                  value={job?.contractor ?? ""}
                />
              </FloatingLabel>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}

export default JobData;
