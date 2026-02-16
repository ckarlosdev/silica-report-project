import { Col, Container, Row } from "react-bootstrap";
import Title from "../Title";
import { useReactToPrint } from "react-to-print";
import { useEffect, useRef } from "react";
import JobData from "../JobData";
import DescriptionData from "../DescriptionData";
import Paint, { type PaintHandle } from "../Paint";
import PlanData from "../PlanData";
import { useSearchParams } from "react-router-dom";
import { useContextStore } from "../../stores/useContextStore";
import ActionButtons from "../ActionButtons";
import Controls from "../Controls";
import { useSilicaReport } from "../../hooks/useSilica";
import useSilicaReportStore from "../../stores/useSilicaReportStore";

function Home() {
  const paintRef = useRef<PaintHandle>(null);
  const [searchParams] = useSearchParams();
  const setIds = useContextStore((s) => s.setIds);
  const { silicaId, jobId, isLoaded, setIsLoaded } = useContextStore();
  const { setFullDailyReport, reset } = useSilicaReportStore();

  const { data: report, isLoading } = useSilicaReport(
    silicaId ? Number(silicaId) : 0,
  );

  const componenteRef = useRef(null);

  useEffect(() => {
    if (report && !isLoaded) {
      setFullDailyReport(report);
      setIsLoaded(true);
    }
  }, [report]);

  const pageStyle = `
    @page {
      size: auto;
      margin: 10mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
      
      /* Forzar que las columnas de Bootstrap no se apilen */
      .row {
        display: flex !important;
        flex-wrap: wrap !important;
        flex-direction: row !important;
      }

      /* Definir anchos fijos para simular md={6} o lg={3} */
      .col-md-6 {
        flex: 0 0 50% !important;
        max-width: 50% !important;
      }
      
      .col-lg-3 {
        flex: 0 0 25% !important;
        max-width: 25% !important;
      }

      /* Evitar que una tarjeta se rompa a la mitad entre dos páginas */
      .card {
        break-inside: avoid;
        margin-bottom: 10px !important;
      }

      /* Optimizar el espacio de los bordes y rellenos */
      .card-body {
        padding: 5px !important;
      }
    }
  `;

  const handlePrint = useReactToPrint({
    contentRef: componenteRef,
    documentTitle: "Silica Report",
    pageStyle: pageStyle,
  });

  useEffect(() => {
    const jobIdParam = searchParams.get("jobId");
    const silicaIdParam = searchParams.get("silicaId");
    const isNewAction = searchParams.get("action") === "new";
    console.log("Setting IDs from URL params:", {
      jobIdParam,
      silicaIdParam,
      isNewAction,
    });

    const isDifferentJob = jobId && Number(jobIdParam) !== jobId;

    if (isNewAction || (jobIdParam && isDifferentJob && !silicaIdParam)) {
      reset();
    }

    if (jobIdParam || silicaIdParam) {
      const jId = Number(jobIdParam);
      const dId = Number(silicaIdParam);
      if (!isNaN(jId) || !isNaN(dId)) {
        setIds(jId, dId);
      }
    }
  }, [searchParams, setIds]);

  if (isLoading) return <p>Loading report data...</p>;

  return (
    <>
      <Container ref={componenteRef} className="print-container">
        <Row className="justify-content-md-center">
          <Col style={{ textAlign: "center" }}>
            <Title onPrint={handlePrint} />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col style={{ textAlign: "center" }}>
            <JobData />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col style={{ textAlign: "center" }}>
            <DescriptionData />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col style={{ textAlign: "center" }}>
            <Controls />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col style={{ textAlign: "center" }}>
            <Paint ref={paintRef} />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col style={{ textAlign: "center" }}>
            <PlanData />
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col style={{ textAlign: "center" }}>
            <ActionButtons paintRef={paintRef} />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Home;
