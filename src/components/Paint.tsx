import { Card, Col, Row } from "react-bootstrap";
import bocina from "../assets/bocina.png";
import sprayer from "../assets/sprayer.png";
import estrella from "../assets/estrella.png";
import { forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import "../styles/paint.css";
import type { DrawingAppControls } from "../types";
import useSilicaReportStore from "../stores/useSilicaReportStore";
import { initDrawingApp } from "../utils/paint";

export type PaintHandle = {
  getDrawingData: () => string | null; // getDrawingData puede devolver null si los controles no están listos
  loadDrawingData: (data: string) => void; // Agregamos loadDrawingData a la interfaz expuesta
};

const Paint = forwardRef<PaintHandle, {}>((_, ref) => {
  const { silicaReport } = useSilicaReportStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const figurePaletteRef = useRef<HTMLDivElement>(null);
  const colorButtonsRef = useRef<HTMLDivElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const eraserButtonRef = useRef<HTMLButtonElement>(null);
  const drawButtonRef = useRef<HTMLButtonElement>(null);
  const imageLoadStatusRef = useRef<HTMLDivElement>(null);

  const drawingAppControlsRef = useRef<DrawingAppControls | null>(null);

  useEffect(() => {
    // Asegura que todos los refs de los elementos DOM estén disponibles
    if (
      canvasRef.current &&
      figurePaletteRef.current &&
      colorButtonsRef.current &&
      clearButtonRef.current &&
      eraserButtonRef.current &&
      drawButtonRef.current &&
      imageLoadStatusRef.current
    ) {
      // Llama a la función de inicialización y captura su valor de retorno
      const controls = initDrawingApp(
        canvasRef.current,
        figurePaletteRef.current,
        colorButtonsRef.current,
        clearButtonRef.current,
        eraserButtonRef.current,
        drawButtonRef.current,
        imageLoadStatusRef.current,
      );

      // Si la inicialización fue exitosa, guarda los controles
      if (controls) {
        drawingAppControlsRef.current = controls;
        // console.log("Drawing app initialized successfully (ONE TIME).");

        // Opcional: Espera a que las imágenes carguen. Esto no debe re-inicializar el lienzo.
        controls
          .getImagesLoadedPromise()
          ?.then(() => {
            console.log("All images for drawing app are loaded.");
          })
          .catch((error) => {
            console.error("Error loading images for drawing app:", error);
          });
      } else {
        console.error(
          "Failed to initialize drawing application. Check if all required DOM elements are present.",
        );
      }
    }

    // return () => {
    //   drawingAppControlsRef.current = null;
    // };
  }, []);

  // console.log("Current Ref State:", silicaReport);

  useEffect(() => {
    if (drawingAppControlsRef.current && silicaReport?.diagramData) {
      drawingAppControlsRef.current
        .getImagesLoadedPromise()
        ?.then(() => {
          drawingAppControlsRef.current?.loadDrawingData(
            silicaReport.diagramData as string,
          );
          console.log(
            "Diagram data loaded into canvas due to silicaReport.diagramData change.",
          );
        })
        .catch((error) => {
          console.error("Error loading drawing data or images:", error);
        });
    }
  }, [silicaReport?.diagramData]);

  useImperativeHandle(ref, () => ({
    getDrawingData: () => {
      if (drawingAppControlsRef.current) {
        return drawingAppControlsRef.current.getDrawingData();
      }
      console.warn(
        "Attempted to get drawing data before controls were initialized.",
      );
      return null;
    },

    loadDrawingData: (data: string) => {
      if (drawingAppControlsRef.current) {
        drawingAppControlsRef.current.loadDrawingData(data);
      } else {
        console.warn(
          "Attempted to load drawing data before controls were initialized.",
        );
      }
    },
  }));

  return (
    <>
      <Card style={{ marginBottom: "2px" }}>
        <Card.Body>
          <Card.Title style={{ textAlign: "center", fontWeight: "bold" }}>
            Diagram
          </Card.Title>
          <Row className="justify-content-md-center">
            <Col xs lg="12" md="auto">
              <div className="figure-palette" ref={figurePaletteRef}>
                <img src={bocina} alt="Bocina" id="bocina" draggable="true" />
                <img
                  src={sprayer}
                  alt="Sprayer"
                  id="sprayer"
                  draggable="true"
                />
                <img
                  src={estrella}
                  alt="Estrella"
                  id="estrella"
                  draggable="true"
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="controls">
                <div className="color-buttons" ref={colorButtonsRef}>
                  <button
                    id="red"
                    aria-label="Color Rojo"
                    style={{ backgroundColor: "red" }}
                  ></button>
                  <button
                    id="blue"
                    aria-label="Color Azul"
                    style={{ backgroundColor: "blue" }}
                  ></button>
                  <button
                    id="green"
                    aria-label="Color Verde"
                    style={{ backgroundColor: "green" }}
                  ></button>
                  <button
                    id="black"
                    aria-label="Color Negro"
                    style={{ backgroundColor: "black" }}
                  ></button>
                </div>
                <button id="clear" ref={clearButtonRef}>
                  delete
                </button>
                <button id="eraser" ref={eraserButtonRef}>
                  eraser
                </button>
                <button id="draw" ref={drawButtonRef}>
                  paint
                </button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <canvas
                id="drawingCanvas"
                ref={canvasRef}
                width="900"
                height="500"
              ></canvas>
            </Col>
          </Row>
          <Row>
            <Col>
              <div
                id="imageLoadStatus"
                ref={imageLoadStatusRef}
                style={{
                  marginTop: "10px",
                  textAlign: "center",
                  fontSize: "0.9em",
                }}
              >
                .
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
});

export default Paint;
