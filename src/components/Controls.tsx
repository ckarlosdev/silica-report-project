import { Accordion, Col, Row } from "react-bootstrap";
import usecontrols from "../hooks/useControls";
import ControlInput from "./ControlInput";

type Props = {};

function Controls({}: Props) {
  const { data: controlsDetails } = usecontrols();

  return (
    <>
      <Row>
        <Col>
          <Accordion>
            {controlsDetails?.map((control) => (
              <Accordion.Item
                key={control.controlsId.toString()}
                eventKey={control.controlsId.toString()}
              >
                <Accordion.Header>
                  <span style={{ fontWeight: "bold" }}>
                    {control.controlType}
                  </span>
                  {"\u00A0"}
                  {control.typeDescription}
                </Accordion.Header>
                <Accordion.Body>
                  {control.descriptions.map((description) => (
                    <ControlInput
                      controlName={description.controlName}
                      typeElement={description.componentType}
                      key={description.controlsDescriptionsId}
                      controlDescriptionId={description.controlsDescriptionsId}
                    ></ControlInput>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </>
  );
}

export default Controls;
