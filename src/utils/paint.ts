// utils/paint.ts

import type {
  DrawingAppControls,
  DrawingElement,
  ImageDrawingElement,
  LineDrawingElement,
  Point,
} from "../types";

// Import necessary types, including Point

export const initDrawingApp = (
  canvasElement: HTMLCanvasElement,
  figurePaletteElement: HTMLDivElement,
  colorButtonsContainer: HTMLDivElement,
  clearButton: HTMLButtonElement,
  eraserButton: HTMLButtonElement,
  drawButton: HTMLButtonElement,
  imageLoadStatusElement: HTMLDivElement,
): DrawingAppControls | null => {
  // console.log("initDrawingApp cargado y ejecutándose.");

  if (
    !canvasElement ||
    !figurePaletteElement ||
    !colorButtonsContainer ||
    !clearButton ||
    !eraserButton ||
    !drawButton ||
    !imageLoadStatusElement
  ) {
    console.error(
      "One or more required DOM elements for initialization are missing.",
    );
    // Returning null if any essential element is missing
    return null;
  }

  const ctx = canvasElement.getContext("2d");
  if (!ctx) {
    console.error("Failed to get 2D context from canvas.");
    return null;
  }

  // --- Drawing State Variables (scoped to this function) ---
  let isDrawing: boolean = false;
  let lastX: number = 0;
  let lastY: number = 0;
  let currentColor: string = "black";
  const penWidth: number = 3;
  const ERASER_SIZE: number = 20; // Tamaño del "pincel" del borrador (radio del círculo)
  const DEFAULT_FIGURE_SIZE: number = 80; // Tamaño predefinido para las figuras (ancho y alto)

  const drawingElements: DrawingElement[] = []; // Stores drawn lines and figures

  let currentMode: "drawing" | "moving" | "rotating" | "erasing" = "drawing";

  let selectedFigure: ImageDrawingElement | null = null; // Specific type for selected figures
  let startDragOffsetX: number = 0;
  let startDragOffsetY: number = 0;

  // Variables para la rotación
  let startAngle: number = 0;
  let startRotationClientX: number = 0;
  let startRotationClientY: number = 0;

  // Temporizadores para detectar doble clic/doble toque
  let lastClickTime: number = 0;
  const DBL_CLICK_THRESHOLD: number = 300; // milisegundos
  let lastTouchTime: number = 0;
  let touchTimeout: ReturnType<typeof setTimeout> | null = null; // Type for timeout ID

  // --- Image Preloading and Status ---
  const imagesToLoad: NodeListOf<HTMLImageElement> =
    figurePaletteElement.querySelectorAll("img");
  let loadedImagesCount: number = 0;
  const totalImages: number = imagesToLoad.length;
  // Use a map for better type safety and access
  const loadedImageObjects: { [id: string]: HTMLImageElement } = {};

  // Promise that resolves when all images are loaded
  let imagesLoadedPromise: Promise<void> | null = null;
  let resolveImagesLoadedPromise: (() => void) | null = null;
  let rejectImagesLoadedPromise: ((reason?: any) => void) | null = null;

  if (totalImages > 0) {
    imagesLoadedPromise = new Promise<void>((resolve, reject) => {
      resolveImagesLoadedPromise = () => {
        // imageLoadStatusElement.textContent = "Todas las imágenes cargadas.";
        // imageLoadStatusElement.style.color = "green";
        resolve();
      };
      rejectImagesLoadedPromise = (reason) => {
        // imageLoadStatusElement.textContent = `Error al cargar algunas imágenes. Revisa la consola.`;
        // imageLoadStatusElement.style.color = "red";
        reject(reason);
      };

      imagesToLoad.forEach((imgElement) => {
        imgElement.classList.add("loading");
        imgElement.onload = () => {
          loadedImagesCount++;
          imgElement.classList.remove("loading");
          imgElement.classList.add("loaded");
          loadedImageObjects[imgElement.id] = imgElement;
          // console.log(`[IMAGENES] Cargada: ${imgElement.id}`);
          if (loadedImagesCount === totalImages) {
            resolveImagesLoadedPromise && resolveImagesLoadedPromise();
          }
        };
        imgElement.onerror = () => {
          console.error(`[IMAGENES] Error al cargar: ${imgElement.src}`);
          imgElement.classList.remove("loading");
          imgElement.classList.add("error");
          rejectImagesLoadedPromise &&
            rejectImagesLoadedPromise(`Failed to load ${imgElement.src}`);
        };
      });
    });
  } else {
    // If no images to load, resolve the promise immediately
    imagesLoadedPromise = Promise.resolve();
    // imageLoadStatusElement.textContent =
    //   "No hay imágenes en la paleta para cargar.";
    // imageLoadStatusElement.style.color = "gray";
  }

  // --- Canvas Resizing Functions ---
  const resizeCanvas = () => {
    const desiredWidth = 900;
    const desiredHeight = 500;

    const oldWidth = canvasElement.width;
    const oldHeight = canvasElement.height;

    canvasElement.width = desiredWidth;
    canvasElement.height = desiredHeight;

    // Only scale if the canvas dimensions actually changed and were non-zero
    if (
      oldWidth > 0 &&
      oldHeight > 0 &&
      (oldWidth !== desiredWidth || oldHeight !== desiredHeight)
    ) {
      const scaleX = desiredWidth / oldWidth;
      const scaleY = desiredHeight / oldHeight;

      drawingElements.forEach((el) => {
        if (el.type === "figure") {
          el.x *= scaleX;
          el.y *= scaleY;
          el.width *= scaleX; // Scale width as well
          el.height *= scaleY; // Scale height as well
        } else if (el.type === "line") {
          el.points.forEach((p: Point) => {
            // Explicitly type 'p' as Point
            p.x *= scaleX;
            p.y *= scaleY;
          });
        }
      });
    }
    redrawCanvas();
  };

  window.addEventListener("load", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);

  // --- Function to redraw the entire canvas ---
  const redrawCanvas = () => {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    drawingElements.forEach((el) => {
      if (el.type === "line") {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.lineWidth; // Use el.lineWidth as defined in type
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (el.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i].x, el.points[i].y);
          }
          ctx.stroke();
        }
      } else if (el.type === "figure") {
        const imgToDraw = loadedImageObjects[el.imageId];
        // Ensure imgToDraw is an HTMLImageElement and is fully loaded
        if (imgToDraw instanceof HTMLImageElement && imgToDraw.complete) {
          ctx.save();
          const centerX = el.x + el.width / 2;
          const centerY = el.y + el.height / 2;
          ctx.translate(centerX, centerY);
          // Ensure rotation is a number, default to 0 if undefined/null
          ctx.rotate(el.rotation || 0);
          ctx.drawImage(
            imgToDraw,
            -el.width / 2,
            -el.height / 2,
            el.width,
            el.height,
          );
          ctx.restore();
        } else {
          console.warn(
            `[DIBUJO] No se pudo dibujar la figura. Imagen no cargada o inválida: ${
              el.imageId || "desconocida"
            }`,
          );
        }
      }
    });
  };

  // --- Interaction Logic (drawing, moving, rotating, and ERASER) ---
  const updateCanvasCursor = () => {
    canvasElement.classList.remove("move-cursor", "eraser-cursor");
    if (currentMode === "moving" || currentMode === "rotating") {
      canvasElement.classList.add("move-cursor");
    } else if (currentMode === "erasing") {
      canvasElement.classList.add("eraser-cursor");
    } else {
      canvasElement.style.cursor = "crosshair"; // Normal drawing cursor
    }
    // console.log(
    //   `[CURSOR] Cursor updated to: ${canvasElement.style.cursor} (Mode: ${currentMode})`
    // );
  };

  updateCanvasCursor();

  canvasElement.addEventListener("mousedown", (e: MouseEvent) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    // console.log(`[MOUSE_DOWN] Coordenadas: (${mouseX}, ${mouseY})`);
    const currentTime = new Date().getTime();

    if (currentMode === "erasing") {
      isDrawing = true; // For dragging the eraser
      eraseAtPosition(mouseX, mouseY);
      // console.log("[MOUSE_DOWN] Mode: Eraser, erasing at", mouseX, mouseY);
      lastClickTime = currentTime; // Update click time to prevent accidental double click
      return;
    }

    selectedFigure = getFigureAtPosition(mouseX, mouseY);
    // console.log(
    //   "[MOUSE_DOWN] Figure selected by getFigureAtPosition:",
    //   selectedFigure ? selectedFigure.type : "none"
    // );

    if (selectedFigure) {
      if (currentTime - lastClickTime < DBL_CLICK_THRESHOLD) {
        currentMode = "rotating";
        startRotationClientX = e.clientX;
        startRotationClientY = e.clientY;
        // Ensure selectedFigure.rotation is a number; default to 0 if undefined
        startAngle = selectedFigure.rotation || 0;
        // console.log("[MOUSE_DOWN] Mode: Rotating (double click detected)");
      } else {
        currentMode = "moving";
        startDragOffsetX = mouseX - selectedFigure.x;
        startDragOffsetY = mouseY - selectedFigure.y;
        // console.log("[MOUSE_DOWN] Mode: Moving (single click on figure)");
      }
    } else {
      currentMode = "drawing";
      isDrawing = true;
      lastX = mouseX;
      lastY = mouseY;
      const newLine: LineDrawingElement = {
        type: "line",
        id: `line-${Date.now()}`, // Add unique ID for lines
        color: currentColor,
        lineWidth: penWidth,
        x: 0, // lines don't use x/y directly, but are part of BaseDrawingElement
        y: 0, // lines don't use x/y directly, but are part of BaseDrawingElement
        points: [{ x: lastX, y: lastY }],
      };
      drawingElements.push(newLine);
      // console.log("[MOUSE_DOWN] Mode: Drawing (click in empty space)");
    }

    updateCanvasCursor();
    lastClickTime = currentTime;
  });

  canvasElement.addEventListener("mousemove", (e: MouseEvent) => {
    if (currentMode === "drawing" && isDrawing) {
      const currentLine = drawingElements[drawingElements.length - 1];
      if (currentLine && currentLine.type === "line") {
        // Ensure it's a line
        currentLine.points.push({ x: e.offsetX, y: e.offsetY });
        redrawCanvas();
      }
    } else if (currentMode === "moving" && selectedFigure) {
      const newX = e.offsetX - startDragOffsetX;
      const newY = e.offsetY - startDragOffsetY;

      selectedFigure.x = newX;
      selectedFigure.y = newY;
      redrawCanvas();
    } else if (currentMode === "rotating" && selectedFigure) {
      const rect = canvasElement.getBoundingClientRect();
      const figureCenterX = selectedFigure.x + selectedFigure.width / 2;
      const figureCenterY = selectedFigure.y + selectedFigure.height / 2;

      const mouseXRelativeToFigureCenter =
        e.clientX - (rect.left + figureCenterX);
      const mouseYRelativeToFigureCenter =
        e.clientY - (rect.top + figureCenterY);

      const currentAngle = Math.atan2(
        mouseYRelativeToFigureCenter,
        mouseXRelativeToFigureCenter,
      );

      const startAngleRelativeToFigureCenter = Math.atan2(
        startRotationClientY - (rect.top + figureCenterY),
        startRotationClientX - (rect.left + figureCenterX),
      );

      let rotationDelta = currentAngle - startAngleRelativeToFigureCenter;

      if (rotationDelta > Math.PI) rotationDelta -= 2 * Math.PI;
      if (rotationDelta < -Math.PI) rotationDelta += 2 * Math.PI;

      // Ensure rotation is always a number
      selectedFigure.rotation = startAngle + rotationDelta;
      redrawCanvas();
      // console.log(
      //   `[MOUSE_MOVE] Rotating. Figure: ${selectedFigure.type}, Angle: ${(
      //     (selectedFigure.rotation * 180) /
      //     Math.PI
      //   ).toFixed(2)} deg`
      // );
    } else if (currentMode === "erasing" && isDrawing) {
      eraseAtPosition(e.offsetX, e.offsetY);
    }
  });

  // --- Variables for touch dragging figures from palette ---
  let touchDraggedImage: HTMLImageElement | null = null;
  let currentGhostElement: HTMLElement | null = null;
  let touchDragOffsetX: number = 0;
  let touchDragOffsetY: number = 0;

  figurePaletteElement.addEventListener(
    "touchstart",
    (e: TouchEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
        touchDraggedImage = e.target;
        // console.log(
        //   `[TOUCH_DRAG] touchstart (palette): ${touchDraggedImage.id}`
        // );

        const touch = e.touches[0];
        const imgRect = touchDraggedImage.getBoundingClientRect();

        touchDragOffsetX = touch.clientX - imgRect.left;
        touchDragOffsetY = touch.clientY - imgRect.top;
        // console.log(
        //   `[TOUCH_DRAG] Offset calculated: (${touchDragOffsetX}, ${touchDragOffsetY})`
        // );

        if (
          currentGhostElement &&
          document.body.contains(currentGhostElement)
        ) {
          document.body.removeChild(currentGhostElement);
          currentGhostElement = null;
          // console.log("[TOUCH_DRAG] Previous ghost cleared.");
        }

        const ghost = touchDraggedImage.cloneNode(true) as HTMLImageElement;
        ghost.style.position = "absolute";
        ghost.style.opacity = "0.7";
        ghost.style.pointerEvents = "none";
        ghost.style.width = DEFAULT_FIGURE_SIZE + "px";
        ghost.style.height = DEFAULT_FIGURE_SIZE + "px";

        ghost.style.left = touch.pageX - touchDragOffsetX + "px";
        ghost.style.top = touch.pageY - touchDragOffsetY + "px";
        ghost.style.zIndex = "9999";
        document.body.appendChild(ghost);
        currentGhostElement = ghost;
        // console.log(
        //   `[TOUCH_DRAG] Ghost created at: (${ghost.style.left}, ${ghost.style.top})`
        // );

        currentMode = "drawing"; // Reset mode when starting a drag from palette
        updateCanvasCursor();
      }
    },
    { passive: false },
  );

  document.addEventListener(
    "touchmove",
    (e: TouchEvent) => {
      if (currentGhostElement) {
        e.preventDefault();
        const touch = e.touches[0];
        currentGhostElement.style.left = touch.pageX - touchDragOffsetX + "px";
        currentGhostElement.style.top = touch.pageY - touchDragOffsetY + "px";
      }
    },
    { passive: false },
  );

  document.addEventListener("touchend", (e: TouchEvent) => {
    if (currentGhostElement) {
      if (document.body.contains(currentGhostElement)) {
        document.body.removeChild(currentGhostElement);
        // console.log(
        //   "[TOUCH_END] Ghost element successfully removed from body."
        // );
      } else {
        console.warn(
          "[TOUCH_END] Ghost element not found in body for removal.",
        );
      }
      currentGhostElement = null;
    }

    if (touchDraggedImage) {
      // console.log(`[TOUCH_DRAG] touchend (document): ${touchDraggedImage.id}`);
      const touch = e.changedTouches[0];
      const rect = canvasElement.getBoundingClientRect();

      if (
        touch.clientX > rect.left &&
        touch.clientX < rect.right &&
        touch.clientY > rect.top &&
        touch.clientY < rect.bottom
      ) {
        const imgWidth = DEFAULT_FIGURE_SIZE;
        const imgHeight = DEFAULT_FIGURE_SIZE;

        const x = touch.clientX - rect.left - imgWidth / 2;
        const y = touch.clientY - rect.top - imgHeight / 2;

        if (
          loadedImageObjects[touchDraggedImage.id] &&
          loadedImageObjects[touchDraggedImage.id].complete
        ) {
          const newFigure: ImageDrawingElement = {
            type: "figure",
            id: `figure-${Date.now()}`, // Add unique ID for figures
            imageId: touchDraggedImage.id,
            x: x,
            y: y,
            width: imgWidth,
            height: imgHeight,
            rotation: 0, // Ensure rotation is always set, even if 0 initially
          };
          drawingElements.push(newFigure);
          redrawCanvas();
          // console.log(
          //   `[TOUCH_DRAG] Touch figure added: ${
          //     newFigure.imageId
          //   } at (${x.toFixed(0)}, ${y.toFixed(
          //     0
          //   )}) with size ${imgWidth}x${imgHeight}`
          // );
        } else {
          console.warn(
            "[TOUCH_DRAG] Could not drop touch image: Image not loaded (complete=false).",
          );
        }
      } else {
        console.log("[TOUCH_DRAG] Image dropped outside canvas.");
      }
      touchDraggedImage = null;
    }
    selectedFigure = null;
    currentMode = "drawing"; // Reset mode after touch end
    updateCanvasCursor();
    // console.log(
    //   "Touch mode ended (touchend):",
    //   currentMode,
    //   "Selected figure:",
    //   selectedFigure
    // );
  });

  canvasElement.addEventListener(
    "touchstart",
    (e: TouchEvent) => {
      e.preventDefault();

      const touch = e.touches[0];
      const rect = canvasElement.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      const currentTime = new Date().getTime();

      // console.log(`[CANVAS TOUCH_START] Coords: (${touchX}, ${touchY})`);
      // console.log(`[CANVAS TOUCH_START] Current mode: ${currentMode}`);

      if (touchTimeout) {
        clearTimeout(touchTimeout);
        touchTimeout = null;
        // console.log("[TOUCH_START] touchTimeout cleared.");
      }

      if (currentMode === "erasing") {
        isDrawing = true;
        eraseAtPosition(touchX, touchY);
        // console.log("[TOUCH_START] Mode: Eraser, erasing at", touchX, touchY);
        lastTouchTime = currentTime;
        updateCanvasCursor();
        return;
      }

      selectedFigure = getFigureAtPosition(touchX, touchY);
      // console.log(
      //   "[TOUCH_START] Figure selected by getFigureAtPosition:",
      //   selectedFigure ? selectedFigure.type : "none"
      // );

      if (selectedFigure) {
        const timeDiff = currentTime - lastTouchTime;
        // console.log(
        //   `[TOUCH_START] timeDiff: ${timeDiff}, DBL_CLICK_THRESHOLD: ${DBL_CLICK_THRESHOLD}`
        // );

        if (timeDiff < DBL_CLICK_THRESHOLD) {
          currentMode = "rotating";
          startRotationClientX = touch.clientX;
          startRotationClientY = touch.clientY;
          // Ensure selectedFigure.rotation is a number; default to 0 if undefined
          startAngle = selectedFigure.rotation || 0;
          // console.log("[TOUCH_START] Mode: Rotating (double tap detected)");
        } else {
          currentMode = "moving";
          startDragOffsetX = touchX - selectedFigure.x;
          startDragOffsetY = touchY - selectedFigure.y;
          // console.log("[TOUCH_START] Mode: Moving (single tap on figure)");
        }
      } else {
        currentMode = "drawing";
        isDrawing = true;
        lastX = touchX;
        lastY = touchY;
        const newLine: LineDrawingElement = {
          type: "line",
          id: `line-${Date.now()}`,
          color: currentColor,
          lineWidth: penWidth,
          x: 0,
          y: 0,
          points: [{ x: lastX, y: lastY }],
        };
        drawingElements.push(newLine);
        // console.log("[TOUCH_START] Mode: Drawing (tap in empty space)");
      }
      lastTouchTime = currentTime;
      updateCanvasCursor();
    },
    { passive: false },
  );

  canvasElement.addEventListener(
    "touchmove",
    (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvasElement.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      if (currentMode === "drawing" && isDrawing) {
        const currentLine = drawingElements[drawingElements.length - 1];
        if (currentLine && currentLine.type === "line") {
          // Ensure it's a line
          currentLine.points.push({ x: touchX, y: touchY });
          redrawCanvas();
        }
      } else if (currentMode === "moving" && selectedFigure) {
        const newX = touchX - startDragOffsetX;
        const newY = touchY - startDragOffsetY;

        selectedFigure.x = newX;
        selectedFigure.y = newY;
        redrawCanvas();
        // console.log(
        //   `[TOUCH_MOVE] Moving figure: ${
        //     selectedFigure.imageId
        //   } to (${newX.toFixed(0)}, ${newY.toFixed(0)})`
        // );
      } else if (currentMode === "rotating" && selectedFigure) {
        const figureCenterX = selectedFigure.x + selectedFigure.width / 2;
        const figureCenterY = selectedFigure.y + selectedFigure.height / 2;

        const touchXRelativeToFigureCenter =
          touch.clientX - (rect.left + figureCenterX);
        const touchYRelativeToFigureCenter =
          touch.clientY - (rect.top + figureCenterY);

        const currentAngle = Math.atan2(
          touchYRelativeToFigureCenter,
          touchXRelativeToFigureCenter,
        );

        const startAngleRelativeToFigureCenter = Math.atan2(
          startRotationClientY - (rect.top + figureCenterY),
          startRotationClientX - (rect.left + figureCenterX),
        );

        let rotationDelta = currentAngle - startAngleRelativeToFigureCenter;

        if (rotationDelta > Math.PI) rotationDelta -= 2 * Math.PI;
        if (rotationDelta < -Math.PI) rotationDelta += 2 * Math.PI;

        // Ensure rotation is always a number
        selectedFigure.rotation = startAngle + rotationDelta;
        redrawCanvas();
        // console.log(
        //   `[TOUCH_MOVE] Rotating. Figure: ${selectedFigure.type}, Angle: ${(
        //     (selectedFigure.rotation * 180) /
        //     Math.PI
        //   ).toFixed(2)} deg`
        // );
      } else if (currentMode === "erasing" && isDrawing) {
        eraseAtPosition(touchX, touchY);
      }
    },
    { passive: false },
  );

  document.addEventListener("touchcancel", () => {
    if (currentGhostElement) {
      if (document.body.contains(currentGhostElement)) {
        document.body.removeChild(currentGhostElement);
        // console.log(
        //   "[TOUCH_CANCEL] Ghost element successfully removed from body."
        // );
      } else {
        console.warn(
          "[TOUCH_CANCEL] Ghost element not found in body for removal on cancel.",
        );
      }
      currentGhostElement = null;
    }
    touchDraggedImage = null;
    selectedFigure = null;
    currentMode = "drawing"; // Reset mode
    updateCanvasCursor();
    // console.log("Touch drag or rotation cancelled (touchcancel).");
  });

  // Eventos para finalizar la interacción (mouse and touch)
  canvasElement.addEventListener("mouseup", () => {
    // console.log(
    //   "[MOUSE_UP] mouseup event detected. Current mode:",
    //   currentMode
    // );
    isDrawing = false;
    selectedFigure = null; // Deselect figure on mouse up
    currentMode = "drawing"; // Revert to drawing mode after moving/rotating/erasing
    updateCanvasCursor();
    // console.log(
    //   "Mode ended (mouseup):",
    //   currentMode,
    //   "Selected figure:",
    //   selectedFigure
    // );
  });

  canvasElement.addEventListener("mouseout", () => {
    if (currentMode === "drawing" && isDrawing) {
      isDrawing = false;
      // console.log("[MOUSE_OUT] Drawing stopped.");
    }
  });

  // --- Function to erase elements ---
  const eraseAtPosition = (x: number, y: number) => {
    let elementsErased = false;
    const currentElementsLength = drawingElements.length;

    for (let i = currentElementsLength - 1; i >= 0; i--) {
      const el = drawingElements[i];

      if (el.type === "figure") {
        // For rotated figures, a more complex hit test is needed.
        // For simplicity, we'll use a bounding box check that expands with ERASER_SIZE.
        // A precise hit test for rotated rectangles would involve transforming the point
        // back to the figure's local, unrotated coordinate system.
        const distanceX = Math.abs(x - (el.x + el.width / 2));
        const distanceY = Math.abs(y - (el.y + el.height / 2));
        const halfWidth = el.width / 2;
        const halfHeight = el.height / 2;

        if (
          distanceX < halfWidth + ERASER_SIZE &&
          distanceY < halfHeight + ERASER_SIZE
        ) {
          drawingElements.splice(i, 1);
          elementsErased = true;
          // console.log("[ERASER] Figure erased.");
          break; // Stop after erasing one figure
        }
      } else if (el.type === "line") {
        // Iterate through line segments for a more accurate eraser
        for (let pIdx = 0; pIdx < el.points.length - 1; pIdx++) {
          const p1 = el.points[pIdx];
          const p2 = el.points[pIdx + 1];

          // Check distance from point (x,y) to line segment (p1, p2)
          // This is a simplified check; a more robust line-point distance
          // algorithm might be needed for very thin lines or small eraser sizes.
          const dist = Math.min(
            Math.hypot(x - p1.x, y - p1.y),
            Math.hypot(x - p2.x, y - p2.y),
          );

          // If the eraser is close to any point on the line
          if (dist <= ERASER_SIZE + el.lineWidth / 2) {
            // Consider line width
            drawingElements.splice(i, 1);
            elementsErased = true;
            // console.log("[ERASER] Line erased.");
            break; // Stop checking this line and move to next element
          }
        }
      }
    }

    if (elementsErased) {
      redrawCanvas();
    }
  };

  // --- Initial drawing context setup ---
  ctx.lineWidth = penWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // --- Event listeners for changing color ---
  colorButtonsContainer
    .querySelectorAll("button")
    .forEach((button: HTMLButtonElement) => {
      button.addEventListener("click", () => {
        currentColor = button.id;
        currentMode = "drawing"; // Switch to drawing mode when selecting a color
        selectedFigure = null; // Deselect any figure
        updateCanvasCursor();
        // console.log(`Color changed to ${currentColor}, drawing mode.`);
      });
    });

  // --- Event listener to clear ALL canvas content ---
  clearButton.addEventListener("click", () => {
    drawingElements.length = 0;
    redrawCanvas();
    // console.log("Canvas cleared.");
    currentMode = "drawing"; // Reset mode after clearing
    selectedFigure = null; // Deselect any figure
    updateCanvasCursor();
  });

  // --- Event listener to activate eraser mode ---
  eraserButton.addEventListener("click", () => {
    currentMode = "erasing";
    isDrawing = false; // Ensure drawing is off when in eraser mode
    selectedFigure = null; // Deselect any figure
    updateCanvasCursor();
    // console.log("Mode: Eraser activated.");
  });

  // --- Event listener to activate drawing mode (in case of eraser or moving mode) ---
  drawButton.addEventListener("click", () => {
    currentMode = "drawing";
    isDrawing = false; // Ensure drawing is off initially
    selectedFigure = null; // Deselect any figure
    updateCanvasCursor();
    // console.log("Mode: Drawing activated.");
  });

  // --- Logic for Drag and Drop Figures FROM THE PALETTE (mouse) ---
  let draggedImage: HTMLImageElement | null = null;

  figurePaletteElement.addEventListener("dragstart", (e: DragEvent) => {
    if (e.target instanceof HTMLImageElement) {
      draggedImage = e.target;
      e.dataTransfer?.setData("text/plain", e.target.id); // Use optional chaining for dataTransfer
      e.dataTransfer!.effectAllowed = "copy"; // Non-null assertion as effectAllowed is always there for dragstart
      currentMode = "drawing"; // Reset mode to drawing after dragging from palette
      updateCanvasCursor();
      // console.log(`[DRAG] dragstart: ${draggedImage.id}`);
    }
  });

  canvasElement.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  });

  canvasElement.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    // console.log("[DRAG] Drop event on canvas.");

    if (
      draggedImage &&
      loadedImageObjects[draggedImage.id] &&
      loadedImageObjects[draggedImage.id].complete
    ) {
      const rect = canvasElement.getBoundingClientRect();
      const imgWidth = DEFAULT_FIGURE_SIZE;
      const imgHeight = DEFAULT_FIGURE_SIZE;

      const x = e.clientX - rect.left - imgWidth / 2;
      const y = e.clientY - rect.top - imgHeight / 2;

      const newFigure: ImageDrawingElement = {
        type: "figure",
        id: `figure-${Date.now()}`, // Add unique ID
        imageId: draggedImage.id,
        x: x,
        y: y,
        width: imgWidth,
        height: imgHeight,
        rotation: 0, // Explicitly set initial rotation to 0
      };
      drawingElements.push(newFigure);
      redrawCanvas();
      // console.log(
      //   `[DRAG] Figure added: ${newFigure.imageId} at (${x.toFixed(
      //     0
      //   )}, ${y.toFixed(0)}) with size ${imgWidth}x${imgHeight}`
      // );
      draggedImage = null;
      currentMode = "drawing"; // Reset mode after dropping figure
      updateCanvasCursor();
    } else {
      console.warn(
        "[DRAG] Could not drop image: draggedImage is not valid or not loaded (complete=false).",
      );
    }
  });

  // --- Function to detect if a click/tap occurred on a figure ---
  const getFigureAtPosition = (
    x: number,
    y: number,
  ): ImageDrawingElement | null => {
    // console.log(`[getFigureAtPosition] Checking position: (${x}, ${y})`);
    for (let i = drawingElements.length - 1; i >= 0; i--) {
      const el = drawingElements[i];
      if (el.type === "figure") {
        // console.log(
        //   `[getFigureAtPosition] Checking figure at (${el.x}, ${el.y}) with size (${el.width}, ${el.height})`
        // );
        // Simple bounding box check. For rotated figures, a more complex hit test
        // involving inverse rotation transform would be needed for perfect accuracy.
        if (
          x >= el.x &&
          x <= el.x + el.width &&
          y >= el.y &&
          y <= el.y + el.height
        ) {
          // console.log(`[getFigureAtPosition] Figure found: ${el.imageId}`);
          return el;
        }
      }
    }
    // console.log("[getFigureAtPosition] No figure found.");
    return null;
  };

  // --- Public API for the Drawing Application ---
  // These are the methods that will be exposed to the React component
  const getDrawingData = (): string => {
    return JSON.stringify(drawingElements);
  };

  const loadDrawingData = (jsonString: string) => {
    try {
      const loadedElements: DrawingElement[] = JSON.parse(jsonString);
      // Basic validation for loaded elements
      const isValid = loadedElements.every(
        (el) =>
          (el.type === "line" && "points" in el && Array.isArray(el.points)) ||
          (el.type === "figure" &&
            "imageId" in el &&
            "x" in el &&
            "y" in el &&
            "width" in el &&
            "height" in el &&
            typeof el.rotation === "number"), // Validate rotation for figures
      );

      if (isValid) {
        // Clear current elements and load new ones
        drawingElements.length = 0; // Clear existing elements
        loadedElements.forEach((el) => drawingElements.push(el));
        redrawCanvas();
        // console.log("Drawing data loaded successfully.");
      } else {
        console.error("Invalid drawing data format during loading.");
      }
    } catch (error) {
      console.error("Error parsing drawing data:", error);
    }
  };

  const getImagesLoadedPromise = (): Promise<void> | null => {
    return imagesLoadedPromise;
  };

  // Return the public API
  return {
    getDrawingData,
    loadDrawingData,
    getImagesLoadedPromise,
  };
}; // End of initDrawingApp
